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

## Stubbed on purpose

Present in the UI and convincing, but not real. Each was an explicit decision.

| Thing | What it does | Why |
| --- | --- | --- |
| **Auth strength** | Cookie holds the raw user id, unsigned | Agreed lightweight approach. **Anyone who can set a cookie can impersonate any user** — must be replaced before anything real ships |
| **OAuth buttons** | LinkedIn and Google buttons are inert | Out of scope for stub auth; only email is wired |
| **LinkedIn import** | URL is validated and stored, nothing is fetched; the "temporarily paused" notice shows | Agreed to hardcode as paused. Consequence: follower counts and post metrics stay at zero |
| **AI matching** | Not implemented; intended to load, then open the dashboard | Agreed demo behaviour, no model call |
| **Payments** | Money is fully modelled but nothing moves | Demo only, no payment processor |
| **Match scores** | Not computed yet | Intended to be derived from ICP/industry overlap at render time |
| **Avatar menu items** | Integrations, Settings, Guided tour render but do nothing | Only sign-out is wired |
| **"Add a bundle"** | Inert button on the price step | Bundles are not modelled |
| **EN/FR switch, notifications bell** | Presentational | No i18n or notification system |
| **Affiliate 25% / 3 months** | Copy is shown on My card | Reward tracking is not implemented; "A creator" in the signup dropdown is an inert option with no referral logic behind it |
| **Email verification** | Brand signup goes straight through | The 6-digit code screen exists in recon but is not built |
| **1,000-follower gate** | Not enforced; every creator sees open campaigns | The reference gates Opportunities behind 1,000 followers, but LinkedIn import is paused so the count is always 0 and nobody could ever pass it. Dropped by decision rather than left as a dead end |

## Not built

| Area | Notes |
| --- | --- |
| **Brand onboarding** | Website analysis, value prop, ICPs, AI matching step |
| **Brand dashboard** | Overview, Creators, Campaigns, Collaborations, Results, Messages, Billing — currently a placeholder page |
| **Creator tabs** | Analytics, Community, Earnings, Affiliate, Messages are navigable placeholders |
| **Campaigns and bookings** | No way to create a campaign or invite a creator yet |
| **Messaging** | `Conversation`/`Message` are modelled; no UI |
| **Post metrics and attribution** | `Post` is modelled; no ingestion, no Results page, no tracking pixel |
| **Sidebar collapse** | The live site collapses the sidebar to icons; ours is fixed-width |
| **Assistant pill** | Every reference screenshot has a "What would you like to do?" pill; not built, and not asked for |

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
