import type { DayKey } from '@/lib/format';

export type { DayKey };

/**
 * The expense domain model. Both representation choices here — integer minor
 * units and local day-key dates — have outsized blast radius and are painful to
 * change once records exist on a device. See docs/adr/0003-expense-data-model.md
 */

/**
 * Fixed and closed. The Gemini response schema declares this same list as an
 * `enum`, so the app can never receive a category it does not understand.
 * Adding one means a schema version bump and a migration for existing rollups.
 */
export const CATEGORY_IDS = [
  'food',
  'groceries',
  'transport',
  'bills',
  'shopping',
  'health',
  'entertainment',
  'other',
] as const;

export type CategoryId = (typeof CATEGORY_IDS)[number];

/** Where the record came from. Chat entries are always user-confirmed first. */
export type ExpenseSource = 'manual' | 'chat';

export type Expense = {
  id: string;
  /** "Milk" — the key half of the key→value pair the app is built around. */
  label: string;
  /** INTEGER paise. 3000 is ₹30.00. Never a float. */
  amountMinor: number;
  categoryId: CategoryId;
  day: DayKey;
  /** Epoch ms. Orders entries within a day and makes undo possible. */
  createdAt: number;
  source: ExpenseSource;
  note?: string;
};

/** Everything needed to create a record. `id` and `createdAt` are assigned. */
export type ExpenseDraft = {
  label: string;
  amountMinor: number;
  categoryId: CategoryId;
  day: DayKey;
  source: ExpenseSource;
  note?: string;
};

/**
 * The `sum:<day>` rollup. This is what makes 7/30/60/180-day windows instant —
 * dashboards read these and never hydrate a record.
 */
export type DaySummary = {
  total: number;
  count: number;
  byCategory: Partial<Record<CategoryId, number>>;
};

/** The dashboard's time windows. */
export const RANGE_IDS = ['d1', 'd7', 'd30', 'd60', 'd180'] as const;

export type RangeId = (typeof RANGE_IDS)[number];

export const RANGE_LENGTHS: Record<RangeId, number> = {
  // A single day. `dailyAverage` degenerates to the total here, which is why
  // the dashboard swaps that tile for a yesterday comparison on this range.
  d1: 1,
  d7: 7,
  d30: 30,
  d60: 60,
  d180: 180,
};

/** Aggregated view of a window. Derived during render, never stored. */
export type RangeSummary = {
  rangeId: RangeId;
  from: DayKey;
  to: DayKey;
  total: number;
  count: number;
  dailyAverage: number;
  /** One entry per day in the window, oldest first. Zero days included. */
  daily: { day: DayKey; total: number }[];
  /** Categories with a non-zero total, largest first. */
  byCategory: { categoryId: CategoryId; total: number }[];
};

export function isCategoryId(value: unknown): value is CategoryId {
  return typeof value === 'string' && (CATEGORY_IDS as readonly string[]).includes(value);
}

export function isRangeId(value: unknown): value is RangeId {
  return typeof value === 'string' && (RANGE_IDS as readonly string[]).includes(value);
}
