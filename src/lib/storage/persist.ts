import type { StateStorage } from 'zustand/middleware';

import { sessionStorage } from './mmkv';

/**
 * Zustand `persist` adapter backed by the session MMKV instance.
 *
 * `persist` is correct for auth, settings and chat — each is small, bounded,
 * and rewritten whole on every change anyway. It is explicitly WRONG for
 * expenses, which would re-serialise the entire collection per add and hydrate
 * asynchronously. See docs/adr/0002-state-management.md
 *
 * MMKV is synchronous, so `getItem` returns a value rather than a promise and
 * `persist` hydrates on the first render — no flash of the unauthenticated
 * state before the store rehydrates.
 */
export const mmkvSessionStorage: StateStorage = {
  getItem: (name) => sessionStorage.getString(name) ?? null,
  setItem: (name, value) => sessionStorage.set(name, value),
  // MMKV v4 renamed `delete` to `remove`.
  removeItem: (name) => {
    sessionStorage.remove(name);
  },
};
