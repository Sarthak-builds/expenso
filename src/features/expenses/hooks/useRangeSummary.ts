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
 * `revision` is in the dependency list but not the body on purpose: it is the
 * invalidation signal the repository bumps after a write. Removing it as an
 * "unused dependency" is what leaves the dashboard stale after an add.
 */
export function useRangeSummary(): RangeSummary {
  const rangeId = useRangeId();
  const revision = useRevision();
  return useMemo(() => buildRangeSummary(rangeId), [rangeId, revision]);
}

/** Current window against the one before it. `changeRatio` is null on no history. */
export function useRangeTrend(): { changeRatio: number | null; previous: number } {
  const rangeId = useRangeId();
  const revision = useRevision();
  return useMemo(() => {
    const { changeRatio, previous } = trendAgainstPreviousPeriod(rangeId);
    return { changeRatio, previous };
  }, [rangeId, revision]);
}
