# User flows

The journeys through the product, on both sides. Steps marked **(not built)**
are described so the intended shape is clear — see [SCOPE.md](SCOPE.md).

## The marketplace loop

What the whole product is for, in one pass:

```
Brand signs up
   └─ describes itself (website → value prop → 3 ICPs)
        └─ is matched with creators who fit those ICPs
             └─ invites a creator to a campaign at an agreed price per post
                  └─ creator accepts and publishes a LinkedIn post
                       └─ Naano tracks impressions, reactions, clicks
                            └─ brand sees whether it drove pipeline
                                 └─ money moves: brand wallet → creator earnings
                                                 (Naano keeps its margin)
                                      └─ creator withdraws to bank or Stripe
```

Both sides see the same deal from opposite ends: one `Collaboration` row is the
brand's "invitation sent" and the creator's "application/invitation received".

## Shared entry

```
/                     landing page
   ├─ Sign in  → /signin ──────────────→ /creator or /brand, by role
   └─ Sign up  → /signup
                    ├─ "I'm a creator" → /signup/creator
                    └─ "I'm a brand"   → /signup/brand
```

Each role's method screen offers LinkedIn, Google, or email. **Only email
works** — OAuth is inert.

## Creator journey

### Onboarding — built end to end

```
/signup/creator              step 1 of 4 — choose signup method
/signup/creator/email        name, email, password  → creates User + CreatorProfile
/signup/creator/linkedin     step 2 — public LinkedIn profile URL
/signup/creator/profile      step 3 — country + up to 3 industries
/signup/creator/price        step 4 — net price per post
/signup/creator/professional optional — business name / registration
/signup/creator/card         card reveal → "Continue to my profile"
/creator                     dashboard
```

Each step writes to `CreatorProfile` as it goes, so the card preview in the
right-hand panel fills in live: the country flag appears after step 3, the
industries and price after step 4.

**LinkedIn import is hardcoded as paused.** The URL is validated and stored, but
nothing is fetched; steps 3 and 4 carry the "import is temporarily paused,
continue with a Basic card" notice, exactly as the reference does. Because the
import never runs, follower count and post metrics stay at zero.

Setting a price completes onboarding. That flips `onboardingCompleted`, which
does two things: the dashboard launch guide moves to "1 of 1 steps complete",
and **the creator becomes listable in the brand marketplace**.

### Creator dashboard

| Route | State |
| --- | --- |
| `/creator` | Built — stats, creator card, launch guide |
| `/creator/card` | Built — Edit/Preview, Deal Link panel |
| `/creator/opportunities` | Built — open campaigns, apply |
| `/creator/collaborations` | Built — tabbed table of the creator's deals |
| `/creator/analytics` | Built — public LinkedIn figures, pending while import is paused |
| `/creator/community` | Built — Slack, LinkedIn visibility, campaign leaderboard |
| `/creator/earnings` | Built — totals and activity from completed collaborations |
| `/creator/affiliate` | Built — invite brands / invite creators |
| `/creator/messages` | Built — threads per collaboration |

**My card** is where a creator maintains their storefront: headline, country,
industries and net price, with the preview updating as they type. Because the
onboarding wizard covers the same fields, this doubles as the place to change
them later. The Deal Link resolves to a real public page at `/c/<slug>`.

**Opportunities** lists every campaign a brand has opened to applications.
Applying writes a real `Collaboration` at status `APPLIED`, priced from the
creator's net rate plus Naano's margin — the same row the brand will later
accept. The reference gates this tab behind 1,000 followers; that gate is
dropped here, because LinkedIn import is paused and the count never leaves zero.

**Messages** opens a thread per live collaboration with both the creator and the
brand as participants, so the brand reads the same conversation from its own
dashboard once that is built. A NaanoBot thread exists from signup. Declined
deals get no thread, and membership is checked server-side on both reading a
thread and posting to it.

**Collaborations** is the other end of Opportunities: applying there puts a row
here under *Applications sent*, carrying the creator's net figure and what
happens next. Invitations from a brand are grouped under *Needs action*, since
the next move is the creator's and the reference has no separate invitations
tab.

### Intended creator journey beyond this point *(not built)*

```
Brand accepts   → Collaboration ACTIVE; publish the post
    └─ post published → Post row, metrics tracked
Earnings        totals come from COMPLETED collaborations; withdrawal itself
                (bank transfer or Stripe) is not wired
```

## Brand journey

### Onboarding — built end to end

