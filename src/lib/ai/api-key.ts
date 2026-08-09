import { env } from '@/lib/env';

/**
 * The Gemini key resolves through exactly one function, as ADR 0004 requires:
 *
 *   getGeminiKey() = override ?? EXPO_PUBLIC_GEMINI_API_KEY
 *
 * The override is *pushed* here by whoever owns the setting rather than pulled
 * from a store, so this module — and the AI client above it — stays independent
 * of any feature. Nothing imports a settings screen to make a network call.
 *
 * The bundled key is not a secret: it is inlined into the JavaScript bundle at
 * build time and extractable from any distributed build. Restrict it in AI
 * Studio to the app's signature with a low quota, and let users supply their
 * own to keep it out of the picture entirely.
 */
let override: string | undefined;

export function setGeminiKeyOverride(key: string | null | undefined): void {
  const trimmed = key?.trim();
  override = trimmed ? trimmed : undefined;
}

export function getGeminiKey(): string | undefined {
  return override ?? env.geminiApiKey;
}

/** Which key is in play, for the Settings screen to report. */
export function geminiKeySource(): 'custom' | 'bundled' | 'none' {
  if (override) return 'custom';
  return env.geminiApiKey ? 'bundled' : 'none';
}
