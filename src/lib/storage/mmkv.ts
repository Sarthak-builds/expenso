import { createMMKV, type MMKV } from 'react-native-mmkv';

/**
 * Two instances, deliberately. Logout calls `clearAll()` on the session
 * instance; if expenses lived there too, logging out would destroy every
 * record. See docs/adr/0001-local-first-storage.md
 *
 * `react-native-mmkv@4` exports `MMKV` as a TYPE. The runtime factory is
 * `createMMKV({ id })` and `id` is mandatory — every `new MMKV()` example
 * online targets v2/v3 and will not compile here.
 */

/** Expense records, indexes and rollups. Survives logout. */
export const expenseStorage: MMKV = createMMKV({ id: 'expenso.v1' });

/** Auth, settings and chat history. Wiped on logout. */
export const sessionStorage: MMKV = createMMKV({ id: 'expenso.session.v1' });