```
/signup/brand              choose signup method
/signup/brand/email        name, business email, password, how-did-you-hear  ← built
        ↓
email verification         6-digit code                                      ← not built
        ↓
/signup/brand/website      step 1 of 3 — website URL
/signup/brand/icp          step 2 of 3 — value proposition + 3 ICPs, editable
/signup/brand/matching     step 3 of 3 — "AI matching" loading beat
        ↓
/brand                     dashboard
```

**Step 1** looks up a small canned table by domain (`src/lib/website-analysis.ts`)
and writes a draft `Brand.name`, `valueProposition` and 3 `Icp` rows —
recognisable domains (apple.com, lemlist.com, stripe.com, notion.so, figma.com)
get hand-written copy; anything else gets a generic B2B fallback. Nothing is
actually crawled.

**Step 2** is a real edit surface, not a read-only review: the value
proposition and all 3 ICP title/descriptions are editable, with a live
"Starter creator brief" preview. Submitting writes the edits back to `Brand`
and `Icp`, and upserts one starter `Campaign` (`"{name} creator brief"`,
`status: ACTIVE`, `openToApplications: true`) whose brief mirrors the edited
text — this is the campaign creators will see on Opportunities once the
Marketplace can invite them to it.

**Step 3** holds on a fake "reading your brief / scanning creators / ranking by
fit" loading beat for ~2 seconds, then marks `Brand.onboardingCompleted = true`
and redirects to `/brand`. No model call, no real matching — per agreed scope.

The `/brand` layout enforces this: an incomplete brand hitting `/brand` or any
finished onboarding route is bounced back to wherever they left off
(`nextOnboardingStep` in `src/lib/brand-onboarding.ts`), the same way signing
back in mid-onboarding resumes rather than dropping onto a broken dashboard.

`Brand.name` stays null until the website step, which is why it is nullable.

### Brand dashboard

| Route | State |
| --- | --- |
| `/brand` | Built — hello banner, 4 real stat cards (creators activated, posts published, profiles engaged, impressions) |
| `/brand/creators` | Built — two tabs. **AI Matching** is the static cloud hero from the recon: a prompt box and 4 suggested prompts (built from the brand's real ICP titles), but submitting shows an honest "isn't wired up yet, try the Marketplace" notice — no fake results. **Creator Marketplace** is the functional path: real `CreatorProfile` rows (`onboardingCompleted: true`), filterable by industry/country/max price, no ICP-match badge by decision |
| `/brand/campaigns` | Built — list with All/Active/Draft/Completed tabs and live creators/published/budget counts; **Create a campaign** (`/brand/campaigns/new`) saves as draft or launches; the detail page edits the brief/budget/status/`openToApplications` and shows the real roster |
| `/brand/collaborations` | Not built — the same deal rows creators see, from the brand side; accept/decline, the wallet gate, and mark-complete live here |
| `/brand/results` | Not built — reach, qualified clicks, per-creator attribution, tracking pixel |
| `/brand/messages` | Not built — reuses the same `Conversation` rows the creator inbox already writes |
| `/brand/billing` | Not built — wallet balance (already shown live in the top bar), top-ups, invoices |

**Inviting a creator** happens from the Marketplace card, not the campaign
page: pick which of the brand's active campaigns to add them to (a `<select>`
if there's more than one), and it creates a real `Collaboration` at `INVITED`,
priced at the creator's net rate plus Naano's margin — the same row the
creator sees under *Needs action* on their own Collaborations tab. Inviting
doesn't touch the wallet; that check is Collaborations' job, next.

The sidebar, top bar (with the real `Brand.balanceCents`) and all 7 routes
exist and are guarded by role and onboarding state; Overview, Creators and
Campaigns are built, Collaborations/Results/Messages/Billing are next.

### Where the two sides meet

The join is already wired from the creator end. A creator with
`onboardingCompleted = true` is exactly the set the brand marketplace will
query. Completing a creator card today is what will make that creator appear
brand-side tomorrow — no further creator-side work needed for that link.

## Money flow *(modelled, not implemented)*

```
Brand tops up        → Invoice(TOP_UP)   → Brand.balanceCents ↑
Brand books creator  → Invoice(BOOKING)  → Collaboration.amountCents committed
                                         → Earning(AWAITING_RELEASE) for creator
Post published+paid  → Earning → AVAILABLE
Creator withdraws    → Withdrawal(PENDING → IN_TRANSIT → PAID)
                       via PayoutMethod (BANK_TRANSFER | STRIPE)
```

The brand pays `creatorNetCents` plus Naano's margin; the difference is the
platform's cut. Wallet balance and the invoice ledger are intended to move in
one transaction so they always reconcile.
