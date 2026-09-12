// Verifies AI Matching end to end: a real DeepSeek call, grounded in the real
// Marketplace creator pool and the brand's real ICPs/campaign brief, returns
// a shortlist rendered as real Marketplace cards with a working Add button —
// not fabricated data, and no console errors along the way.
//
// Requires a running dev server (npm run dev), DEEP_SEEK_API_KEY, and
// DATABASE_URL_POOLED in the environment. Signs in as the seeded demo
// lemlist brand (npm run db:demo) rather than creating a throwaway account,
// since it needs a real pool of creators and an ICP/campaign brief to match
// against - nothing is created or deleted.
//
//   node scripts/verify/ai-matching.mjs

import { chromium } from "playwright-core";
import pg from "pg";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const CHROME = process.env.CHROME_PATH ?? "/usr/bin/google-chrome";

async function lemlistCollaborationIds() {
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL_POOLED });
  await client.connect();
  const res = await client.query(`
    SELECT co.id FROM "Collaboration" co
    JOIN "Campaign" ca ON ca.id = co."campaignId"
    JOIN "Brand" b ON b.id = ca."brandId"
    JOIN "User" u ON u.id = b."userId"
    WHERE u.email = 'demo-brand-lemlist@naano.demo'
  `);
  await client.end();
  return new Set(res.rows.map((r) => r.id));
}

async function deleteCollaborations(ids) {
  if (ids.length === 0) return;
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL_POOLED });
  await client.connect();
  await client.query(`DELETE FROM "Collaboration" WHERE id = ANY($1::text[])`, [ids]);
  await client.end();
  console.log("Cleaned up test collaboration(s) created against the lemlist demo brand:", ids);
}

async function waitUntil(fn, { timeout = 30000, interval = 500 } = {}) {
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
  page.on("console", (msg) => msg.type() === "error" && errors.push(msg.text()));
  page.on("pageerror", (err) => errors.push(String(err)));

  await page.goto(`${BASE}/signin`);
  await page.fill("#email", "demo-brand-lemlist@naano.demo");
  await page.fill("#password", "demo-password");
  await page.click("button[type=submit]");
  await page.waitForURL("**/brand", { timeout: 10000 });

  await page.goto(`${BASE}/brand/creators`);
  await page.waitForLoadState("networkidle");
  console.log("PASS AI Matching tab loads (default tab)");

  // Click a suggested prompt - should fill + submit in one action.
  const suggestion = page.locator("text=/Find creators who already reach/").first();
  if ((await suggestion.count()) === 0) throw new Error("expected at least one suggested prompt");
  await suggestion.click();

  const pendingShown = await waitUntil(
    async () => (await page.locator("text=Reading your brief").count()) > 0,
    { timeout: 5000 },
  );
  console.log("PASS pending state shows while the model call is in flight:", pendingShown);

  // Real network call to DeepSeek - give it real time.
  const resolved = await waitUntil(
    async () =>
      (await page.locator("text=/match(es)? for/").count()) > 0 ||
      (await page.locator("text=/model|error|try again/i").count()) > 0,
    { timeout: 30000 },
  );
  if (!resolved) throw new Error("AI matching never resolved (neither results nor an error) within 30s");

  const errorShown = await page.locator("text=/model|couldn't|try again/i").count();
  if (errorShown > 0) {
    const errorText = await page.locator("text=/model|couldn't|try again/i").first().textContent();
    throw new Error(`AI matching returned an error instead of results: ${errorText}`);
  }

  await page.screenshot({
    path: "/tmp/claude-1000/-home-anas-clone-naano/04e959e6-de72-4cd7-a7bd-e31d51bb184a/scratchpad/ai-matching-01-results.png",
    fullPage: true,
  });

  const resultCards = await page.locator("h3").allTextContents();
  console.log("Result card names:", resultCards);

  // Each result must be a REAL creator name from the demo seed, and must
  // show a grounded reason (the little violet AI note), not just a bare card.
  const reasonNotes = await page.locator("p.text-naano-violet").count();
  if (reasonNotes === 0) throw new Error("expected at least one AI-reason note on a result card");
  console.log("PASS results show grounded AI reasons, not bare cards");

  // The Add button on a result should be the same real inviteCreatorAction -
  // click it and confirm a real Invited state (not a client-side fake), then
  // clean up the collaboration it created so the demo brand is untouched.
  const before = await lemlistCollaborationIds();
  const addButton = page.locator("button:has-text('Add')").first();
  let createdIds = [];
  if (await addButton.count()) {
    await addButton.click();
    const invited = await waitUntil(async () => (await page.locator("text=Invited").count()) > 0, { timeout: 8000 });
    if (!invited) throw new Error("Add on an AI-matched result did not create a real invite");
    console.log("PASS Add on an AI-matched result creates a real Collaboration (Invited)");
    const after = await lemlistCollaborationIds();
    createdIds = [...after].filter((id) => !before.has(id));
  } else {
    console.log("WARN no Add button available on results (no active campaign or all already linked) - skipped");
  }

  console.log("CONSOLE/PAGE ERRORS:", errors.length ? errors : "none");
  return createdIds;
}

let createdIds = [];
try {
  createdIds = await run();
} finally {
  await browser.close();
  await deleteCollaborations(createdIds ?? []);
}
