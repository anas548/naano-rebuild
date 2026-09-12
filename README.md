# Naano rebuild

A rebuild of [Naano](https://naano.com), a B2B LinkedIn creator marketplace,
reconstructed from screenshots in [`recon/`](recon/).

Brands sign up, get matched with creators who fit their ideal customer profile,
and book sponsored LinkedIn posts at a price the creator sets. Naano tracks each
post's performance and moves the money: brands top up a wallet, creators
withdraw earnings, Naano takes a margin in between.

> **This is a demo rebuild.** Authentication, AI matching, LinkedIn import and
> payments are deliberately simulated. See [SCOPE.md](SCOPE.md) for exactly
> what is real, what is stubbed, and why.

## Documentation

| Document | What it covers |
| --- | --- |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Stack, data model, and the decisions behind both |
| [FLOW.md](FLOW.md) | User journeys for the creator and brand sides |
| [SCOPE.md](SCOPE.md) | Built vs stubbed vs not built, with reasons |
| [CAPTURE-TEST.md](CAPTURE-TEST.md) | How the agent prompt/response logging works |

## Requirements

- **Node 20+.** Tailwind v4 will not build on Node 18. An `.nvmrc` is included.
- A **PostgreSQL** database. This project was developed against
  [Neon](https://neon.tech), which is where the pooled/direct URL split comes
  from.
- An **OpenAI API key** with available credit, only if you want to try AI
  Matching (`/brand/creators`) — everything else runs without one.

## Setup

```bash
nvm use            # picks up .nvmrc -> Node 20
npm install
```

Create `.env` in the repo root with your two connection strings:

```bash
# Direct connection — used for migrations
DATABASE_URL="postgresql://user:password@host/db?sslmode=require"
# Pooled connection — used for app queries at runtime
DATABASE_URL_POOLED="postgresql://user:password@host-pooler/db?sslmode=require"
```

Both are required. If you are not on Neon and have only one connection string,
set both variables to the same value.

Optionally, add an OpenAI key for AI Matching:

```bash
OPENAI_API_KEY="sk-..."
# OPENAI_MODEL="gpt-4o-mini"   # optional override, this is the default
```

Without it, `/brand/creators` still shows the AI Matching tab, but a search
returns a clear "isn't configured yet" error instead of results — everything
else in the app is unaffected.

Then set up the database and start the app:

```bash
npm run db:migrate   # apply migrations
npm run db:seed      # seed the 25 industry tags
npm run db:demo      # optional: demo brands + open campaigns
npm run dev          # http://localhost:3000
```

The seed is **not optional** — creator onboarding asks you to pick industries,
and without it the list is empty.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build (also regenerates typed routes) |
| `npm run lint` | ESLint |
| `npm run db:migrate` | Create and apply a migration |
| `npm run db:generate` | Regenerate the Prisma client |
| `npm run db:seed` | Seed industry tags |
| `npm run db:demo` | Seed demo brands and open campaigns |
| `npm run db:studio` | Browse the database |

[`scripts/verify/`](scripts/verify/) holds a handful of Playwright scripts
that check specific flows end to end (the collaboration loop, withdrawals,
unread messages) against a running dev server — not a full test suite, a
record of how the trickier parts were actually verified. See its own README.

## Trying it out

Both sides are fully built and the marketplace loop runs end to end. The
quickest path through it:

1. Go to `/signup` and choose **I'm a creator**
2. Sign up with email — OAuth buttons are intentionally inert
3. Walk the four onboarding steps: LinkedIn URL (try a real public profile,
   e.g. `linkedin.com/in/williamhgates` — the name and photo get picked up
   for real), country and industries, price per post, then the optional
   professional information step
4. Land on the creator dashboard, and open **My card** to edit and preview your
   marketplace card
5. Your public card is live at `/c/<your-card-slug>`
6. Run `npm run db:demo`, then open **Opportunities** and apply to a campaign

To see the brand side, go to `/signup` and choose **I'm a brand**, sign up with
email, then try the 3-step onboarding: enter any website (try `apple.com`,
`lemlist.com`, `stripe.com`, `notion.so` or `figma.com` for hand-written
results — anything else gets a generic fallback), edit the value proposition
and 3 ICPs, then continue through the AI Matching loading step to land on the
dashboard. From there:

1. Open **Campaigns** — your onboarding brief is already a live campaign — and
   create a second one to see draft vs. launch
2. Open **Creators** — on the default **AI Matching** tab, click a suggested
   prompt (or type your own) and it returns real, reasoned picks from real
   creators (needs `OPENAI_API_KEY` with credit — see Requirements); switch
   to **Creator Marketplace**, filter by industry/country/price, and **Add**
   a creator to a campaign directly
3. Open **Collaborations** and try **Accept** — it'll be blocked, because a
   fresh brand's wallet is empty
4. Open **Billing** and click **+ €10,000** — instant, no real payment
   processor behind it
5. Back on Collaborations, **Accept** now succeeds — the wallet debits and a
   `BOOKING` invoice appears in Billing
6. Sign in as the creator you invited (or use a demo one, see below), open
   **Collaborations**, and **Submit** a LinkedIn post link
7. Back on the brand's Collaborations, **Approve** the post — the
   collaboration completes and the creator's **Earnings** total updates
   immediately
8. Open **Results** to see the real submitted post under the Posts tab, and
   the committed budget/booking count on Analytics
9. Open **Messages** on either side and send something — it shows up in the
   other side's inbox, since it's the same conversation
10. As the creator, open **Earnings** and **Withdraw** part of the balance —
    it's an instant simulated Stripe payout, shows up in Recent activity as
    Paid, and "Withdraw all" always fills the exact remainder

### Demo brand login

`npm run db:demo` seeds 3 brands with a completed onboarding, a €10,000
wallet balance, and open campaigns, so a fresh signup isn't the only way to
see a populated brand account:

| Email | Password |
| --- | --- |
| `demo-brand-lemlist@naano.demo` | `demo-password` |
| `demo-brand-blogseo@naano.demo` | `demo-password` |
| `demo-brand-leadbay@naano.demo` | `demo-password` |

The same seed creates 12 demo creators, all on `demo-password`, e.g.
`demo-creator-eric.djavid@naano.demo` (see `prisma/demo.ts` for the full list)
— useful for step 6 above without a second signup.

## A note on `.agent-logs/`

This repo was built with an AI coding agent, and every prompt and final response
is captured automatically to [`.agent-logs/`](.agent-logs/). Those logs are
committed on purpose and are part of the submission. They are never edited or
tidied after the fact. See [CAPTURE-TEST.md](CAPTURE-TEST.md).
