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

**LinkedIn import is hardcoded as paused** — but identity is real. Submitting
the URL fetches the public profile's `og:title`/`og:image` meta tags (the
same ones a browser or a chat app reads to unfurl a pasted link — no login,
no LinkedIn API) and, when that succeeds, overwrites the typed name and sets
a real avatar photo, used everywhere a creator's picture appears from then
on. Steps 3 and 4 still carry the "import is temporarily paused, continue
with a Basic card" notice, because the *data* import — posts, followers,
engagement — genuinely never runs; that stays at zero. Any scrape failure
(private profile, timeout, blocked request, markup change) is silent: the
typed name and an initials avatar are always there as a fallback, so this
never blocks onboarding.

Setting a price completes onboarding. That flips `onboardingCompleted`, which
does two things: the dashboard launch guide moves to "1 of 1 steps complete",
and **the creator becomes listable in the brand marketplace**.

### Creator dashboard

| Route | State |
| --- | --- |
| `/creator` | Built — stats, creator card, launch guide |
| `/creator/card` | Built — Edit/Preview, Deal Link panel |
| `/creator/opportunities` | Built — open campaigns, apply |
| `/creator/collaborations` | Built — tabbed table of the creator's deals, with real accept/decline and post-submission actions |
| `/creator/analytics` | Built — public LinkedIn figures, pending while import is paused |
| `/creator/community` | Built — Slack, LinkedIn visibility, campaign leaderboard |
| `/creator/earnings` | Built — totals and activity from completed collaborations, plus a real withdraw flow (partial, "withdraw all", over-limit rejected, instant simulated Stripe payout) |
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
dashboard. A NaanoBot thread exists from signup. Declined deals get no thread,
and membership is checked server-side on both reading a thread and posting to
it.

Unread state is tracked per (conversation, user) in `ConversationRead` — a
thread is unread when its latest message is newer than that mark (or there
is no mark yet) and wasn't sent by the viewer. Both sidebars show a live
count badge on the Messages nav item, and each conversation row in the list
is bold with a dot until opened. Opening a thread marks it read two ways: the
page itself marks it as part of rendering (so a direct visit or refresh is
always correct), and clicking a row also fires a small server action that
revalidates the *layout* specifically — without that second part, the
sidebar badge would only catch up on the next full navigation, since Next.js
layouts persist across a same-page `?thread=` change and don't refetch on
their own. The click action fires unconditionally, even for a row the same
page load already marked read via auto-selecting it, because that's exactly
the case where the badge was computed a moment earlier in that navigation and
hasn't caught up — skipping the action there would leave it stuck.

**Collaborations** is the other end of Opportunities: applying there puts a row
here under *Applications sent*, carrying the creator's net figure and what
happens next. Invitations from a brand are grouped under *Needs action*, since
the next move is the creator's and the reference has no separate invitations
tab. That "action" is real:

- An **`INVITED`** row shows **Accept**/**Decline**. Accepting is the one
  moment a collaboration becomes `ACTIVE` — see the wallet gate below — so it
  can fail with a message telling the creator the brand's wallet is short,
  rather than always succeeding.
- An **`ACTIVE`** row with no post yet shows a link-input + **Submit**. Once a
  link is submitted the row shows "Waiting for approval" with an **Edit link**
  option, so a creator can correct it right up until the brand approves.
- Everything else — `APPLIED`, `DECLINED`, `COMPLETED` — is read-only, exactly
  as it was before this chunk.

Whichever side of an `INVITED`/`APPLIED` pair clicks Accept, the same
transaction runs: check the brand's `balanceCents` against the deal's
`amountCents`, and if there's enough, debit the wallet, write a `BOOKING`
invoice, and flip the collaboration to `ACTIVE` — all in one
`prisma.$transaction`. There's no separate "commit the money" step; accepting
*is* committing the money.

**Earnings** picks this up automatically. Once a brand approves a submitted
post, the collaboration becomes `COMPLETED` with no `Earning` row created —
and the Earnings page already treated a `COMPLETED` collaboration with no
`Earning` row as fully `AVAILABLE` (see its own comment), so the creator's
totals update the moment the brand clicks Approve, with no extra wiring.

**Withdrawing** is real, not a dead end: a creator withdraws part or all of
their available balance to a simulated Stripe payout. The available pool is
`sum(AVAILABLE earnings) − sum(every Withdrawal ever made)` — deliberately
not tied to any specific collaboration, so a partial withdrawal never needs
to split one. Over-withdrawing is rejected server-side (not just a browser
`max`, so the error is the app's own styled message, not a native tooltip).
A withdrawal resolves instantly to `PAID` — matching the "Instant transfer"
copy — and shows in Recent activity with a negative amount next to the
positive earnings it drew down. Bank transfer stays an inert stub; "connecting"
Stripe is implicit on the first withdrawal, since there's no real account to
connect in a demo.

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
| `/brand` | Built — hello banner, 4 real stat cards, and a To do list of applications to review and posts to approve |
| `/brand/creators` | Built — two tabs. **AI Matching** is the static cloud hero from the recon: a prompt box and 4 suggested prompts (built from the brand's real ICP titles), but submitting shows an honest "isn't wired up yet, try the Marketplace" notice — no fake results. **Creator Marketplace** is the functional path: real `CreatorProfile` rows (`onboardingCompleted: true`), filterable by industry/country/max price, no ICP-match badge by decision |
| `/brand/campaigns` | Built — list with All/Active/Draft/Completed tabs and live creators/published/budget counts; **Create a campaign** (`/brand/campaigns/new`) saves as draft or launches; the detail page edits the brief/budget/status/`openToApplications` and shows the real roster |
| `/brand/collaborations` | Built — the same deal rows creators see, from the brand side, with All/Active/Invitations received/Invitations sent/To do/Completed tabs. **Accept**/**Decline** an application (wallet-gated), **Approve** a submitted post |
| `/brand/results` | Built — Analytics/Leads/Posts tabs. Analytics: est. reach, qualified clicks (30d), committed budget, a 6-month chart, post performance, and per-creator attribution — all real, all genuinely zero until posts exist. Posts: every real submitted `Post`, with a link. Leads: honest empty state (no pixel) |
| `/brand/messages` | Built — the exact same `MessagesView` component and `Conversation` rows as the creator inbox; a message either side sends shows up in the other's inbox |
| `/brand/billing` | Built — real balance, instant top-up (custom or +€2,500/+€10,000 presets), invoices table (All/Top-ups/Bookings) |

