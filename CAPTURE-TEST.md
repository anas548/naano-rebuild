# CAPTURE-TEST

Proof that automatic prompt/response capture is installed and working for this repo.

## Tool and model

- **Tool:** Claude Code (VSCode native extension / Claude Agent SDK session)
- **Model:** `claude-sonnet-5` at session start, switched mid-session to `claude-opus-5`.
  There is no separate planner/executor model — one model per turn. The switch is
  visible in the log because the model is recorded per entry, not per session.

## Mechanism

Claude Code **hooks**, configured in [`.claude/settings.json`](.claude/settings.json).

Two lifecycle events, neither of which takes a matcher (they always fire):

| Event | What it captures |
| --- | --- |
| `UserPromptSubmit` | The prompt, verbatim, from the `prompt` field on the hook's stdin JSON |
| `Stop` | The final response, read from the session transcript at `transcript_path` |

Both events invoke [`.claude/hooks/capture.py`](.claude/hooks/capture.py) with an
argument (`prompt` / `stop`). The script:

- reads the hook payload as JSON on stdin
- for prompts, takes the text verbatim — no truncation or cleanup
- for responses, parses the session's JSONL transcript and takes the text content
  of the **last assistant message only**, so thinking, tool calls, file reads and
  intermediate steps are all excluded
- resolves the model from the transcript's last assistant message, so a mid-session
  model switch shows up per entry
- writes one Markdown file per session to `.agent-logs/`, named
  `YYYY-MM-DD_HH-MM-SS_<session-id>.md`

Per-session bookkeeping lives in `.claude/hooks/session_state/` (gitignored — it's
working state, not a log). `.agent-logs/` itself is **not** gitignored and ships
with the repo.

## Log file the canaries landed in

`.agent-logs/2026-09-11_10-41-12_04e959e6-de72-4cd7-a7bd-e31d51bb184a.md`

## Canary 1 — raw entries

```
[LOG_ENTRY type=PROMPT num=1 session=04e959e6-de72-4cd7-a7bd-e31d51bb184a]
timestamp: 2026-09-11T10:41:12.297Z
model: claude-sonnet-5

CAPTURE TEST — 8x assignment, Mohammad Anas


[LOG_ENTRY type=RESPONSE num=1 session=04e959e6-de72-4cd7-a7bd-e31d51bb184a]
timestamp: 2026-09-11T10:41:21.329Z
model: claude-sonnet-5

Canary 1 prompt captured. This response is the payload the Stop hook will grab.
```

## Canary 2 — second session

**Status: still outstanding.** The second-session canary has not been run yet. Work
moved on to the build before it was done, and this file will be updated with the raw
entries once a canary is sent from a fresh session in this repo.

What is already known: hook config is **project-level** (`.claude/settings.json` in
the repo root), so it applies to any session opened against this directory, not just
the one that created it. That was demonstrated in a stronger form than expected —
see below.

## Things that did not work, or surprised me

1. **Assumed a session restart would be required.** The hooks were written *after*
   this session had already started, so I expected them not to fire until a reload,
   and said so to the user. Wrong: the very next prompt was captured immediately.
   Claude Code picks up `.claude/settings.json` dynamically rather than only at
   session start.

2. **Manual dry run before trusting the live hook.** Before relying on the hook
   firing, the script was exercised directly by piping synthetic JSON into it
   (`echo '{"session_id":...}' | python3 .claude/hooks/capture.py prompt`). This
   confirmed the parsing and file format independently of the hook wiring. Those
   dry-run artifacts were deleted before the real canary.

3. **The model is not in the hook payload.** `UserPromptSubmit` and `Stop` receive
   no model field (only `SessionStart` does, and `ANTHROPIC_MODEL` is stale after a
   `/model` switch). The script therefore parses the model out of the transcript's
   last assistant message instead.

4. **First scaffold attempt used `$CLAUDE_PROJECT_DIR`** in the hook command, then
   switched to an absolute path to remove any dependency on that variable being set.
