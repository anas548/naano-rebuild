// Verifies the creator withdraw flow end to end: a completed collaboration
// produces real available earnings, over-withdrawing is rejected, a partial
// withdrawal correctly draws down the available pool and appears in Recent
// activity with a Paid status, "Withdraw all" fills the exact remainder, and
// everything persists across a reload.
//
// Requires a running dev server (npm run dev) and DATABASE_URL_POOLED in the
// environment. Creates and then deletes its own throwaway accounts
// (brand-withdraw-*/creator-withdraw-*@example.com) - safe to re-run.
//
//   node scripts/verify/withdraw.mjs

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
const brandEmail = `brand-withdraw-${stamp}@example.com`;
const creatorEmail = `creator-withdraw-${stamp}@example.com`;

const browser = await chromium.launch({ executablePath: CHROME, headless: true });
const errors = [];
function trackErrors(page) {
  page.on("console", (msg) => msg.type() === "error" && errors.push(`[${page.url()}] ${msg.text()}`));
  page.on("pageerror", (err) => errors.push(`[${page.url()}] ${String(err)}`));
}

async function run() {
  // === Setup: full loop to get real, available earnings ====================
  const brandPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  trackErrors(brandPage);

  await brandPage.goto(`${BASE}/signup/brand/email`);
  await brandPage.fill("#firstName", "withdraw");
  await brandPage.fill("#lastName", "brand");
  await brandPage.fill("#email", brandEmail);
  await brandPage.fill("#password", "password123");
  await brandPage.click("button[type=submit]");
  await brandPage.waitForURL("**/signup/brand/website", { timeout: 10000 });
  await brandPage.fill("#website", "figma.com");
  await brandPage.click("button[type=submit]");
  await brandPage.waitForURL("**/signup/brand/icp", { timeout: 10000 });
  await brandPage.click("button[type=submit]");
  await brandPage.waitForURL("**/signup/brand/matching", { timeout: 10000 });
  await brandPage.waitForURL("**/brand", { timeout: 10000 });

  const creatorPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  trackErrors(creatorPage);

  await creatorPage.goto(`${BASE}/signup/creator/email`);
  await creatorPage.fill("#firstName", "withdraw");
  await creatorPage.fill("#lastName", "creator");
  await creatorPage.fill("#email", creatorEmail);
  await creatorPage.fill("#password", "password123");
  await creatorPage.click("button[type=submit]");
  await creatorPage.waitForURL("**/signup/creator/linkedin", { timeout: 10000 });
  await creatorPage.fill("#linkedinUrl", "https://www.linkedin.com/in/withdrawcreator");
  await creatorPage.click("button[type=submit]");
  await creatorPage.waitForURL("**/signup/creator/profile", { timeout: 10000 });
  await creatorPage.waitForLoadState("networkidle");
  await creatorPage.selectOption("#country", "US");
  await creatorPage.locator("button", { hasText: /^SaaS$/ }).first().click();
  await creatorPage.click("button[type=submit]");
  await creatorPage.waitForURL("**/signup/creator/price", { timeout: 10000 });
  await creatorPage.waitForLoadState("networkidle");
  await creatorPage.fill("input[name=pricePerPost]", "300");
  await creatorPage.click("button[type=submit]");
  await creatorPage.waitForURL("**/signup/creator/professional", { timeout: 10000 });
  console.log("PASS brand + creator onboarded, price=€300/post");

  await brandPage.goto(`${BASE}/brand/creators?tab=marketplace`);
  await brandPage.waitForLoadState("networkidle");
  const creatorCard = brandPage
    .locator("h3:has-text('withdraw creator')")
    .locator("xpath=ancestor::div[contains(@class,'rounded-2xl')]")
    .first();
  await creatorCard.locator("button:has-text('Add')").click();
  await waitUntil(async () => (await creatorCard.locator("text=Invited").count()) > 0);

  await brandPage.goto(`${BASE}/brand/billing`);
  await brandPage.waitForLoadState("networkidle");
  await brandPage.click("button:has-text('+ €10,000')");
  await waitUntil(async () => (await brandPage.textContent("body")).includes("10,000"));

  await creatorPage.goto(`${BASE}/creator/collaborations`);
  await creatorPage.waitForLoadState("networkidle");
  await creatorPage.locator("button:has-text('Accept')").first().click();
  await waitUntil(async () => (await creatorPage.locator("button:has-text('Accept')").count()) === 0, { timeout: 10000 });

  await creatorPage.locator("input[name=linkedinUrl]").first().fill("https://www.linkedin.com/posts/withdrawcreator_hi-activity-1");
  await creatorPage.locator("button:has-text('Submit')").first().click();
  await waitUntil(async () => (await creatorPage.locator("text=Waiting for approval").count()) > 0);

  await brandPage.goto(`${BASE}/brand/collaborations`);
  await brandPage.waitForLoadState("networkidle");
  await brandPage.locator("button:has-text('Approve')").first().click();
  const approved = await waitUntil(
    async () => (await brandPage.locator("button:has-text('Approve')").count()) === 0,
    { timeout: 15000 },
  );
  if (!approved) throw new Error("Approve button never resolved - approval didn't complete");
  console.log("PASS collaboration completed, creator should have €300 available");

  // === Withdraw flow =========================================================
  const availableCard = creatorPage
    .locator("text=Available now")
    .locator("xpath=ancestor::div[contains(@class,'rounded-xl')]")
    .first();

  // Cross-tab + DB read timing: poll rather than assume the first load caught up.
  const reflects300 = await waitUntil(async () => {
    await creatorPage.goto(`${BASE}/creator/earnings`);
    await creatorPage.waitForLoadState("networkidle");
    const t = await availableCard.locator("p.font-display").textContent().catch(() => "");
    return t.includes("300");
  }, { timeout: 15000, interval: 1000 });
  if (!reflects300) throw new Error("expected €300 available before any withdrawal, never showed up");
  console.log("PASS available balance reflects the completed collaboration");

  // Withdrawing more than available is rejected (server-validated, not just
  // browser input clamping, so the error is our own styled message).
  await creatorPage.fill("input[name=amount]", "500");
  await creatorPage.click("button:has-text('Confirm withdrawal')");
  const overLimitError = await waitUntil(async () => (await creatorPage.locator("text=/You can withdraw up to/").count()) > 0);
  if (!overLimitError) throw new Error("expected an over-limit error for withdrawing more than available");
  console.log("PASS withdrawing more than available is rejected with a clear message");

  // Partial withdrawal of €100.
  await creatorPage.fill("input[name=amount]", "100");
  await creatorPage.click("button:has-text('Confirm withdrawal')");
  const confirmed1 = await waitUntil(async () => (await creatorPage.locator("text=Withdrawal confirmed").count()) > 0, { timeout: 10000 });
  if (!confirmed1) throw new Error("expected a withdrawal-confirmed message after a valid partial withdrawal");
  console.log("PASS partial withdrawal of €100 confirmed");

  const availableAfterPartial = await availableCard.locator("p.font-display").textContent();
  if (!availableAfterPartial.includes("200")) throw new Error("expected €200 available after withdrawing €100, got: " + availableAfterPartial);
  console.log("PASS available balance decreased by exactly the withdrawn amount");

  if (!(await creatorPage.locator("text=Withdrawal to Stripe").count())) {
    throw new Error("expected a 'Withdrawal to Stripe' row in Recent activity");
  }
  console.log("PASS withdrawal appears in Recent activity");

  const paidBadge = creatorPage.locator("li", { has: creatorPage.locator("text=Withdrawal to Stripe") }).locator("text=Paid");
  if (!(await paidBadge.count())) throw new Error("expected the withdrawal row to show a Paid status badge");
  console.log("PASS withdrawal shows a Paid status badge");

  // "Withdraw all" fills the exact remainder, not the original total.
  await creatorPage.click("button:has-text('Withdraw all')");
  const amountValue = await creatorPage.inputValue("input[name=amount]");
  if (amountValue !== "200") throw new Error("expected 'Withdraw all' to fill the remaining €200.00, got: " + amountValue);
  await creatorPage.click("button:has-text('Confirm withdrawal')");
  const confirmed2 = await waitUntil(async () => (await creatorPage.locator("text=Withdrawal to Stripe").count()) === 2, { timeout: 10000 });
  if (!confirmed2) throw new Error("expected a second withdrawal row after withdrawing the remainder");
  console.log("PASS 'Withdraw all' withdrew the exact remainder, second withdrawal row appears");

  const availableAfterAll = await availableCard.locator("p.font-display").textContent();
  if (!/€0(\.00)?$/.test(availableAfterAll.trim())) throw new Error("expected €0 available after withdrawing everything, got: " + availableAfterAll);

  // Right after a successful withdrawal the form shows the success message,
  // not the empty-state hint (state.success takes priority) - check the
  // empty state on a fresh load instead, where useActionState resets.
  await creatorPage.reload();
  await creatorPage.waitForLoadState("networkidle");
  if (!(await creatorPage.locator("text=Nothing available to withdraw yet").count())) {
    throw new Error("expected the empty-state message on a fresh load once available balance is €0");
  }
  console.log("PASS available balance reaches €0 and the form shows the empty state on a fresh load");

  if (!(await creatorPage.locator("button:has-text('Confirm withdrawal')").isDisabled())) {
    throw new Error("expected Confirm withdrawal to be disabled once nothing is available");
  }
  console.log("PASS Confirm withdrawal disables itself once available is €0");

  await creatorPage.reload();
  await creatorPage.waitForLoadState("networkidle");
  const rowsAfterReload = await creatorPage.locator("text=Withdrawal to Stripe").count();
  if (rowsAfterReload !== 2) throw new Error("expected 2 withdrawal rows to persist after reload, got: " + rowsAfterReload);
  console.log("PASS both withdrawals persist after a full reload");

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