**Inviting a creator** happens from the Marketplace card, not the campaign
page: pick which of the brand's active campaigns to add them to (a `<select>`
if there's more than one), and it creates a real `Collaboration` at `INVITED`,
priced at the creator's net rate plus Naano's margin — the same row the
creator sees under *Needs action* on their own Collaborations tab. Inviting
doesn't touch the wallet; accepting does — see the wallet gate above.

**Accepting an application** on Collaborations runs the identical transaction
the creator's Accept button runs (same helper, same gate): if the brand's
balance covers the deal, it debits the wallet, writes a `BOOKING` invoice, and
activates the collaboration. If not, the error links straight to Billing
("Top up"). Declining just sets the row to `DECLINED`.

**Approving a submitted post** is the other half of the creator's Submit
action: the brand sees a "View post" link to whatever URL the creator
entered, and one click completes the collaboration — no revision loop, by
decision (the creator can still edit their link before it's approved).

**Billing's top-up is instant and always succeeds** — it's demo money, there's
no payment processor — but it writes a real `TOP_UP` `Invoice` and increments
`Brand.balanceCents` in the same transaction, so a brand can unblock a stuck
accept in one click without leaving the error message.

**Messages** is the same `Conversation` rows and the same `MessagesView`
component the creator inbox renders — the page just passes `viewerIsCreator:
false` and fetches with the brand's own user id. `ensureConversations` (which
opens a thread per live collaboration, both sides as participants) runs
identically on both pages, so there's nothing brand-specific to wire beyond
the route and the flag.

The sidebar, top bar (with the real `Brand.balanceCents`) and all 7 routes
exist and are guarded by role and onboarding state. All seven are built.

### Where the two sides meet

The join is wired from the creator end. A creator with
`onboardingCompleted = true` is exactly the set the brand marketplace
queries. The two dashboards now genuinely share state rather than mirroring
it: the same `Collaboration` row is a brand's "invitation sent" and a
creator's "invitation received", the same `Conversation` connects both users
to one thread, and the same `Post` a creator submits is what the brand
reviews on Collaborations and reads on Results. Nothing on either side is a
private copy of the other's data.

## Money flow

```
Brand tops up            → Invoice(TOP_UP)  → Brand.balanceCents ↑          built
Either side accepts      → Invoice(BOOKING) → Brand.balanceCents ↓          built
  (wallet-gated,            Collaboration → ACTIVE
   one $transaction)
Brand approves the post  → Collaboration → COMPLETED                        built
                            (no Earning row — the creator's balance is
                             simply the sum of their COMPLETED collabs)
Creator withdraws         → Withdrawal(amount, status: PAID)                built
                             via PayoutMethod (STRIPE only; instant, demo)
```

The brand pays `creatorNetCents` plus Naano's margin; the difference is the
platform's cut (`src/lib/pricing.ts`). Every transition above that moves
money — top-up, booking, the wallet gate that guards booking, and a
withdrawal — runs inside a single `prisma.$transaction`, so nothing can
drift apart. The `Earning` model still exists for a withdrawal-stage concept
(`AWAITING_RELEASE` → `IN_TRANSIT` → `PAID`) but nothing writes one — a
completed collaboration counts as available the moment it's approved, and a
withdrawal resolves straight to `PAID` rather than sitting in transit, since
there's no real bank/Stripe network for it to travel through. `available`
itself is computed, not stored: `getCreatorEarnings()` in `src/lib/earnings.ts`
is the one place both the Earnings page and the withdraw action agree on
what "available" means, so a withdrawal can never validate against one
number and display another.
