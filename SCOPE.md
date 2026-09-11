# Scope

What is actually built, what is deliberately faked, and what has not been
started. The aim is that nothing in this rebuild silently pretends to be more
than it is.

Work has run one feature at a time: build it, verify it in a real browser
against `recon/`, fix what the comparison exposes, then move on. That is why the
creator side is deep and the brand side is untouched, rather than both being
half-done.

## Fully built

Real behaviour, backed by the database.

| Area | Notes |
| --- | --- |
| **Landing page** | Nine sections plus header and footer; copy transcribed from the recon PDF rather than paraphrased |
| **Sign in / sign up entry** | Role picker, both method screens, email forms |
| **Email auth** | Signup creates `User` + `Brand`/`CreatorProfile`; signin verifies bcrypt hash; role-based redirect |
| **Session + route guards** | httpOnly cookie; unauthenticated users bounce to `/signin`; a brand cannot open the creator dashboard |
| **Creator onboarding** | All four steps plus the optional professional step and card reveal, each persisting as it goes |
| **Creator dashboard shell** | Sidebar, top bar, avatar menu matching the real one |
| **Creator Overview** | Stats, creator card, launch guide — all reading real profile data |
| **My card** | Edit/Preview, live preview, saves headline, country, industries, price |
| **Public card page** | `/c/<slug>`, a real page so the Deal Link resolves |
| **Marketplace listing flag** | Completing a card sets `onboardingCompleted`, the exact condition the brand marketplace will select on |
| **Opportunities** | Lists open brand campaigns and applying creates a real `Collaboration` (status `APPLIED`), priced from the creator's net rate plus Naano's margin |
| **Collaborations** | Tabbed table of the creator's deals with live counts; applications made in Opportunities appear here immediately |
| **Analytics** | Reads the profile's real public-LinkedIn figures. Since import is paused these are genuinely zero/pending, which is what the reference shows |
| **Earnings** | Totals, six-month chart and recent activity derived from **completed collaborations**; an Earning row, where present, decides the payout stage |
| **Community** | Slack and LinkedIn-visibility panels, plus a campaign leaderboard ranking real creator rows by reach |
| **Messages** | Real threads per collaboration, with the brand and creator both as participants; messages persist and membership is enforced server-side |
| **Affiliate program** | Both Invite brands and Invite creators views; the creator invite link is genuinely gated on having published a card |
| **Brand onboarding** | Website → value prop &amp; ICP → AI matching, all three steps persisting to `Brand`/`Icp` as they go, including a real starter `Campaign` seeded from the edited brief |
| **Brand app shell** | Sidebar (7 tabs), top bar with the real wallet balance, resume-mid-onboarding and cross-role guards |
| **Brand Overview** | Hello banner, 4 stat cards reading real `Collaboration`/`Post` rows (all zero until Campaigns/Marketplace exist to populate them) |

## Stubbed on purpose

Present in the UI and convincing, but not real. Each was an explicit decision.

