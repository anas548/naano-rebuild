# Architecture

How this rebuild is put together, and why. For what is and isn't implemented,
see [SCOPE.md](SCOPE.md).

## Stack

| Layer | Choice | Why |
| --- | --- | --- |
| Framework | Next.js 16, App Router | Server components keep dashboard data fetching next to the UI that renders it; server actions avoid hand-writing an API layer for forms |
| Language | TypeScript | — |
| Styling | Tailwind v4 | Requires Node 20+, which is why `.nvmrc` exists |
| Components | shadcn/ui | See the Base UI note below |
| ORM | Prisma 7 | — |
| Database | PostgreSQL on Neon | Pooled and direct connections, see below |
| Passwords | bcrypt | See stub auth below |

### shadcn/ui now ships on Base UI, not Radix

This bites on first contact. Buttons compose with `render={<Link/>}` rather than
`asChild`, and the accordion takes `defaultValue` as an **array** instead of
`type="single"`. Anything rendering as an anchor also needs
`nativeButton={false}`, or it silently loses native button semantics — a real
accessibility bug that no typecheck catches.

### Two database URLs

Prisma 7 requires a driver adapter at runtime, which maps cleanly onto Neon's
two endpoints:

- `DATABASE_URL` — direct connection, used by the CLI for migrations. Set in
  `prisma7.config.ts`.
- `DATABASE_URL_POOLED` — pooled connection, used by the app at runtime through
  `PrismaPg` in `src/lib/prisma.ts`.

Prisma 7 also moved connection config out of `schema.prisma` into
`prisma7.config.ts`, so the `datasource` block deliberately has no `url`.

## Data model

One `User` identity splits by role into one of two profiles. `Collaboration` is
the hinge: both dashboards render the same rows, each from its own side.

```
User ──┬── Brand ──── Icp            (3 per brand, from website analysis)
       │      └────── Campaign ──┐
       │                          ├── Collaboration ── Post      (metrics)
       └── CreatorProfile ────────┘         │
                  │                         ├── Earning          (creator side)
                  └── Industry (m:n)        └── Conversation ── Message

Money:  Brand.balanceCents + Invoice   |   Earning → Withdrawal → PayoutMethod
```

`Collaboration.status` covers the full deal lifecycle — `INVITED`, `APPLIED`,
`ACTIVE`, `NEEDS_ACTION`, `DECLINED`, `COMPLETED` — which is why the brand's
"Invitations sent" and the creator's "Applications sent" are the same rows read
from opposite ends.

### Decisions worth knowing

**Money is integer euro cents, everywhere.** No floats.

**Creators set a *net* price.** The signup screen says "This is your net price
per post", so the creator's number is what they receive and Naano's margin goes
*on top* for the brand. `Collaboration` stores both `amountCents` (brand pays)
and `creatorNetCents` (creator receives), so changing the rate later never
rewrites historical deals. The rate lives in `src/lib/pricing.ts`.

**`Brand.name` is nullable.** At signup we genuinely don't know the company
name — it arrives from the website analysis step later in brand onboarding.
Modelling it as required would have meant inventing a placeholder.

**Match scores are not stored.** The reference shows "90% ICP" and "97/100
Matching" on creator cards. These are intended to be computed deterministically
from industry/ICP overlap at render time, so they can't go stale when a brand
edits its ICP, and no migration is needed.

**`onboardingCompleted` is the marketplace listing flag.** A creator becomes
visible to brands once they have at least one industry and a price above zero.
Both the onboarding wizard and the My card editor set it.

## Authentication (stub, by agreement)

Auth is deliberately lightweight and **must not ship as-is**.

- The session is the **user id in an httpOnly cookie**. No signing, no session
  table, no JWT.
- **Anyone who can set a cookie can impersonate any user.** This is called out
  in a comment in `src/lib/session.ts`.
- **Passwords are still bcrypt hashed.** Even in a stub, plaintext credential
  handling is not a pattern worth establishing in a codebase.
- Sign-in returns **one error message** for both unknown email and wrong
  password, so the form can't be used to enumerate accounts.
- OAuth buttons (LinkedIn, Google) are inert. Only the email path works.

### Two Next.js behaviours that caused real bugs

**Layouts and pages render in parallel.** A `redirect()` in a layout does *not*
stop the page body from executing, so a page that assumes the layout already
bounced unauthenticated users will crash on a null user. Every page calls
`requireUser()` for itself; the lookup is wrapped in React `cache()` so it still
costs one query per request.

**React 19 resets a form after its action resolves.** A failed sign-in therefore
wiped the email field too. Failed submissions now echo back what was typed
(never the password) and repopulate via `defaultValue`.

## Conventions

- Server actions live in `src/app/actions/`, one file per domain.
- Anything importing `src/lib/session.ts` or `src/lib/creator.ts` is server-only,
  enforced by the `server-only` package.
- The marketplace card is **one component**, `CreatorCard`, with a `tone` prop.
  The blue variant appears in signup, the violet variant in the dashboard.
- Colours are sampled from the reference screenshots rather than guessed —
  `#2a64ea` marketing blue, `#4a00f6` app violet, `#dd005c` avatar, `#00b14e`
  success.

### Theme caveat

The recon screenshots show the signed-in app in **violet**, but the live site
now appears to use **blue** throughout. This rebuild follows recon. It is a
one-token change in `src/app/globals.css` if that turns out to be wrong.

## Verification approach

Typechecking and linting do not catch rendering bugs. Work is checked by driving
a real browser with `playwright-core` against the system Chrome, taking
screenshots, and comparing them against `recon/` — often by sampling pixels or
extracting pixel maps to get exact colours and dimensions.

Three defects found this way that no static check would have surfaced: creator
card avatars painting *behind* their card header (a stacking-context bug), the
whole landing header rendering at two-thirds scale, and the Base UI
`nativeButton` accessibility warning above.
