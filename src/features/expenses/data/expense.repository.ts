import { randomUUID } from 'expo-crypto';

import { expenseStorage, readJson, readJsonOptional, writeJson } from '@/lib/storage';
import { isDayKey, todayKey } from '@/lib/format';

import { isCategoryId, type DayKey, type DaySummary, type Expense, type ExpenseDraft } from '../model/types';
import { notifyExpensesChanged } from './changes';
import { RECORD_PREFIX, SCHEMA_VERSION, expenseKeys } from './keys';

/**
 * The only module that reads or writes expense storage.
 *
 * Pure and synchronous — no React, no hooks, no async. Every mutation performs
 * the whole key transaction and fires `notifyExpensesChanged()` as its last
 * step, which is what keeps the four derived keys consistent and the UI fresh.
 * Callers must never write a key directly.
 *
 * See docs/adr/0002-state-management.md and docs/adr/0003-expense-data-model.md
 */

const EMPTY_SUMMARY: DaySummary = { total: 0, count: 0, byCategory: {} };

// --- reads -------------------------------------------------------------------

export function getExpense(id: string): Expense | undefined {
  return readJsonOptional<Expense>(expenseStorage, expenseKeys.record(id));
}

/** Ids recorded on a day, in insertion order. */
function getDayIds(day: DayKey): string[] {
  return readJson<string[]>(expenseStorage, expenseKeys.dayIndex(day), []);
}

/** Every day that has at least one record, sorted ascending. */
export function getDays(): DayKey[] {
  return readJson<DayKey[]>(expenseStorage, expenseKeys.days, []);
}

export function getDaySummary(day: DayKey): DaySummary {
  return readJson<DaySummary>(expenseStorage, expenseKeys.daySummary(day), EMPTY_SUMMARY);
}

/**
 * Rollups for a window, oldest first, with zero-days filled in.
 *
 * This is the hot path: at most 180 small reads, no record hydration, and the
 * cost is bounded by the window length rather than by how many expenses exist.
 */
export function getSummariesInRange(from: DayKey, to: DayKey): { day: DayKey; summary: DaySummary }[] {
  // `idx:days` is sorted, and YYYY-MM-DD sorts chronologically, so the window
  // is a plain string comparison — no parsing, no timezone math.
  const days = getDays().filter((day) => day >= from && day <= to);
  return days.map((day) => ({ day, summary: getDaySummary(day) }));
}

/** Hydrates the records for a single day, newest entry first. */
export function listDay(day: DayKey): Expense[] {
  const out: Expense[] = [];
  for (const id of getDayIds(day)) {
    const expense = getExpense(id);
    if (expense) out.push(expense);
  }
  out.sort((a, b) => b.createdAt - a.createdAt);
  return out;
}

/**
 * Hydrates records across a window, newest first.
 *
 * Unlike `getSummariesInRange` this touches real records, so it is only for the
 * transaction list — which is virtualized, so roughly 15 of these materialise
 * on screen regardless of how many the window contains.
 */
export function listInRange(from: DayKey, to: DayKey): Expense[] {
  const days = getDays().filter((day) => day >= from && day <= to);
  const out: Expense[] = [];
  // Descending: the list shows the most recent day at the top.
  for (let i = days.length - 1; i >= 0; i--) {
    out.push(...listDay(days[i]!));
  }
  return out;
}

export function countAll(): number {
  let total = 0;
  for (const day of getDays()) total += getDaySummary(day).count;
  return total;
}

// --- writes ------------------------------------------------------------------

/** Inserts a day into the sorted `idx:days` list if it is not already there. */
function ensureDayIndexed(day: DayKey): void {
  const days = getDays();
  // Binary search: `idx:days` can hold years of entries and this runs per add.
  let low = 0;
  let high = days.length;
  while (low < high) {
    const mid = (low + high) >>> 1;
    if (days[mid]! < day) low = mid + 1;
    else high = mid;
  }
  if (days[low] === day) return;
  days.splice(low, 0, day);
  writeJson(expenseStorage, expenseKeys.days, days);
}

/** Recomputes `sum:<day>` from that day's records, and prunes the day if empty. */
function recomputeDay(day: DayKey): void {
  const expenses = listDay(day);

  if (expenses.length === 0) {
    expenseStorage.remove(expenseKeys.daySummary(day));
    expenseStorage.remove(expenseKeys.dayIndex(day));
    const days = getDays().filter((d) => d !== day);
    writeJson(expenseStorage, expenseKeys.days, days);
    return;
  }

  const summary: DaySummary = { total: 0, count: expenses.length, byCategory: {} };
  for (const expense of expenses) {
    summary.total += expense.amountMinor;
    summary.byCategory[expense.categoryId] =
      (summary.byCategory[expense.categoryId] ?? 0) + expense.amountMinor;
  }
  writeJson(expenseStorage, expenseKeys.daySummary(day), summary);
}

/**
 * Writes a record and every derived key, then announces the change.
 * The notification is deliberately outside the per-key work — one mutation,
 * one render.
 */
