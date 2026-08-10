import { useMemo } from 'react';

import { countAll } from '../data/expense.repository';
import { useRevision } from '../store/expenses.store';

/**
 * How many records exist, across all time.
 *
 * Sums the `count` on each `sum:` rollup rather than hydrating anything, so it
 * costs one read per day that has entries. Recomputed on `revision`, which is
 * why it is a hook rather than a call — see the note in `useRangeSummary`.
 */
export function useExpenseCount(): number {
  const revision = useRevision();
  // Passed, not just depended on — see the note in `data/aggregate.ts`.
  return useMemo(() => countAll(revision), [revision]);
}
