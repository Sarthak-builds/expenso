# 0002 — Repository + Zustand revision; React Query for Gemini only

**Status:** Accepted · 2026-08-07

## Context

TanStack Query, Zustand and MMKV were all installed up front. The obvious move
was to wrap the MMKV repository in `useQuery` and treat it like any other data
source. That is wrong here, and the reasons are worth recording because the
instinct to "just use React Query" will recur.

**React Query is an async cache; MMKV is synchronous.** Even with a synchronous
`queryFn`, `useQuery` returns `data === undefined` on first render because it
resolves through the query observer. That produces an empty-state flash on the
dashboard on every mount and every tab switch. The fix — `initialData` — means
reading MMKV synchronously anyway, at which point the library contributes
nothing.

There is also no network, no server, and no second writer. Configuring Query for
this workload means `staleTime: Infinity, gcTime: Infinity, retry: false,
refetchOnWindowFocus: false` — i.e. disabling the library while keeping its
bundle cost. And after a write, truth is already on disk; `invalidateQueries` →
refetch → synchronously re-read the same bytes is a round trip through an async
scheduler to obtain a value already in hand.

`zustand/middleware/persist` was also considered for expenses and rejected: it
re-serialises the entire store on every write (two years of daily entries is
~3,650 records re-stringified per add), hydrates asynchronously (reintroducing
the flash), and pins the whole collection in the JS heap — the exact thing MMKV
exists to avoid.

## Decision

Split by **shape of state**, not by library:

| Tier | Holds | Mechanism |
|---|---|---|
| Repository | Expense records + indexes | Pure synchronous MMKV, no React |
| Store | `{ revision, range }` — **no expense array** | Zustand |
| Derived | Everything the UI renders | `useMemo` on `[range, revision]` |

Mutations call the repository, then `bump()` the revision. Selectors are
`useMemo(() => repo.getInRange(...), [range, revision])` — synchronous on first
render, no cache, no flash.

`persist` **is** correct for `auth`, `settings` and `chat`: small, bounded (chat
capped at 50 messages), written whole anyway.

**React Query is used for exactly one thing: `useMutation` around the Gemini
fetch** — where retries, in-flight state and cancellation are genuinely useful.

## Consequences

**Good.** No loading flash anywhere in the app. One reactive system over the
store rather than two. The repository is pure and testable without React.

**Bad.** `revision` is a manual invalidation signal — forgetting `bump()` after
a write leaves the UI stale. This is why every mutation must go through a single
repository function that bumps as its last step, rather than callers doing it.

**Rejected alternative.** `useMMKVListener` could replace `revision`, but one
`addExpense` touches 3–4 keys and would fire 3–4 renders. One explicit `bump()`
after the transaction commits fires one.

**Zustand v5 caveat.** v5 dropped default shallow equality. A selector returning
a fresh object or array triggers `getSnapshot should be cached` warnings and can
loop. Select primitives, or use `useShallow`.