export function addExpense(draft: ExpenseDraft): Expense {
  const expense: Expense = {
    id: randomUUID(),
    label: draft.label,
    amountMinor: draft.amountMinor,
    categoryId: draft.categoryId,
    day: draft.day,
    createdAt: Date.now(),
    source: draft.source,
    ...(draft.note ? { note: draft.note } : {}),
  };

  writeJson(expenseStorage, expenseKeys.record(expense.id), expense);
  writeJson(expenseStorage, expenseKeys.dayIndex(expense.day), [
    ...getDayIds(expense.day),
    expense.id,
  ]);
  ensureDayIndexed(expense.day);
  recomputeDay(expense.day);
  expenseStorage.set(expenseKeys.schemaVersion, SCHEMA_VERSION);

  notifyExpensesChanged();
  return expense;
}

/** Applies a partial edit. Moving an expense between days re-rolls both days. */
export function updateExpense(
  id: string,
  patch: Partial<Omit<Expense, 'id' | 'createdAt'>>
): Expense | undefined {
  const existing = getExpense(id);
  if (!existing) return undefined;

  const updated: Expense = { ...existing, ...patch };
  writeJson(expenseStorage, expenseKeys.record(id), updated);

  if (updated.day !== existing.day) {
    writeJson(
      expenseStorage,
      expenseKeys.dayIndex(existing.day),
      getDayIds(existing.day).filter((entry) => entry !== id)
    );
    writeJson(expenseStorage, expenseKeys.dayIndex(updated.day), [
      ...getDayIds(updated.day),
      id,
    ]);
    ensureDayIndexed(updated.day);
    recomputeDay(existing.day);
  }
  recomputeDay(updated.day);

  notifyExpensesChanged();
  return updated;
}

export function removeExpense(id: string): boolean {
  const existing = getExpense(id);
  if (!existing) return false;

  expenseStorage.remove(expenseKeys.record(id));
  writeJson(
    expenseStorage,
    expenseKeys.dayIndex(existing.day),
    getDayIds(existing.day).filter((entry) => entry !== id)
  );
  recomputeDay(existing.day);

  notifyExpensesChanged();
  return true;
}

/** Settings → "Delete all expenses". Wipes the expense instance only. */
export function clearAllExpenses(): void {
  expenseStorage.clearAll();
  expenseStorage.set(expenseKeys.schemaVersion, SCHEMA_VERSION);
  notifyExpensesChanged();
}

/**
 * Rebuilds every derived key from the `exp:*` records.
 *
 * This is the ONLY legitimate `getAllKeys()` caller — it allocates every key
 * string in the store, which is exactly the full scan the schema exists to
 * avoid. Reserved for migrations and the Settings repair action, never a query
 * path. See docs/adr/0003-expense-data-model.md
 */
export function repair(): { records: number; days: number; dropped: number } {
  const records: Expense[] = [];
  let dropped = 0;

  for (const key of expenseStorage.getAllKeys()) {
    if (!key.startsWith(RECORD_PREFIX)) continue;
    const expense = readJsonOptional<Expense>(expenseStorage, key);
    if (isValidRecord(expense)) {
      records.push(expense);
    } else {
      expenseStorage.remove(key);
      dropped += 1;
    }
  }

  const byDay = new Map<DayKey, string[]>();
  for (const expense of records) {
    const ids = byDay.get(expense.day);
    if (ids) ids.push(expense.id);
    else byDay.set(expense.day, [expense.id]);
  }

  // Clear stale derived keys before rewriting, so days that no longer have
  // records do not linger as phantom rollups.
  for (const key of expenseStorage.getAllKeys()) {
    if (key.startsWith('day:') || key.startsWith('sum:')) expenseStorage.remove(key);
  }

  const days = [...byDay.keys()].sort();
  writeJson(expenseStorage, expenseKeys.days, days);
  for (const day of days) {
    writeJson(expenseStorage, expenseKeys.dayIndex(day), byDay.get(day)!);
    recomputeDay(day);
  }
  expenseStorage.set(expenseKeys.schemaVersion, SCHEMA_VERSION);

  notifyExpensesChanged();
  return { records: records.length, days: days.length, dropped };
}

function isValidRecord(value: Expense | undefined): value is Expense {
  return (
    !!value &&
    typeof value.id === 'string' &&
    typeof value.label === 'string' &&
    Number.isFinite(value.amountMinor) &&
    isCategoryId(value.categoryId) &&
    isDayKey(value.day) &&
    typeof value.createdAt === 'number'
  );
}

/** Runs once at startup. Cheap unless the stored schema version is behind. */
export function migrateIfNeeded(): void {
  const stored = expenseStorage.getNumber(expenseKeys.schemaVersion);
  if (stored === SCHEMA_VERSION) return;
  // No older shape exists in the wild yet; a rebuild is both the migration and
  // the safety net for a store that was interrupted mid-write.
  if (stored === undefined && getDays().length === 0) {
    expenseStorage.set(expenseKeys.schemaVersion, SCHEMA_VERSION);
    return;
  }
  repair();
}

/** Today, as the repository sees it. Kept here so callers share one clock. */
export function currentDay(): DayKey {
  return todayKey();
}
