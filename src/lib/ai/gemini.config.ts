/**
 * Endpoint and model, isolated so migrating is a one-file change.
 *
 * **`generateContent`, not `/v1beta/interactions`.** Google made Interactions
 * the recommended front door in June 2026, but it defaults to `store: true` —
 * server-retained conversation state. That is wrong for a private, local-first
 * finance app. `generateContent` is labelled legacy yet remains fully supported
 * and still receives new flagship models.
 *
 * See docs/adr/0007-gemini-integration.md
 */
export const GEMINI_MODEL = 'gemini-3.6-flash';

export const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

/** Header name for the key. Gemini takes it here, not as a bearer token. */
export const GEMINI_KEY_HEADER = 'x-goog-api-key';

export const GEMINI_GENERATION_CONFIG = {
  // Extraction, not composition. Any creativity here is a wrong number.
  temperature: 0,
  responseMimeType: 'application/json',
  // Thinking adds latency and cost for no measurable accuracy gain on a task
  // this mechanical.
  //
  // `thinkingLevel`, NOT `thinkingBudget`. Gemini 3.x rejects `thinkingBudget`
  // outright — the whole request comes back
  // `400 INVALID_ARGUMENT: Request contains an invalid argument`, with nothing
  // naming the offending field. Verified against the live API on 2026-08-08:
  // every other part of this config is accepted, and swapping this one line
  // back to `{ thinkingBudget: 0 }` fails 100% of calls.
  thinkingConfig: { thinkingLevel: 'minimal' },
} as const;

/** The digest is the value, not the transcript — history stays short. */
export const HISTORY_TURN_LIMIT = 6;

/** A phone on a flaky connection should fail visibly, not hang. */
export const REQUEST_TIMEOUT_MS = 20_000;
