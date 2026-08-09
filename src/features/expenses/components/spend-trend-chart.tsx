import { View } from 'react-native';

import { BarChart } from '@/components/charts';
import { SectionHeader } from '@/components/molecules';
import { formatDayShort } from '@/lib/format';
import { strings } from '@/lib/strings';

import type { RangeSummary } from '../model/types';

/**
 * Daily spend over the selected window.
 *
 * This is the domain half of the split ADR 0008 describes: `BarChart` takes
 * `{ points }` and is global; mapping days and rupees onto those points is
 * feature work and lives here.
 *
 * `x` is the index rather than a date because the series is always evenly
 * spaced days — the chart spaces by position, and the two axis labels carry
 * the actual dates.
 */
export function SpendTrendChart({ summary }: { summary: RangeSummary }) {
  const points = summary.daily.map((entry, index) => ({ x: index, y: entry.total }));

  return (
    <View className="gap-3">
      <SectionHeader title={strings.dashboard.spendOverTime} />
      <BarChart
        points={points}
        axisLabels={[formatDayShort(summary.from), formatDayShort(summary.to)]}
      />
    </View>
  );
}
