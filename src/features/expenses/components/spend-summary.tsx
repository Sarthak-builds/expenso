import { View } from 'react-native';

import { Sparkline } from '@/components/charts';
import { StatTile } from '@/components/molecules';
import { Text } from '@/components/ui/text';
import { formatMinorCompact, formatMinorWhole } from '@/lib/format';
import { strings } from '@/lib/strings';

import type { RangeSummary } from '../model/types';
import { useRangeTrend } from '../hooks/useRangeSummary';

/**
 * The three figures at the top of the dashboard.
 *
 * Total is compact (`₹1.2L`) because it has to survive at `heading-24` inside a
 * half-width tile; the daily average is whole rupees because it is small enough
 * to read exactly. Neither shows paise — two decimals on a 180-day total is
 * four characters of noise.
 *
 * Domain-bound by design: it takes a `RangeSummary`, so it belongs to the
 * feature. `StatTile` and `Sparkline` underneath it take a string and a set of
 * points, and know nothing about money.
 */
export function SpendSummary({ summary }: { summary: RangeSummary }) {
  const { changeRatio } = useRangeTrend();

  const points = summary.daily.map((entry, index) => ({ x: index, y: entry.total }));

  return (
    <View className="gap-3">
      <View className="flex-row gap-3">
        <StatTile
          label={strings.dashboard.totalSpent}
          value={formatMinorCompact(summary.total)}
          changeRatio={changeRatio}
          goodDirection="down"
        />
        <StatTile
          label={strings.dashboard.dailyAverage}
          value={formatMinorWhole(summary.dailyAverage)}
        />
      </View>

      <View
        className="gap-2 rounded-lg border border-accents-2 bg-background p-4"
        style={{ borderCurve: 'continuous' }}>
        <View className="flex-row items-baseline justify-between">
          <Text className="font-medium uppercase tracking-wider text-label-12 text-accents-5">
            {strings.dashboard.entries}
          </Text>
          <Text className="font-mono-medium text-copy-14 text-foreground">{summary.count}</Text>
        </View>
        <Sparkline points={points} filled />
      </View>
    </View>
  );
}
