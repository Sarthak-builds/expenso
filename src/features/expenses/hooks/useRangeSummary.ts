import { useMemo } from 'react';

import { buildRangeSummary, trendAgainstPreviousPeriod } from '../data/aggregate';
import type { RangeSummary } from '../model/types';
import { useRangeId, useRevision } from '../store/expenses.store';

/**
 * The dashboard's aggregate for the selected window.
 *
 * Synchronous on first render — there is no loading state and no empty flash,
 * because the value is computed from MMKV during render rather than resolved
 * through a cache. See docs/adr/0002-state-management.md
 *
 * `revision` is PASSED to the derivation, not merely listed as a dependency.
 * React Compiler discards the dependency array and infers deps from the body,
 * so a `revision` that only appears in the array is dropped and the dashboard
 * goes stale after every add. See the long note in `data/aggregate.ts`.
 */
export function useRangeSummary(): RangeSummary {
  const rangeId = useRangeId();
  const revision = useRevision();
  return useMemo(() => buildRangeSummary(rangeId, revision), [rangeId, revision]);
}

/** Current window against the one before it. `changeRatio` is null on no history. */
export function useRangeTrend(): { changeRatio: number | null; previous: number } {
  const rangeId = useRangeId();
  const revision = useRevision();
  return useMemo(() => {
    const { changeRatio, previous } = trendAgainstPreviousPeriod(rangeId, revision);
    return { changeRatio, previous };
  }, [rangeId, revision]);
}
