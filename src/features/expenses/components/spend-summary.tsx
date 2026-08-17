import { View } from 'react-native';

import { Sparkline } from '@/components/charts';
import { HeroStat, StatTile } from '@/components/molecules';
import { formatMinorWhole } from '@/lib/format';
import { strings } from '@/lib/strings';

import type { RangeSummary } from '../model/types';
import { useRangeTrend } from '../hooks/useRangeSummary';

/**
 * The dashboard's figures, in priority order.
 *
 * One hero and two qualifiers, rather than the three equal tiles this used to
 * be. "How much have I spent" is the question the screen exists to answer, so
 * the total gets `heading-72` and full width; the daily average and the entry
 * count are context and sit underneath at `heading-24`.
 *
 * The total is shown WHOLE rather than compact now that it has the width for
 * it — `₹1,23,456` is more useful than `₹1.2L` when it is the one number you
 * came to read, and it no longer has to survive inside a half-width tile.
 */
export function SpendSummary({ summary }: { summary: RangeSummary }) {
  const { changeRatio, previous } = useRangeTrend();

  const points = summary.daily.map((entry, index) => ({ x: index, y: entry.total }));
  const isToday = summary.rangeId === 'd1';

  return (
    <View className="gap-4">
      <HeroStat
        label={strings.dashboard.totalSpent}
        value={formatMinorWhole(summary.total)}
        changeRatio={changeRatio}
        goodDirection="down"
        caption={strings.dashboard.rangeLabels[summary.rangeId]}
      />

      {/* One day is a single bar, which is not a trend — the sparkline only
          earns its place once there is a shape to see. */}
      {isToday ? null : <Sparkline points={points} filled height={40} />}

      <View className="flex-row gap-3">
        {/* On the Today range the daily average IS the total, so it would be
            the hero figure repeated. Yesterday is the comparison that actually
            tells you something on a single day. */}
        <StatTile
          label={isToday ? strings.dashboard.yesterday : strings.dashboard.dailyAverage}
          value={formatMinorWhole(isToday ? previous : summary.dailyAverage)}
        />
        <StatTile label={strings.dashboard.entries} value={String(summary.count)} />
      </View>
    </View>
  );
}
