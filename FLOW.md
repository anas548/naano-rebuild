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
| `/creator/opportunities` | Placeholder |
| `/creator/collaborations` | Placeholder |
| `/creator/analytics` | Placeholder |
| `/creator/community` | Placeholder |
| `/creator/earnings` | Placeholder |
| `/creator/affiliate` | Placeholder |
| `/creator/messages` | Placeholder |

**My card** is where a creator maintains their storefront: headline, country,
industries and net price, with the preview updating as they type. Because the
onboarding wizard covers the same fields, this doubles as the place to change
them later. The Deal Link resolves to a real public page at `/c/<slug>`.

### Intended creator journey beyond this point *(not built)*

```
Opportunities   open campaigns, gated behind 1,000 followers in the reference
    └─ apply → Collaboration (APPLIED)
Collaborations  brand invitations and accepted applications; publish the post
    └─ post published → Post row, metrics tracked
Earnings        AWAITING_RELEASE → AVAILABLE → withdraw → IN_TRANSIT → PAID
                payout by bank transfer or Stripe
```

## Brand journey

Signing up as a brand works and creates a `User` + `Brand`, but lands on a
placeholder dashboard. Everything below is **not built**.

### Intended onboarding

```
/signup/brand           choose signup method
/signup/brand/email     name, business email, password, how-did-you-hear  ← built
        ↓
email verification      6-digit code                                      ← not built
        ↓
step 1 of 3   website URL — analysed to infer the product
step 2 of 3   value proposition + 3 ICPs, editable; starter creator brief
step 3 of 3   AI matching — loads, then opens the dashboard
```

Per agreed scope, AI matching **just loads and then opens the dashboard**. There
is no model call; the website analysis and ICPs would be seeded demo content.

`Brand.name` stays null until the website step, which is why it is nullable.

### Intended brand dashboard

| Tab | Purpose |
| --- | --- |
| Overview | Activation stats, to-do list, suggested creators |
| Creators | AI matching chat + marketplace browse — **this is where listed creators appear** |
| Campaigns | Campaign list with creators, published count, committed budget |
| Collaborations | The same deal rows creators see, from the brand side |
| Results | Reach, qualified clicks, per-creator attribution, tracking pixel |
| Messages | Opens once a booking is accepted |
| Billing | Wallet balance, top-ups, invoices |

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
