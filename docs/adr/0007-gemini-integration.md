# 0007 — Structured output with a pre-aggregated spend digest

**Status:** Accepted · 2026-08-07

## Context

The chatbot has two jobs: add an expense from natural language ("milk 30"), and
answer questions about spending ("how much on groceries last month?"). Both must
work from a device with the user's entire expense history available locally.

The naive approach — classify intent with one call, then send raw expense
records as context — fails on both cost and correctness.

## Decision

### One call, discriminated union

`responseMimeType: "application/json"` with a `responseSchema` returning:

```jsonc
{
  "intent": "add_expense" | "answer_question" | "clarify",
  "expense": { "label", "amountMinor", "categoryId", "day" },  // optional
  "reply": "string"
}
```

with `temperature: 0`, minimal thinking, and `propertyOrdering` set. `enum` on
`categoryId` and `intent` means the app can never receive a value it does not
understand.

> **Correction, 2026-08-08 — verified against the live API.**
> This ADR originally specified `thinkingConfig: { thinkingBudget: 0 }`. That
> is a Gemini 2.x field and **`gemini-3.6-flash` rejects it**: the request fails
> with `400 INVALID_ARGUMENT — Request contains an invalid argument`, and the
> error names no field, so it reads like a bad schema or a bad key.
>
> The 3.x equivalent is `thinkingConfig: { thinkingLevel: 'minimal' }`.
> Bisected against the real endpoint: every other part of the request is
> accepted, and only this field fails. `'minimal' | 'low' | 'medium' | 'high'`
> are all valid; `thinkingBudget` as a positive integer is also still accepted,
> but `0` is not.
>
> The decision below is unchanged — thinking stays off. Only the field name was
> wrong.

Model: **`gemini-3.6-flash`** via
`POST https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent`,
header `x-goog-api-key`.

### Context is a digest, never records

`buildSpendDigest()` — a pure function memoized on `revision` — reads `sum:*`
rollups only and emits:

```
TODAY: 2026-08-07  CURRENCY: INR  UNITS: paise
TOTALS d7=1234500 d30=4890000 d60=9120000 d180=27300000
CAT_30D groceries=1820000 bills=1100000 ...
DAILY_30D 08-06:45000,08-05:12000,...      (zero days omitted)
TOP_LABELS_30D Milk x24=72000; ...         (top 15)
MONTHLY_18M 2025-03:412000,...
```

**This has a fixed ceiling of roughly 800 tokens regardless of data volume.**
3,650 expenses produce the same digest as 50. Sending raw records instead would
be ~40 tokens each — about 146,000 tokens per message at 3,650 records, which is
both unaffordable and slower than the answer is worth.

System instruction carries the role, category enum, today's date, "amounts are
in paise", and the critical constraint: **answer only from the digest; if it is
not there, say so; never invent numbers.** History is capped at 6 turns — the
digest is the value, not the transcript.

## Consequences

**Good.** One round trip per message. Cost and latency are flat as history
grows. The model cannot hallucinate a category the app doesn't have.

**Deliberate constraints.**

- **`clarify` is a required intent.** "spent on milk" with no amount must not
  silently write a ₹0 record — it returns `clarify` and renders as a normal
  reply.
- **Never auto-write on `add_expense`.** Render a confirm card (label / amount /
  category / date, with Confirm and Edit). One tap, and it prevents the chat
  path from filling the database with misparsed entries.
- **The model response is untrusted input.** Clamp `day` to `[today-365,
  today]`, reject non-finite or negative `amountMinor`, cap `label` length.
  Structured output constrains shape, not sanity.

**Rejected: the Interactions API.** Google made `/v1beta/interactions` the
recommended front door in June 2026, but it defaults to `store: true` —
server-retained conversation state. That is wrong for a private, local-first
finance app. `generateContent` is labelled legacy yet remains fully supported
and still receives new flagship models. Model id and endpoint live in
`lib/ai/gemini.config.ts` so migrating is a one-file change.

**Minimal thinking** because extraction is trivial; enabling it adds latency
and cost for no measurable accuracy gain on this task.

**Verified end-to-end against the live API, 2026-08-08**, with a representative
digest. All four cases behave as designed:

| Input | Intent | Result |
|---|---|---|
| `milk 30` | `add_expense` | `amountMinor: 3000`, `groceries`, today |
| `how much on groceries in the last 30 days?` | `answer_question` | ₹1,820 — correct paise→rupee conversion |
| `spent on milk today` | `clarify` | asks for the amount, emits no expense |
| `what did I spend on rent last month?` | `answer_question` | declines to invent a figure, offers the real `bills` total instead |

The last row is the one that matters: rent is absent from the digest, and the
model said so rather than producing a plausible number.
