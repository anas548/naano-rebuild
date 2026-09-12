// Verifies the assistant bar's wiring WITHOUT ever calling the real
// DeepSeek API: submitting an empty query short-circuits in
// askAssistantAction before any network call (both askBasicAssistant and
// rankOpportunitiesForCreator are only reached with a non-empty query), so
// this exercises the full form -> server action -> panel round trip, the
// pathname-aware placeholder text, the chevron collapse/expand toggle, and
// that AssistantProvider/OpportunitiesList render without crashing on
// /creator/opportunities, all for zero API cost.
//
// Does NOT verify an actual model response - see the header comments in
// scripts/verify/ai-matching.mjs about live-testing costs. Run that one
// manually, sparingly, when you actually need to confirm a live answer.
//
//   node scripts/verify/assistant-wiring.mjs

import { chromium } from "playwright-core";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const CHROME = process.env.CHROME_PATH ?? "/usr/bin/google-chrome";

async function waitUntil(fn, { timeout = 10000, interval = 300 } = {}) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (await fn()) return true;
    await new Promise((r) => setTimeout(r, interval));
  }
  return false;
}

const browser = await chromium.launch({ executablePath: CHROME, headless: true });
const errors = [];

async function run() {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on("console", (msg) => msg.type() === "error" && errors.push(`[${page.url()}] ${msg.text()}`));
  page.on("pageerror", (err) => errors.push(`[${page.url()}] ${String(err)}`));

  await page.goto(`${BASE}/signin`);
  await page.fill("#email", "demo-creator-eric.djavid@naano.demo");
  await page.fill("#password", "demo-password");
  await page.click("button[type=submit]");
  await page.waitForURL("**/creator", { timeout: 10000 });
  await page.waitForLoadState("networkidle");
  console.log("PASS signed in as a demo creator");

  // Generic placeholder on Overview (not the Opportunities-specific one).
  const genericPlaceholder = await page
    .locator("input[aria-label='What would you like to do?']")
    .getAttribute("placeholder");
  if (genericPlaceholder !== "What would you like to do?") {
    throw new Error(`expected the generic placeholder on Overview, got: ${genericPlaceholder}`);
  }
  console.log("PASS generic placeholder shown outside Opportunities");

  // Submit empty - no API call is made, but the action still round-trips.
  await page.click("button[aria-label='Ask']");
  const errorShown = await waitUntil(
    async () => (await page.locator("text=Type a question first").count()) > 0,
    { timeout: 5000 },
  );
  if (!errorShown) throw new Error("expected 'Type a question first.' after an empty submit");
  console.log("PASS empty submit round-trips through the real server action, panel shows the error");

  // Chevron toggle collapses and reopens the panel.
  await page.click("button[aria-label='Collapse']");
  const collapsed = await waitUntil(
    async () => (await page.locator("text=Type a question first").count()) === 0,
    { timeout: 3000 },
  );
  if (!collapsed) throw new Error("expected the panel to collapse after clicking the chevron");
  console.log("PASS chevron collapses the panel");

  await page.click("button[aria-label='Expand']");
  const reopened = await waitUntil(
    async () => (await page.locator("text=Type a question first").count()) > 0,
    { timeout: 3000 },
  );
  if (!reopened) throw new Error("expected the panel to reopen after clicking the chevron again");
  console.log("PASS chevron reopens the panel");

  // Opportunities page: pathname-aware placeholder, and the page/context
  // render without crashing with no ranking present yet.
  await page.goto(`${BASE}/creator/opportunities`);
  await page.waitForLoadState("networkidle");
  const oppPlaceholder = await page
    .locator("input[aria-label='What would you like to do?']")
    .getAttribute("placeholder");
  if (!oppPlaceholder?.toLowerCase().includes("opportunity")) {
    throw new Error(`expected the Opportunities-specific placeholder, got: ${oppPlaceholder}`);
  }
  console.log("PASS placeholder changes to the Opportunities-specific prompt");

  const cardCount = await page.locator("article").count();
  console.log("Opportunity cards rendered (no ranking applied yet):", cardCount);

  // Empty submit on this page exercises the CREATOR + /creator/opportunities
  // branch in the action too (still short-circuits before any API call).
  await page.click("button[aria-label='Ask']");
  const oppErrorShown = await waitUntil(
    async () => (await page.locator("text=Type a question first").count()) > 0,
    { timeout: 5000 },
  );
  if (!oppErrorShown) throw new Error("expected the same empty-query error on Opportunities");
  console.log("PASS empty submit on Opportunities round-trips without touching the ranking branch's API call");

  console.log("CONSOLE/PAGE ERRORS:", errors.length ? errors : "none");
}

try {
  await run();
} finally {
  await browser.close();
}
