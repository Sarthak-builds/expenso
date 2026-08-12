import { SegmentedControl, type SegmentedOption } from '@/components/molecules';
import { strings } from '@/lib/strings';

import { RANGE_IDS, type RangeId } from '../model/types';
import { useRangeId, useSetRange } from '../store/expenses.store';

/** Built once. The four windows are fixed. */
const options: SegmentedOption<RangeId>[] = RANGE_IDS.map((id) => ({
  value: id,
  label: strings.dashboard.ranges[id],
}));

/**
 * The dashboard's window selector, bound straight to the store.
 *
 * Every dashboard read is keyed on `[rangeId, revision]`, so changing this
 * recomputes the KPIs, the chart and the list from the rollups in one render —
 * there is nothing to refetch.
 */
export function RangePicker() {
  const rangeId = useRangeId();
  const setRange = useSetRange();

  return (
    <SegmentedControl
      size="sm"
      options={options}
      value={rangeId}
      onChange={setRange}
      accessibilityLabel={strings.dashboard.rangeA11y}
    />
  );
}
