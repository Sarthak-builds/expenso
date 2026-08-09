import type { MMKV } from 'react-native-mmkv';

/**
 * Typed JSON access over an MMKV instance.
 *
 * MMKV stores strings; every structured value in this app is JSON. Parsing is
 * wrapped because a corrupt or half-written value must degrade to the fallback
 * rather than crash a synchronous render path — these reads happen *during*
 * render (see docs/adr/0002-state-management.md), so a throw here is a white
 * screen, not a caught error boundary case.
 *
 * The `T` is a promise the caller makes, not a guarantee. Values that cross a
 * trust boundary (the Gemini response) are validated separately.
 */
export function readJson<T>(storage: MMKV, key: string, fallback: T): T {
  const raw = storage.getString(key);
  if (raw === undefined) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/** Reads a JSON value, or `undefined` when the key is absent or unparseable. */
export function readJsonOptional<T>(storage: MMKV, key: string): T | undefined {
  return readJson<T | undefined>(storage, key, undefined);
}

export function writeJson(storage: MMKV, key: string, value: unknown): void {
  storage.set(key, JSON.stringify(value));
}

/** Reads many keys in one pass. Absent keys are omitted, not left as holes. */
export function readJsonMany<T>(storage: MMKV, keys: readonly string[]): T[] {
  const out: T[] = [];
  for (const key of keys) {
    const value = readJsonOptional<T>(storage, key);
    if (value !== undefined) out.push(value);
  }
  return out;
}
