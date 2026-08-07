# 0004 — Device lock, not authentication

**Status:** Accepted · 2026-08-07

## Context

The app permits exactly two phone numbers with a shared 4-digit PIN. The repo is
**public**. There is no backend, so there is no server-side place to verify
anything.

Expo inlines every `EXPO_PUBLIC_*` value into the JavaScript bundle at build
time via a Babel transform. It is a literal string substitution — the value is
present verbatim in the shipped bundle.

## Decision

Treat the login as a **device lock**, and say so in the code.

- Phone numbers and the PIN hash live in `.env` (gitignored), surfaced through
  `src/lib/env/` and nowhere else.
- The PIN is stored as a SHA-256 hex digest, never plaintext.
- `.env.example` is committed with fake values as documentation.
- `.gitignore` covers `.env` and `.env.*`, with `!.env.example` re-included.
  This was fixed **before** any real value was written to disk — the Expo
  template only ignored `.env*.local`.
- The Gemini key resolves through exactly one function:
  `getGeminiKey() = settingsStore.apiKey ?? process.env.EXPO_PUBLIC_GEMINI_API_KEY`.

## Consequences

**This is not security, and must not be described as such.**

- The Gemini key, both phone numbers, and the PIN hash are all extractable from
  any distributed build in about a minute.
- SHA-256 of a 4-digit PIN is brute-forced instantly — there are 10,000
  candidates. Hashing protects only against someone reading MMKV on a rooted
  device, not against anyone holding the bundle.

This is acceptable **only because the data never leaves the device**. There is
no server to protect and no account to take over; the realistic threat is
someone picking up an unlocked phone, which a PIN gate does address.

**Mitigations that do apply.** Restrict the Gemini key in AI Studio to the app's
Android signature with a low quota, so a leaked key cannot be used elsewhere or
run up cost. Users can override the key with their own in Settings, which keeps
the bundled key out of the picture entirely.

**`expo-secure-store` was rejected** — it would protect the PIN hash at rest
while the same value sits in plaintext in the bundle. Security theatre with a
native dependency attached.

**Operational trap.** Editing `.env` does not hot-reload, because it is a build
-time Babel transform. Restart with `--clear`. Every "my env var is undefined"
report traces back to this.
