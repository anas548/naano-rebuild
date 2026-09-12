// Verifies LinkedIn identity enrichment at signup: a real public profile URL
// picks up a name + photo from og:title/og:image and that photo shows up
// everywhere a creator's avatar appears (onboarding preview, topbar, My
// card, the public /c/<slug> page, and the brand-facing Marketplace card) —
// while a URL that won't resolve to a real profile falls back silently and
// never blocks onboarding.
//
// Requires a running dev server (npm run dev) and DATABASE_URL_POOLED in the
// environment. Creates and then deletes its own throwaway accounts
// (creator-scrape-*/brand-scrape-*@example.com) - safe to re-run.
//
//   node scripts/verify/linkedin-scrape.mjs

import { chromium } from "playwright-core";
import pg from "pg";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const CHROME = process.env.CHROME_PATH ?? "/usr/bin/google-chrome";
// A real, long-standing public LinkedIn profile likely to have working
// og:title/og:image — swap if LinkedIn ever locks this one down further.
// Its real name ("Bill Gates") is what the scrape should overwrite the
// typed signup name with, so several checks below match on that.
const REAL_PROFILE = process.env.LINKEDIN_TEST_URL ?? "https://www.linkedin.com/in/williamhgates/";

async function waitUntil(fn, { timeout = 15000, interval = 300 } = {}) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (await fn()) return true;
    await new Promise((r) => setTimeout(r, interval));
  }
  return false;
}

const stamp = Date.now();
const workingEmail = `creator-scrape-working-${stamp}@example.com`;
const failEmail = `creator-scrape-fail-${stamp}@example.com`;
const brandEmail = `brand-scrape-${stamp}@example.com`;

const browser = await chromium.launch({ executablePath: CHROME, headless: true });
const errors = [];
function trackErrors(page) {
  page.on("console", (msg) => msg.type() === "error" && errors.push(`[${page.url()}] ${msg.text()}`));
  page.on("pageerror", (err) => errors.push(`[${page.url()}] ${String(err)}`));
}

async function signupToLinkedInStep(page, email, firstName, lastName) {
  await page.goto(`${BASE}/signup/creator/email`);
  await page.fill("#firstName", firstName);
  await page.fill("#lastName", lastName);
  await page.fill("#email", email);
  await page.fill("#password", "password123");
  await page.click("button[type=submit]");
  await page.waitForURL("**/signup/creator/linkedin", { timeout: 10000 });
}