| Thing | What it does | Why |
| --- | --- | --- |
| **Auth strength** | Cookie holds the raw user id, unsigned | Agreed lightweight approach. **Anyone who can set a cookie can impersonate any user** — must be replaced before anything real ships |
| **OAuth buttons** | LinkedIn and Google buttons are inert | Out of scope for stub auth; only email is wired |
| **LinkedIn import** | URL is validated and stored, nothing is fetched; the "temporarily paused" notice shows | Agreed to hardcode as paused. Consequence: follower counts and post metrics stay at zero |
| **AI matching** | Onboarding step 3 is a real loading beat, then marks onboarding complete and opens the dashboard — no model call. The Creators tab's own AI Matching view (chat UI, suggested prompts) is not built yet; that's Creator Marketplace/Campaigns work | Agreed demo behaviour by explicit decision: Marketplace is the functional discovery path, AI Matching stays UI-only because the user has a different real-matching plan later |
| **Website analysis** | A canned per-domain lookup (`src/lib/website-analysis.ts`) returns a value proposition and 3 ICPs for a handful of recognisable domains (apple.com, lemlist.com, stripe.com, notion.so, figma.com); anything else gets a generic B2B fallback. Nothing is actually fetched or crawled. Everything is editable on the next step | Explicit decision: canned, editable, beats either a blank form or pretending to be a real analysis |
| **Payments** | Money is fully modelled but nothing moves | Demo only, no payment processor |
| **Match scores** | Not computed yet | Intended to be derived from ICP/industry overlap at render time |
| **Avatar menu items** | Integrations, Settings, Guided tour render but do nothing | Only sign-out is wired |
| **"Add a bundle"** | Inert button on the price step | Bundles are not modelled |
| **EN/FR switch, notifications bell** | Presentational | No i18n or notification system |
| **Payout methods and withdrawal** | Bank transfer / Stripe options and the withdraw form render but are disabled | No payment processor; LinkedIn and banking are not connected in this clone |
| **Community actions** | "Join the Slack community" and "Publish my card" are presentational | No Slack workspace or LinkedIn publishing integration |
| **Affiliate 25% / 3 months** | Both affiliate views render and links copy | Referral attribution and reward tracking are not implemented, so the stats read zero. Links point at the real signup routes with a `ref` tag rather than 404ing |
| **Email verification** | Brand signup goes straight through | The 6-digit code screen exists in recon but is not built |
| **1,000-follower gate** | Not enforced; every creator sees open campaigns | The reference gates Opportunities behind 1,000 followers, but LinkedIn import is paused so the count is always 0 and nobody could ever pass it. Dropped by decision rather than left as a dead end |

## Not built

| Area | Notes |
| --- | --- |
| **Creator Marketplace / AI Matching (Creators tab)** | Browsing real creators and inviting one to a campaign; the AI Matching chat UI |
| **Campaigns page** | Campaign list/detail UI; onboarding already creates one real starter campaign per brand |
| **Collaborations (brand side)** | Accepting/declining, wallet-gated booking, marking a submitted post complete |
| **Results, Messages, Billing (brand side)** | Pages not built yet; `AppTopbar` already shows the real wallet balance |
| **Bookings** | No way to invite a creator to a campaign yet |
| **Post metrics and attribution** | `Post` is modelled; no ingestion, no Results page, no tracking pixel |
| **Sidebar collapse** | The live site collapses the sidebar to icons; ours is fixed-width |
| **Assistant pill** | Every reference screenshot has a "What would you like to do?" pill; not built, and not asked for |
| **"NAANO MCP / Connect" breadcrumb** | Shown at the top of every brand screenshot; out of scope by explicit decision, so not built |
| **"Get started" checklist pill** | The `1/3 Discover the Market...` progress pill in the brand top bar; decorative, not built |

## Known deviations from the reference

Honest differences, not oversights.

- **Cloud photography** — the hero, CTA and footer backdrops are layered CSS
  gradients. The real cloud imagery is not in the recon set.
- **Customer logos** — lemlist, folk., LEADBAY, ringover, attio and the case
  study logos are wordmarks, not brand SVGs.
- **Avatars and post images** — gradient placeholders throughout.
- **The naano mark** — hand-traced from a pixel map of the original. Two offset
  wedges plus the blue dot; close but not the real asset.
- **Fonts** — Outfit for headings, Inter for body. The real site uses something
  tighter that could not be identified from screenshots.
- **Violet vs blue** — recon shows the signed-in app in violet; the live site now
  appears blue. This follows recon. One-token change if wrong.
- **Industry chip order** — alphabetical here, curated in the reference.
  Matching it needs an ordering column on `Industry`.
- **Professional info form** — "Complete now" expands an inline form. The
  reference only shows the choice screen, so the fields behind it are a
  judgment call.

## Data notes

- `npm run db:seed` is required. Onboarding asks for industries and the list is
  empty without it.
- `npm run db:demo` seeds three demo brands (lemlist, BlogSEO, LEADBAY) with
  ICPs and four open campaigns. This exists because the brand side cannot create
  campaigns yet, and without it Opportunities has nothing to list. It is a
  development tool, not fake UI: the campaigns it writes are ordinary rows the
  brand side will later manage.
- The populated Opportunities list has **no reference screenshot** — only the
  locked state was captured — so the campaign card layout is an original design
  in the app's visual language.
- `npm run db:demo` also seeds twelve demo creators, which is what populates the
  Community leaderboard and will later populate the brand marketplace. Their
  follower and reach figures are illustrative demo data, not imported from
  LinkedIn.
