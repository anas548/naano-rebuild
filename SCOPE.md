# Scope

What is actually built, what is deliberately faked, and what has not been
started. The aim is that nothing in this rebuild silently pretends to be more
than it is.

Work has run one feature at a time: build it, verify it in a real browser
against `recon/`, fix what the comparison exposes, then move on. Both sides
are now fully built — the marketplace loop runs end to end, from a brand
signing up through to a creator's earnings updating.

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
| **Collaborations (creator side)** | Tabbed table of the creator's deals with live counts. **Accept/decline** an invitation, **submit** the LinkedIn post link once active (editable until approved) — all real actions, not just a status display |
| **Analytics** | Reads the profile's real public-LinkedIn figures. Since import is paused these are genuinely zero/pending, which is what the reference shows |
| **Earnings** | Totals, six-month chart and recent activity derived from **completed collaborations**; an Earning row, where present, decides the payout stage |
| **Withdrawals** | A real, functional withdraw form (`src/lib/earnings.ts`, `src/app/actions/withdrawals.ts`): server-validated against the actual available balance (not just a browser `max`), a partial withdrawal draws down the pool via `available = earned − everything ever withdrawn` (no `Earning` rows need to change), resolves instantly to a `Withdrawal` row with status `PAID` — matching the Stripe "instant transfer" copy — and shows in Recent activity with a real Paid badge and a negative amount. "Withdraw all" fills the exact remainder, not the original total. Demo money, real ledger: no payment processor moves anything, but nothing about the flow is a dead end |
| **Community** | Slack and LinkedIn-visibility panels, plus a campaign leaderboard ranking real creator rows by reach |
| **Messages** | Real threads per collaboration, shared between the creator and brand inboxes (one `MessagesView` component, two pages) — a message either side sends appears in the other's inbox immediately, membership is enforced server-side |
| **Unread messages** | A `ConversationRead` row per (conversation, user) tracks when each side last opened a thread; a conversation is unread when its latest message postdates that mark (or there's no mark) and wasn't sent by the viewer. The sidebar's Messages nav item shows a live count badge, and each conversation row shows bold text + a dot until opened — both update in place on click, no reload, via a server action that revalidates the persisted layout (not just the page) |
| **Affiliate program** | Both Invite brands and Invite creators views; the creator invite link is genuinely gated on having published a card |
| **Brand onboarding** | Website → value prop &amp; ICP → AI matching, all three steps persisting to `Brand`/`Icp` as they go, including a real starter `Campaign` seeded from the edited brief |
| **Brand app shell** | Sidebar (7 tabs), top bar with the real wallet balance, resume-mid-onboarding and cross-role guards |
| **Brand Overview** | Hello banner, 4 stat cards, and a To do list reading real `Collaboration`/`Post` rows — applications to review and submitted posts to approve show up here, not just on Collaborations |
| **Brand Campaigns** | Create (draft or launch), list with All/Active/Draft/Completed tabs and live creator/published/budget counts, and a detail page that edits the brief, budget, status and `openToApplications`, plus a roster table of that campaign's real `Collaboration` rows |
| **Creator Marketplace** | Real `CreatorProfile` rows (`onboardingCompleted: true`), filterable by industry, country and max price; "Add" invites a creator to one of the brand's own active campaigns, creating a real `Collaboration` at `INVITED` priced at the creator's rate plus Naano's margin. Deliberately no ICP-match-score badge here — see below |
| **Collaborations (brand side)** | Same deal rows the creator sees, from the brand's end, with All/Active/Invitations received/Invitations sent/To do/Completed tabs. **Accept/decline** an application (wallet-gated — see Billing), **approve** a submitted post to complete the collaboration |
| **Billing** | Real `Brand.balanceCents`, an instant top-up (custom amount or +€2,500/+€10,000 presets) that writes a `TOP_UP` invoice, and an invoices table (All/Top-ups/Bookings) |
| **The wallet gate** | Accepting an invitation or application (whichever side does it) checks the brand's balance and, if sufficient, debits it and writes a `BOOKING` invoice in one transaction. Insufficient balance blocks the accept with a role-appropriate message — the brand's points at Billing, the creator's explains the brand needs to top up |
| **Money moving for real** | Once a brand approves a submitted post, the collaboration completes and — because the Earnings page already treats a `COMPLETED` collaboration with no `Earning` row as fully available — the creator's Earnings total updates immediately. No `Earning` row is created for this path on purpose |
| **Brand Results** | Analytics/Leads/Posts tabs. Analytics reads real numbers — est. reach, qualified clicks, committed budget (from `ACTIVE`/`COMPLETED` `Collaboration.amountCents`) and a 6-month chart, all genuinely zero until posts exist. Posts lists every real `Post` a creator has submitted, with a link to view it. Leads is an honest empty state, since there's no tracking pixel behind it |

## Stubbed on purpose

Present in the UI and convincing, but not real. Each was an explicit decision.

| Thing | What it does | Why |
| --- | --- | --- |
| **Auth strength** | Cookie holds the raw user id, unsigned | Agreed lightweight approach. **Anyone who can set a cookie can impersonate any user** — must be replaced before anything real ships |
| **OAuth buttons** | LinkedIn and Google buttons are inert | Out of scope for stub auth; only email is wired |
| **LinkedIn import** | URL is validated and stored, nothing is fetched; the "temporarily paused" notice shows | Agreed to hardcode as paused. Consequence: follower counts and post metrics stay at zero |
| **AI matching** | Onboarding step 3 and the Creators tab's "AI Matching" view are both static: a cloud hero, a prompt box and 4 suggested prompts generated from the brand's real ICP titles, but typing or clicking any of them shows an honest "isn't wired up yet, try the Marketplace" notice rather than fake results. No model call anywhere | Explicit decision: Creator Marketplace is the one functional discovery path; AI Matching stays UI-only because the user has a different real-matching plan later. No badge, no invented match score |
| **Website analysis** | A canned per-domain lookup (`src/lib/website-analysis.ts`) returns a value proposition and 3 ICPs for a handful of recognisable domains (apple.com, lemlist.com, stripe.com, notion.so, figma.com); anything else gets a generic B2B fallback. Nothing is actually fetched or crawled. Everything is editable on the next step | Explicit decision: canned, editable, beats either a blank form or pretending to be a real analysis |
| **Payments** | Money is fully modelled but nothing moves | Demo only, no payment processor |
| **Match scores** | Not computed yet | Intended to be derived from ICP/industry overlap at render time |
| **Avatar menu items** | Integrations, Settings, Guided tour render but do nothing | Only sign-out is wired |
| **"Add a bundle"** | Inert button on the price step | Bundles are not modelled |
| **EN/FR switch, notifications bell** | Presentational | No i18n or notification system |
| **Bank transfer payout** | The option renders but stays disabled ("No account holder on file") | No bank-detail capture form is built; Stripe is the one functional payout method — see below |
| **Community actions** | "Join the Slack community" and "Publish my card" are presentational | No Slack workspace or LinkedIn publishing integration |
| **Affiliate 25% / 3 months** | Both affiliate views render and links copy | Referral attribution and reward tracking are not implemented, so the stats read zero. Links point at the real signup routes with a `ref` tag rather than 404ing |
| **Email verification** | Brand signup goes straight through | The 6-digit code screen exists in recon but is not built |
| **1,000-follower gate** | Not enforced; every creator sees open campaigns | The reference gates Opportunities behind 1,000 followers, but LinkedIn import is paused so the count is always 0 and nobody could ever pass it. Dropped by decision rather than left as a dead end |
| **Post approval, no revision loop** | A brand can only Approve a submitted post, not send it back for changes | Keeps the state machine to what was asked (creator submits, brand approves); the creator can still edit the link themselves before approval |
| **`NEEDS_ACTION` status / `dueDate` field** | Defined in the schema, never produced | "Post submitted, awaiting brand approval" is derived (an `ACTIVE` collaboration with a linked `Post`) rather than a status of its own, so its meaning doesn't depend on which side is looking. `dueDate` was never wired into any flow, so the Collaborations table drops that column rather than showing a permanent "—" |

## Not built

| Area | Notes |
| --- | --- |
| **Post metric ingestion, tracking pixel** | `Post.impressions/reactions/comments/qualifiedClicks` are modelled and displayed on both Results and Earnings, but nothing ever writes a non-zero value into them — there's no LinkedIn API call and no pixel. Genuinely zero, not hidden |
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
- **Results "Performance over time" chart** — bars, not the line-with-dots in
  the reference, matching the chart style already used on creator Earnings.
  The underlying data is real either way; this is a rendering choice.

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
