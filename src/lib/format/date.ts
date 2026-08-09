import { strings } from '@/lib/strings';

/**
 * A LOCAL calendar day, `YYYY-MM-DD`.
 *
 * Not a timestamp. Every query in this app is calendar-relative ("last 7
 * days"), and `YYYY-MM-DD` sorts lexicographically — which is also
 * chronologically — so range slicing is plain string comparison with no
 * timezone math and no DST edge cases.
 *
 * See docs/adr/0003-expense-data-model.md
 */
export type DayKey = string;

/** `YYYY-MM` — the grouping key for the 18-month digest series. */
export type MonthKey = string;

const DAY_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const MS_PER_DAY = 86_400_000;

// Hoisted: constructing an Intl formatter parses locale data and builds lookup
// tables. Doing that per render is measurably slow on a list of expenses.
const dayLongFormatter = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

const dayShortFormatter = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
});

const weekdayFormatter = new Intl.DateTimeFormat('en-IN', { weekday: 'short' });

const monthFormatter = new Intl.DateTimeFormat('en-IN', { month: 'short', year: '2-digit' });

function pad2(value: number): string {
  return value < 10 ? `0${value}` : String(value);
}

/** Converts a `Date` to its LOCAL day key. Never use `toISOString()` — it is UTC. */
export function toDayKey(date: Date): DayKey {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

export function todayKey(): DayKey {
  return toDayKey(new Date());
}

/** Parses a day key to local midnight. Invalid input yields an invalid `Date`. */
export function parseDayKey(day: DayKey): Date {
  const year = Number(day.slice(0, 4));
  const month = Number(day.slice(5, 7));
  const date = Number(day.slice(8, 10));
  return new Date(year, month - 1, date);
}

export function isDayKey(value: unknown): value is DayKey {
  if (typeof value !== 'string' || !DAY_KEY_PATTERN.test(value)) return false;
  const parsed = parseDayKey(value);
  // Rejects '2026-02-31', which the regex accepts but the calendar does not.
  return !Number.isNaN(parsed.getTime()) && toDayKey(parsed) === value;
}

/** Shifts a day key by whole days. Negative moves backwards. */
export function addDays(day: DayKey, delta: number): DayKey {
  const date = parseDayKey(day);
  date.setDate(date.getDate() + delta);
  return toDayKey(date);
}

/** Whole days from `from` to `to`, signed. Both are local midnights, so DST
 *  shifts of ±1 hour cannot change the result once rounded. */
export function daysBetween(from: DayKey, to: DayKey): number {
  return Math.round((parseDayKey(to).getTime() - parseDayKey(from).getTime()) / MS_PER_DAY);
}

/**
 * The `length` most recent day keys ending at `end`, oldest first.
 * `lastNDays(7, '2026-08-07')` covers 08-01 through 08-07 inclusive.
 */
export function lastNDays(length: number, end: DayKey = todayKey()): DayKey[] {
  const out: DayKey[] = new Array(length);
  for (let i = 0; i < length; i++) {
    out[i] = addDays(end, i - length + 1);
  }
  return out;
}

/** Constrains a day key to `[min, max]`. Both bounds are inclusive. */
export function clampDayKey(day: DayKey, min: DayKey, max: DayKey): DayKey {
  if (day < min) return min;
  if (day > max) return max;
  return day;
}

export function monthKeyOf(day: DayKey): MonthKey {
  return day.slice(0, 7);
}

/** "7 Aug 2026" */
export function formatDayLong(day: DayKey): string {
  return dayLongFormatter.format(parseDayKey(day));
}

/** "7 Aug" */
export function formatDayShort(day: DayKey): string {
  return dayShortFormatter.format(parseDayKey(day));
}

/** "Mon" */
export function formatWeekday(day: DayKey): string {
  return weekdayFormatter.format(parseDayKey(day));
}

/** "Aug 26" — axis labels for the 18-month series. */
export function formatMonth(month: MonthKey): string {
  return monthFormatter.format(parseDayKey(`${month}-01`));
}

/**
 * "Today" / "Yesterday" / "7 Aug" — section headers in the transaction list.
 * Falls back to the long form once the year differs from the reference day.
 */
export function formatDayRelative(day: DayKey, reference: DayKey = todayKey()): string {
  if (day === reference) return strings.common.today;
  if (day === addDays(reference, -1)) return strings.common.yesterday;
  if (day.slice(0, 4) !== reference.slice(0, 4)) return formatDayLong(day);
  return formatDayShort(day);
}