async function run() {
  // === Case 1: a real profile - name/photo picked up, and shown everywhere =
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  trackErrors(page);
  await signupToLinkedInStep(page, workingEmail, "typed", "name");

  await page.fill("#linkedinUrl", REAL_PROFILE);
  await page.click("button[type=submit]");
  const reachedProfile = await waitUntil(async () => page.url().includes("/signup/creator/profile"), { timeout: 15000 });
  if (!reachedProfile) throw new Error("scraping a real profile should never block onboarding, but it did");
  console.log("PASS onboarding proceeds past the LinkedIn step for a real profile");

  await page.waitForLoadState("networkidle");
  const heading = await page.locator("h3").first().textContent().catch(() => "");
  if (!heading?.includes("Bill Gates")) {
    throw new Error(`expected the scraped name to overwrite what was typed, got: ${heading}`);
  }
  console.log("PASS scraped name ('Bill Gates') overwrites the typed name in the card preview");

  if ((await page.locator("img[src*='licdn.com']").count()) === 0) {
    throw new Error("expected a real photo in the onboarding card preview");
  }
  console.log("PASS onboarding card preview shows the real photo");

  // Finish onboarding to check the rest of the app.
  await page.selectOption("#country", "US");
  await page.locator("button", { hasText: /^B2B$/ }).first().click();
  await page.click("button[type=submit]");
  await page.waitForURL("**/signup/creator/price", { timeout: 10000 });
  await page.waitForLoadState("networkidle");
  await page.fill("input[name=pricePerPost]", "200");
  await page.click("button[type=submit]");
  await page.waitForURL("**/signup/creator/professional", { timeout: 10000 });
  await page.goto(`${BASE}/creator`);
  await page.waitForLoadState("networkidle");

  if ((await page.locator("header img[src*='licdn.com']").count()) === 0) {
    throw new Error("expected the topbar account menu to show the real photo");
  }
  console.log("PASS topbar shows the real photo, not initials");

  await page.goto(`${BASE}/creator/card`);
  await page.waitForLoadState("networkidle");
  if ((await page.locator("img[src*='licdn.com']").count()) === 0) {
    throw new Error("expected a real photo on My card");
  }
  console.log("PASS My card shows the real photo");

  // The Deal Link panel only ever uses the card URL as a clipboard target,
  // never renders it as visible text or a real <a href> - so the slug has
  // to come from the database, not the page.
  const dbForSlug = new pg.Client({ connectionString: process.env.DATABASE_URL_POOLED });
  await dbForSlug.connect();
  const slugRow = await dbForSlug.query(
    `SELECT "cardSlug" FROM "CreatorProfile" cp JOIN "User" u ON u.id = cp."userId" WHERE u.email = $1`,
    [workingEmail],
  );
  await dbForSlug.end();
  const slug = slugRow.rows[0]?.cardSlug;
  if (slug) {
    await page.goto(`${BASE}/c/${slug}`);
    await page.waitForLoadState("networkidle");
    if ((await page.locator("img[src*='licdn.com']").count()) === 0) {
      throw new Error("expected a real photo on the public card page");
    }
    console.log("PASS public /c/<slug> card shows the real photo");
  } else {
    console.log("WARN could not find the cardSlug in the database - skipped that check");
  }

  // Brand-facing Marketplace card.
  const brandPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  trackErrors(brandPage);
  await brandPage.goto(`${BASE}/signup/brand/email`);
  await brandPage.fill("#firstName", "scrape");
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

  await brandPage.goto(`${BASE}/brand/creators?tab=marketplace`);
  await brandPage.waitForLoadState("networkidle");
  const marketplaceCard = brandPage
    .locator("h3:has-text('Bill Gates')")
    .locator("xpath=ancestor::div[contains(@class,'rounded-2xl')]")
    .first();
  const found = await waitUntil(
    async () => (await marketplaceCard.locator("img[src*='licdn.com']").count()) > 0,
    { timeout: 8000 },
  );
  if (!found) throw new Error("expected the brand-facing Marketplace card to show the real photo");
  console.log("PASS brand Marketplace card shows the real photo too");

  // === Case 2: a syntactically valid but nonexistent profile - must fall
  // back silently, never block, never crash =================================
  const failPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  trackErrors(failPage);
  await signupToLinkedInStep(failPage, failEmail, "fallback", "person");

  await failPage.fill("#linkedinUrl", "https://www.linkedin.com/in/this-profile-definitely-does-not-exist-zzz999/");
  await failPage.click("button[type=submit]");
  const reachedProfileFail = await waitUntil(async () => failPage.url().includes("/signup/creator/profile"), { timeout: 15000 });
  if (!reachedProfileFail) throw new Error("a failed scrape should still let onboarding proceed, but it didn't");
  console.log("PASS a nonexistent profile still lets onboarding proceed (silent fallback)");

  await failPage.waitForLoadState("networkidle");
  const fallbackHeading = await failPage.locator("h3").first().textContent().catch(() => "");
  if (!fallbackHeading?.includes("fallback")) {
    throw new Error(`expected the typed name to survive a failed scrape, got: ${fallbackHeading}`);
  }
  console.log("PASS typed name/initials survive when scraping fails, nothing broke");

  console.log("CONSOLE/PAGE ERRORS:", errors.length ? errors : "none");
}

async function cleanup() {
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL_POOLED });
  await client.connect();
  const res = await client.query(
    `DELETE FROM "User" WHERE email = ANY($1::text[]) RETURNING email`,
    [[workingEmail, failEmail, brandEmail]],
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
