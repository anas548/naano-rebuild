# Verification scripts

Playwright-against-a-real-browser scripts that exercise specific flows end to
end, against a running dev server and the real database. Not a full test
suite — a record of how the trickier features in this repo were actually
verified, kept so a bug fix or a review can re-run the exact check rather
than trust a screenshot.

Each script is self-contained: it creates its own throwaway accounts
(`*-<script>-<timestamp>@example.com`), runs the flow, asserts on what the
page actually shows, and deletes what it created in a `finally` block —
including on failure. Safe to re-run any time; never touches demo (`@naano.demo`)
or real user accounts.

## Running one

```bash
npm run dev                              # in one terminal
node --env-file=.env scripts/verify/<script>.mjs   # in another
```

Needs `playwright-core` and `pg` (both already project dependencies) and a
system Chrome — override with `CHROME_PATH` if it isn't at
`/usr/bin/google-chrome`. Override the target with `BASE_URL` if the dev
server isn't on `localhost:3000`.

## What's here

| Script | Covers |
| --- | --- |
| `collaboration-loop.mjs` | The core marketplace loop: brand invites a creator, the wallet gate blocks accepting until topped up, accept → submit a post link → approve, and the creator's Earnings reflect it |
| `withdraw.mjs` | The withdraw flow: over-withdrawing is rejected, a partial withdrawal draws down the available pool and shows Paid in Recent activity, "Withdraw all" fills the exact remainder, everything persists across a reload |
| `messages-unread.mjs` | The unread-message indicator: sidebar badge and per-conversation dot, and specifically that both clear **live** when a thread is opened, with no page reload |
| `linkedin-scrape.mjs` | LinkedIn identity enrichment at signup: a real profile's name/photo (via `og:title`/`og:image`) overwrite the typed signup name and show up everywhere a creator's avatar appears — onboarding preview, topbar, My card, the public card page, and the brand-facing Marketplace card — plus that a profile that won't resolve falls back silently and never blocks onboarding |

If you fix a bug in one of these areas, extend the matching script rather
than writing a one-off that gets thrown away — that's the whole point of
keeping them.
