# 0010 — staging trunk, feature branches, ~300-line commits

**Status:** Accepted · 2026-08-07

## Context

The repo is public and worked on incrementally. The requirement is frequent,
small commits and a working branch that is not `main`.

## Decision

**Branches**

- `main` — release checkpoints only. Merged into at phase boundaries.
- `staging` — the working trunk. Day-to-day work lands here.
- `feat/<name>` — cut from `staging` for each sizable feature, merged back into
  `staging` when the feature is complete and typechecking.

Planned feature branches:

| Branch | Covers |
|---|---|
| `feat/design-system` | Tailwind/Geist tokens, strings, RNR atoms |
| `feat/expenses-core` | MMKV repository, store, selectors |
| `feat/auth` | PIN gate and login |
| `feat/navigation` | expo-router shell and native tabs |
| `feat/dashboard` | Summary tiles, list, charts |
| `feat/chat` | Gemini client, digest, chat UI |
| `feat/settings` | API key override, logout, reset |

**Commits**

- Commit and push roughly every **300 lines** of code.
- `pnpm typecheck` must pass first — there is no test suite, so this is the only
  automated guard.
- Conventional-commit prefixes (`feat:`, `chore:`, `fix:`, `docs:`) with a
  scope where useful.

## Consequences

**Good.** Small commits keep the history reviewable and make bisecting cheap.
Feature branches keep `staging` releasable and isolate risky work — notably the
NativeWind/RNR compatibility gamble in ADR 0005, which is confined to
`feat/design-system`.

**Bad.** More branch bookkeeping than a solo project strictly needs, and merge
commits accumulate. Acceptable given the explicit request for feature branches.

**Constraint.** Because the repo is public, every push is immediately visible.
`.env` must stay ignored (ADR 0004), and any accidental secret commit requires
history rewriting plus key rotation — not just a follow-up deletion commit.
