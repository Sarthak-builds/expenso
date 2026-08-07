# 0001 — Local-first storage with MMKV, no backend

**Status:** Accepted · 2026-08-07

## Context

Expenso is a personal expense tracker for two known users. The requirement was
explicitly "frontend only". Spending data is sensitive but never needs to be
shared between the two users or accessed from more than one device.

A backend would add hosting cost, an auth surface, sync conflict handling, and
network failure states — all to solve problems this app does not have.

## Decision

All data lives on-device in MMKV. There is no server, no sync, and no network
dependency for any core feature. The only outbound request in the entire app is
the Gemini call.

Two separate MMKV instances:

- `expenso.v1` — expense records and indexes.
- `expenso.session.v1` — auth, settings, chat history.

## Consequences

**Good.** Every read is synchronous and instant; there are no loading states for
local data. Spending data never leaves the device. No hosting cost, no server to
secure.

**Bad.** Data is confined to one device — uninstalling the app destroys it.
There is no backup or cross-device access, and no recovery if the user clears
app storage. Export/import is the natural mitigation if this becomes painful.

**Note.** The two-instance split exists so that logout (`clearAll()` on the
session instance) cannot destroy expense history. Collapsing them into one
instance would make logout catastrophic.

**MMKV v4 API.** `react-native-mmkv@4` exports `MMKV` as a **type only**. The
runtime factory is `createMMKV({ id })` and `id` is required. Every `new MMKV()`
example online targets v2/v3 and will not compile.
