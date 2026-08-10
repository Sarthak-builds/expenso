import { useMemo } from 'react';

import type { DayKey } from '@/lib/format';

import { listInRange } from '../data/expense.repository';
import type { Expense, RangeId } from '../model/types';
import { RANGE_LENGTHS } from '../model/types';
import { addDays, todayKey } from '@/lib/format';
import { useRangeId, useRevision } from '../store/expenses.store';

/**
 * The transaction list, flattened into one array of day headers and rows.
 *
 * A flat array rather than nested sections because `FlashList` virtualizes a
 * single list; nesting section lists inside it would defeat the recycling that
 * makes it worth using. `getItemType` keeps headers and rows in separate
 * recycling pools so a header never gets re-used as a row.
 */
export type ExpenseListItem =
  | { kind: 'header'; key: string; day: DayKey; total: number }
  | { kind: 'expense'; key: string; expense: Expense };

export function useExpenseList(limit?: number): ExpenseListItem[] {
  const rangeId = useRangeId();
  const revision = useRevision();

  // `revision` is passed, not just depended on — see the note in
  // `data/aggregate.ts` about React Compiler discarding dependency arrays.
  return useMemo(
    () => buildExpenseList(rangeId, revision, limit),
    [rangeId, revision, limit]
  );
}

function buildExpenseList(
  rangeId: RangeId,
  revision: number,
  limit?: number
): ExpenseListItem[] {
  const today = todayKey();
  const expenses = listInRange(addDays(today, -(RANGE_LENGTHS[rangeId] - 1)), today);
  const capped = limit === undefined ? expenses : expenses.slice(0, limit);

  const items: ExpenseListItem[] = [];
  let currentDay: DayKey | null = null;
  let headerIndex = -1;

  for (const expense of capped) {
    if (expense.day !== currentDay) {
      currentDay = expense.day;
      headerIndex = items.length;
      items.push({ kind: 'header', key: `h:${expense.day}`, day: expense.day, total: 0 });
    }
    // Sum only the rows actually shown, so a truncated list's header total
    // matches what is under it rather than the day's real total.
    const header = items[headerIndex] as Extract<ExpenseListItem, { kind: 'header' }>;
    header.total += expense.amountMinor;
    items.push({ kind: 'expense', key: expense.id, expense });
  }

  return items;
}
