# 0003 — Integer minor units and local day-key dates

**Status:** Accepted · 2026-08-07

## Context

Two representation choices in the expense record have outsized blast radius:
how money is stored, and how dates are stored. Both are painful to change once
records exist on users' devices.

## Decision

```ts
type CategoryId = 'food' | 'groceries' | 'transport' | 'bills'
                | 'shopping' | 'health' | 'entertainment' | 'other'
type DayKey = string          // 'YYYY-MM-DD', LOCAL time

type Expense = {
  id: string                  // crypto.randomUUID()
  label: string               // "Milk" — the key in the key→value pair
  amountMinor: number         // 3000 = ₹30.00 — INTEGER paise
  categoryId: CategoryId
  day: DayKey
  createdAt: number           // epoch ms — intra-day ordering and undo
  source: 'manual' | 'chat'
  note?: string
}
```

**Money is an integer count of paise.** Floats accumulate error: `30.1 + 20.2`
is not `50.3`, and a 180-day total sums thousands of such values. Division by
100 happens only at the `Intl.NumberFormat` edge.

**Dates are local `YYYY-MM-DD` strings, not timestamps.** Every query in this
app is calendar-relative ("last 7 days"). A timestamp forces timezone math on
every query and breaks across DST. `YYYY-MM-DD` sorts lexicographically, which
is also chronologically — so range slicing is plain string comparison.

### MMKV key schema — instance `expenso.v1`

```
exp:<id>            -> JSON Expense                     record
day:<YYYY-MM-DD>    -> JSON string[] (expense ids)      index
sum:<YYYY-MM-DD>    -> JSON { total, byCategory }       ROLLUP
idx:days            -> JSON DayKey[] (sorted)           which days exist
meta:schemaVersion  -> number
```

The `sum:` rollup is what makes 7/30/60/180-day windows instant: dashboard KPIs
and charts read `sum:*` **only** — at most 180 small reads, zero record
hydration, constant regardless of how many expenses exist. The transaction list
hydrates `day:*` → `exp:*` lazily and is virtualized, so ~15 records materialise.

A range query reads `idx:days` once, slices it in JS, and reads only those
`sum:` keys.

## Consequences

**Good.** Dashboard cost is bounded by the window length, not the dataset size.
No timezone bugs. No float drift.

**Bad.** Four keys must stay consistent on every write. Mitigation: a single
repository function performs `write record → push day index → upsert idx:days →
update sum → bump()`, and `repair()` rebuilds all derived keys from `exp:*` for
migrations and the Settings reset action.

**Never call `getAllKeys()` in a query path** — it allocates every key string in
the store on each call, which is exactly the full scan this schema avoids. Its
only legitimate use is `repair()`.

**Display formatting** uses module-level `Intl.NumberFormat` / `DateTimeFormat`
instances in `lib/format/` — constructing them per render is measurably slow.
