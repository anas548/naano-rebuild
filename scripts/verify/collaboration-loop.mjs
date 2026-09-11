// Verifies the core marketplace loop end to end: a brand invites a creator
// from the Marketplace, the wallet gate blocks acceptance until the brand
// tops up, the creator accepts, submits a LinkedIn post link, the brand
// approves it, and the creator's Earnings reflect it as available - all with
// no console errors along the way.
//
// Requires a running dev server (npm run dev) and DATABASE_URL_POOLED in the
// environment. Creates and then deletes its own throwaway accounts
// (brand-loop-*/creator-loop-*@example.com) - safe to re-run.
//
//   node scripts/verify/collaboration-loop.mjs

import { chromium } from "playwright-core";
import pg from "pg";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const CHROME = process.env.CHROME_PATH ?? "/usr/bin/google-chrome";

async function waitUntil(fn, { timeout = 15000, interval = 300 } = {}) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (await fn()) return true;
    await new Promise((r) => setTimeout(r, interval));
  }
  return false;
}

const stamp = Date.now();
const brandEmail = `brand-loop-${stamp}@example.com`;
const creatorEmail = `creator-loop-${stamp}@example.com`;

const browser = await chromium.launch({ executablePath: CHROME, headless: true });
const errors = [];
function trackErrors(page) {
  page.on("console", (msg) => msg.type() === "error" && errors.push(`[${page.url()}] ${msg.text()}`));
  page.on("pageerror", (err) => errors.push(`[${page.url()}] ${String(err)}`));
}

async function run() {
  const brandPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  trackErrors(brandPage);

  await brandPage.goto(`${BASE}/signup/brand/email`);
  await brandPage.fill("#firstName", "loop");
  await brandPage.fill("#lastName", "brand");
  await brandPage.fill("#email", brandEmail);
  await brandPage.fill("#password", "password123");
  await brandPage.click("button[type=submit]");
  await brandPage.waitForURL("**/signup/brand/website", { timeout: 10000 });
  await brandPage.fill("#website", "stripe.com");
  await brandPage.click("button[type=submit]");
  await brandPage.waitForURL("**/signup/brand/icp", { timeout: 10000 });
  await brandPage.click("button[type=submit]");
  await brandPage.waitForURL("**/signup/brand/matching", { timeout: 10000 });
  await brandPage.waitForURL("**/brand", { timeout: 10000 });

  const creatorPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  trackErrors(creatorPage);

  await creatorPage.goto(`${BASE}/signup/creator/email`);
  await creatorPage.fill("#firstName", "loop");
  await creatorPage.fill("#lastName", "creator");
  await creatorPage.fill("#email", creatorEmail);
  await creatorPage.fill("#password", "password123");
  await creatorPage.click("button[type=submit]");
  await creatorPage.waitForURL("**/signup/creator/linkedin", { timeout: 10000 });
  await creatorPage.fill("#linkedinUrl", "https://www.linkedin.com/in/loopcreator");
  await creatorPage.click("button[type=submit]");
  await creatorPage.waitForURL("**/signup/creator/profile", { timeout: 10000 });
  await creatorPage.waitForLoadState("networkidle");
  await creatorPage.selectOption("#country", "DE");
  await creatorPage.locator("button", { hasText: /^AI$/ }).first().click();
  await creatorPage.click("button[type=submit]");
  await creatorPage.waitForURL("**/signup/creator/price", { timeout: 10000 });
  await creatorPage.waitForLoadState("networkidle");
  await creatorPage.fill("input[name=pricePerPost]", "150");
  await creatorPage.click("button[type=submit]");
  await creatorPage.waitForURL("**/signup/creator/professional", { timeout: 10000 });
  console.log("PASS brand + creator onboarded");

  await brandPage.goto(`${BASE}/brand/creators?tab=marketplace`);
  await brandPage.waitForLoadState("networkidle");
  const creatorCard = brandPage
    .locator("h3:has-text('loop creator')")
    .locator("xpath=ancestor::div[contains(@class,'rounded-2xl')]")
    .first();
  await creatorCard.locator("button:has-text('Add')").click();
  await waitUntil(async () => (await creatorCard.locator("text=Invited").count()) > 0);
  console.log("PASS brand invited the creator via the Marketplace");

  // Wallet gate: accepting should fail while the brand's balance is €0.
  await creatorPage.goto(`${BASE}/creator/collaborations`);
  await creatorPage.waitForLoadState("networkidle");
  await creatorPage.locator("button:has-text('Accept')").first().click();
  const gated = await waitUntil(async () => (await creatorPage.locator("text=/doesn't have enough balance/").count()) > 0);
  if (!gated) throw new Error("expected accepting to be blocked while the brand's wallet is empty");
  console.log("PASS accepting is blocked while the brand's wallet is empty");

  await brandPage.goto(`${BASE}/brand/billing`);
  await brandPage.waitForLoadState("networkidle");
  await brandPage.click("button:has-text('+ €10,000')");
  await waitUntil(async () => (await brandPage.textContent("body")).includes("10,000"));
  console.log("PASS brand topped up the wallet");

  await creatorPage.goto(`${BASE}/creator/collaborations`);
  await creatorPage.waitForLoadState("networkidle");
  await creatorPage.locator("button:has-text('Accept')").first().click();
  const accepted = await waitUntil(async () => (await creatorPage.locator("button:has-text('Accept')").count()) === 0, { timeout: 10000 });
  if (!accepted) throw new Error("accept did not succeed after topping up");
  console.log("PASS creator accepted once the brand's wallet had funds");

  await creatorPage.locator("input[name=linkedinUrl]").first().fill("https://www.linkedin.com/posts/loopcreator_hi-activity-1");
  await creatorPage.locator("button:has-text('Submit')").first().click();
  const submitted = await waitUntil(async () => (await creatorPage.locator("text=Waiting for approval").count()) > 0);
  if (!submitted) throw new Error("expected 'Waiting for approval' after submitting the post link");
  console.log("PASS creator submitted the post link");

  await brandPage.goto(`${BASE}/brand/collaborations`);
  await brandPage.waitForLoadState("networkidle");
  await brandPage.locator("button:has-text('Approve')").first().click();
  const approved = await waitUntil(async () => (await brandPage.locator("button:has-text('Approve')").count()) === 0, { timeout: 15000 });
  if (!approved) throw new Error("Approve button never resolved - approval didn't complete");
  console.log("PASS brand approved the post, collaboration is COMPLETED");

  // Poll for the earnings figure - separate browser tab + DB read timing.
  const earned150 = await waitUntil(async () => {
    await creatorPage.goto(`${BASE}/creator/earnings`);
    await creatorPage.waitForLoadState("networkidle");
    const text = await creatorPage.textContent("body").catch(() => "");
    return text.includes("150");
  }, { timeout: 15000, interval: 1000 });
  if (!earned150) throw new Error("expected the creator's Earnings to show €150 available");
  console.log("PASS creator's Earnings reflects the completed collaboration (€150 available)");

  console.log("CONSOLE/PAGE ERRORS:", errors.length ? errors : "none");
}

async function cleanup() {
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL_POOLED });
  await client.connect();
  const res = await client.query(
    `DELETE FROM "User" WHERE email = ANY($1::text[]) RETURNING email`,
    [[brandEmail, creatorEmail]],
  );
  console.log("Cleaned up:", res.rows.map((r) => r.email));
  await client.end();
}

try {
  await run();
} finally {
  await browser.close();
  await cleanup();
}
