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

## Trying it out

The creator side is fully built; on the brand side, onboarding and the app
shell are built, the rest of the dashboard is not yet. The quickest path
through it:

1. Go to `/signup` and choose **I'm a creator**
2. Sign up with email — OAuth buttons are intentionally inert
3. Walk the four onboarding steps: LinkedIn URL, country and industries, price
   per post, then the optional professional information step
4. Land on the creator dashboard, and open **My card** to edit and preview your
   marketplace card
5. Your public card is live at `/c/<your-card-slug>`
6. Run `npm run db:demo`, then open **Opportunities** and apply to a campaign

To see the brand side, go to `/signup` and choose **I'm a brand**, sign up with
email, then try the 3-step onboarding: enter any website (try `apple.com`,
`lemlist.com`, `stripe.com`, `notion.so` or `figma.com` for hand-written
results — anything else gets a generic fallback), edit the value proposition
and 3 ICPs, then continue through the AI Matching loading step to land on the
dashboard. Past Overview, the rest of the brand tabs are not built yet.

### Demo brand login

`npm run db:demo` seeds 3 brands with a completed onboarding, a €10,000
wallet balance, and open campaigns, so a fresh signup isn't the only way to
see a populated brand account:

| Email | Password |
| --- | --- |
| `demo-brand-lemlist@naano.demo` | `demo-password` |
| `demo-brand-blogseo@naano.demo` | `demo-password` |
| `demo-brand-leadbay@naano.demo` | `demo-password` |

## A note on `.agent-logs/`

This repo was built with an AI coding agent, and every prompt and final response
is captured automatically to [`.agent-logs/`](.agent-logs/). Those logs are
committed on purpose and are part of the submission. They are never edited or
tidied after the fact. See [CAPTURE-TEST.md](CAPTURE-TEST.md).
