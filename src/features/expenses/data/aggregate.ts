import { addDays, lastNDays, monthKeyOf, todayKey, type DayKey } from '@/lib/format';

import {
  RANGE_LENGTHS,
  type CategoryId,
  type RangeId,
  type RangeSummary,
} from '../model/types';
import { getSummariesInRange } from './expense.repository';

/**
 * Derivations over the `sum:` rollups. They read storage but hold no state, so
 * the UI can call them during render.
 *
 * Nothing here hydrates an `exp:` record. That is the whole point: the cost is
 * bounded by the window length, not the dataset size.
 *
 * ## Why every one of these takes `revision`
 *
 * It is never read. It exists so the caller's `useMemo` recomputes after a
 * write — and it has to be an ARGUMENT, not just a dependency in the array.
 *
 * React Compiler re-derives dependencies from what the memo body actually
 * uses and discards the hand-written array. `useMemo(() => f(rangeId),
 * [rangeId, revision])` compiles to a cache keyed on `rangeId` alone:
 *
 *     if ($[0] !== rangeId) { t0 = buildRangeSummary(rangeId); ... }
 *
 * The store bumps, the component re-renders, and the memo hands back the stale
 * value — the dashboard silently stops updating after an add. Passing
 * `revision` into the call puts it back in the data flow:
 *
 *     if ($[0] !== rangeId || $[1] !== revision) { ... }
 *
 * Verified by compiling both forms with babel-plugin-react-compiler.
 * See docs/adr/0002-state-management.md
 */

/** Everything the dashboard needs for one window, in a single pass. */
export function buildRangeSummary(
  rangeId: RangeId,
  revision: number,
  today: DayKey = todayKey()
): RangeSummary {
  const length = RANGE_LENGTHS[rangeId];
  const days = lastNDays(length, today);
  const from = days[0]!;
  const to = days[length - 1]!;

  // Index the sparse rollups so the dense day series below is O(1) per day
  // rather than a scan — 180 days against 180 stored days is 32,400 compares
  // the naive way.
  const totals = new Map<DayKey, number>();
  const categoryTotals = new Map<CategoryId, number>();
  let total = 0;
  let count = 0;

  for (const { day, summary } of getSummariesInRange(from, to)) {
    totals.set(day, summary.total);
    total += summary.total;
    count += summary.count;
    for (const [categoryId, amount] of Object.entries(summary.byCategory)) {
      categoryTotals.set(
        categoryId as CategoryId,
        (categoryTotals.get(categoryId as CategoryId) ?? 0) + (amount ?? 0)
      );
    }
  }

  return {
    rangeId,
    from,
    to,
    total,
    count,
    // Averaged over the window, not over the days that happen to have entries —
    // "₹0 on Tuesday" is a real data point in a spending average.
    dailyAverage: Math.round(total / length),
    daily: days.map((day) => ({ day, total: totals.get(day) ?? 0 })),
    byCategory: [...categoryTotals.entries()]
      .map(([categoryId, categoryTotal]) => ({ categoryId, total: categoryTotal }))
      .sort((a, b) => b.total - a.total),
  };
}

/** Window total only — used to compare the current period against the previous. */
export function totalInRange(from: DayKey, to: DayKey): number {
  let total = 0;
  for (const { summary } of getSummariesInRange(from, to)) total += summary.total;
  return total;
}

/**
 * Change against the immediately preceding window of the same length.
 * `null` when there is no prior spend to compare against — a percentage
 * against zero is infinity, and rendering "+∞%" on day two is not useful.
 */
export function trendAgainstPreviousPeriod(
  rangeId: RangeId,
  revision: number,
  today: DayKey = todayKey()
): { current: number; previous: number; changeRatio: number | null } {
  const length = RANGE_LENGTHS[rangeId];
  const currentFrom = addDays(today, -(length - 1));
  const previousTo = addDays(currentFrom, -1);
  const previousFrom = addDays(previousTo, -(length - 1));

  const current = totalInRange(currentFrom, today);
  const previous = totalInRange(previousFrom, previousTo);

  return {
    current,
    previous,
    changeRatio: previous > 0 ? (current - previous) / previous : null,
  };
}

/** Monthly totals over the trailing `months`, oldest first. Digest input. */
export function monthlyTotals(months: number, today: DayKey = todayKey()): {
  month: string;
  total: number;
}[] {
  const from = addDays(today, -(months * 31));
  const byMonth = new Map<string, number>();

  for (const { day, summary } of getSummariesInRange(from, today)) {
    const month = monthKeyOf(day);
    byMonth.set(month, (byMonth.get(month) ?? 0) + summary.total);
  }

  return [...byMonth.entries()]
    .map(([month, total]) => ({ month, total }))
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-months);
}
