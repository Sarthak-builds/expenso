import type { DayKey } from '../model/types';

/**
 * The MMKV key schema for the `expenso.v1` instance.
 *
 * Four keys must stay consistent on every write, which is why they are built
 * here rather than concatenated at call sites. See
 * docs/adr/0003-expense-data-model.md
 */
export const expenseKeys = {
  /** `exp:<id>` -> Expense. The record itself. */
  record: (id: string) => `${RECORD_PREFIX}${id}`,
  /** `day:<YYYY-MM-DD>` -> string[] of expense ids on that day. */
  dayIndex: (day: DayKey) => `day:${day}`,
  /** `sum:<YYYY-MM-DD>` -> DaySummary. The rollup every dashboard read hits. */
  daySummary: (day: DayKey) => `sum:${day}`,
  /** `idx:days` -> DayKey[], sorted ascending. Which days exist at all. */
  days: 'idx:days',
  /** `meta:schemaVersion` -> number. */
  schemaVersion: 'meta:schemaVersion',
} as const;

/** Only `repair()` may scan for this — see the `getAllKeys` warning in ADR 0003. */
export const RECORD_PREFIX = 'exp:';

/** Bump when the on-disk shape changes in a way `repair()` cannot absorb. */
export const SCHEMA_VERSION = 1;
