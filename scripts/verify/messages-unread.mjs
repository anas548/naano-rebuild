// Verifies the unread-message indicator: a badge on the sidebar Messages nav
// item, bold+dot on each unread conversation row, and - the part that was
// actually broken - both clearing LIVE when a thread is opened, with no page
// reload (Next.js layouts persist across a same-page ?thread= navigation and
// don't refetch on their own; the fix revalidates the layout specifically).
//
// Requires a running dev server (npm run dev) and DATABASE_URL_POOLED in the
// environment. Creates and then deletes its own throwaway accounts
// (brand-unread-*/creator-unread-*@example.com) - safe to re-run.
//
//   node scripts/verify/messages-unread.mjs

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
const brandEmail = `brand-unread-${stamp}@example.com`;
const creatorEmail = `creator-unread-${stamp}@example.com`;

const browser = await chromium.launch({ executablePath: CHROME, headless: true });
const errors = [];
function trackErrors(page) {
  page.on("console", (msg) => msg.type() === "error" && errors.push(`[${page.url()}] ${msg.text()}`));
  page.on("pageerror", (err) => errors.push(`[${page.url()}] ${String(err)}`));
}

async function run() {
  const creatorPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  trackErrors(creatorPage);

  await creatorPage.goto(`${BASE}/signup/creator/email`);
  await creatorPage.fill("#firstName", "unread");
  await creatorPage.fill("#lastName", "creator");
  await creatorPage.fill("#email", creatorEmail);
  await creatorPage.fill("#password", "password123");
  await creatorPage.click("button[type=submit]");
  await creatorPage.waitForURL("**/signup/creator/linkedin", { timeout: 10000 });
  await creatorPage.fill("#linkedinUrl", "https://www.linkedin.com/in/unreadcreator");
  await creatorPage.click("button[type=submit]");
  await creatorPage.waitForURL("**/signup/creator/profile", { timeout: 10000 });
  await creatorPage.waitForLoadState("networkidle");
  await creatorPage.selectOption("#country", "FR");
  await creatorPage.locator("button", { hasText: /^B2B$/ }).first().click();
  await creatorPage.click("button[type=submit]");
  await creatorPage.waitForURL("**/signup/creator/price", { timeout: 10000 });
  await creatorPage.waitForLoadState("networkidle");
  await creatorPage.fill("input[name=pricePerPost]", "120");
  await creatorPage.click("button[type=submit]");
  await creatorPage.waitForURL("**/signup/creator/professional", { timeout: 10000 });

  // First visit to /creator triggers ensureConversations, opening the
  // NaanoBot thread - it should already show as unread.
  await creatorPage.goto(`${BASE}/creator`);
  await creatorPage.waitForLoadState("networkidle");

  const sidebarBadge = () => creatorPage.locator("aside a[href='/creator/messages'] span[aria-label*='unread']");
  if ((await sidebarBadge().count()) === 0) {
    throw new Error("expected an unread badge from NaanoBot's greeting on first visit");
  }
  console.log("PASS unread badge shows on Messages nav without ever visiting Messages");

  // Brand invites the creator and sends a message - a second real thread.
  const brandPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  trackErrors(brandPage);

  await brandPage.goto(`${BASE}/signup/brand/email`);
  await brandPage.fill("#firstName", "unread");
  await brandPage.fill("#lastName", "brand");
  await brandPage.fill("#email", brandEmail);
  await brandPage.fill("#password", "password123");
  await brandPage.click("button[type=submit]");
  await brandPage.waitForURL("**/signup/brand/website", { timeout: 10000 });
  await brandPage.fill("#website", "notion.so");
  await brandPage.click("button[type=submit]");
  await brandPage.waitForURL("**/signup/brand/icp", { timeout: 10000 });
  await brandPage.click("button[type=submit]");
  await brandPage.waitForURL("**/signup/brand/matching", { timeout: 10000 });
  await brandPage.waitForURL("**/brand", { timeout: 10000 });

  await brandPage.goto(`${BASE}/brand/creators?tab=marketplace`);
  await brandPage.waitForLoadState("networkidle");
  const creatorCard = brandPage
    .locator("h3:has-text('unread creator')")
    .locator("xpath=ancestor::div[contains(@class,'rounded-2xl')]")
    .first();
  await creatorCard.locator("button:has-text('Add')").click();
  await waitUntil(async () => (await creatorCard.locator("text=Invited").count()) > 0);

  await brandPage.goto(`${BASE}/brand/messages`);
  await brandPage.waitForLoadState("networkidle");
  const brandThreadLink = brandPage.locator("a[href^='?thread=']", { hasText: "unread creator" }).first();
  const brandThreadHref = await brandThreadLink.getAttribute("href");
  await brandThreadLink.click();
  await brandPage.waitForURL(`**${brandThreadHref}`, { timeout: 15000 });
  await brandPage.waitForLoadState("networkidle");
  await brandPage.fill("input[name=body]", "Welcome aboard, excited to work together!");
  await brandPage.locator("button[aria-label='Send message']").click();
  await waitUntil(async () => (await brandPage.locator("text=Welcome aboard").count()) > 0);
  console.log("PASS brand invited the creator and sent a message");

  await creatorPage.goto(`${BASE}/creator`);
  await creatorPage.waitForLoadState("networkidle");
  const badge2Text = await sidebarBadge().first().textContent().catch(() => null);
  if (badge2Text !== "2") throw new Error(`expected badge '2' (NaanoBot + brand thread), got: ${badge2Text}`);
  console.log("PASS sidebar badge counts both unread threads (2)");

  await creatorPage.goto(`${BASE}/creator/messages`);
  await creatorPage.waitForLoadState("networkidle");
  const dotCountBefore = await creatorPage.locator("aside div.min-h-0 a span[aria-label='Unread']").count();
  if (dotCountBefore !== 1) throw new Error(`expected exactly 1 still-unread row (the other auto-opened), got ${dotCountBefore}`);

  // The critical check: click the still-unread row and confirm BOTH the
  // list AND the sidebar badge update live, with no reload.
  const stillUnreadRow = creatorPage
    .locator("aside div.min-h-0 a", { has: creatorPage.locator("span[aria-label='Unread']") })
    .first();
  const stillUnreadHref = await stillUnreadRow.getAttribute("href");
  await stillUnreadRow.click();
  await creatorPage.waitForURL(`**${stillUnreadHref}`, { timeout: 15000 });
  await creatorPage.waitForLoadState("networkidle");

  const dotCountAfter = await creatorPage.locator("aside div.min-h-0 a span[aria-label='Unread']").count();
  if (dotCountAfter !== 0) throw new Error("expected the list to show zero unread rows after opening the last one");
  console.log("PASS conversation list clears its own unread indicator on open");

  const sidebarCleared = await waitUntil(async () => (await sidebarBadge().count()) === 0, { timeout: 8000 });
  if (!sidebarCleared) {
    throw new Error("sidebar badge did NOT clear after opening the conversation, without a reload - this is the bug");
  }
  console.log("PASS sidebar badge clears live after opening the conversation, with NO page reload");

  await creatorPage.goto(`${BASE}/creator`);
  await creatorPage.waitForLoadState("networkidle");
  if ((await sidebarBadge().count()) !== 0) throw new Error("expected no unread badge after both threads were opened");
  console.log("PASS badge stays cleared on a fresh navigation too");

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
