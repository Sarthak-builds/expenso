import { View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { ProportionBar, type Segment } from '@/components/charts';
import { SectionHeader } from '@/components/molecules';
import { Text } from '@/components/ui/text';
import { formatMinorWhole, formatShare } from '@/lib/format';
import { strings } from '@/lib/strings';
import { motion } from '@/lib/theme';

import { categoryMeta } from '../model/categories';
import type { RangeSummary } from '../model/types';

/** Beyond this the legend is longer than the bar is informative. */
const VISIBLE_CATEGORIES = 5;

/**
 * Where the money went, as one stacked bar plus a legend.
 *
 * The legend is capped and the remainder is folded into a single "Other"
 * line — eight rows of sub-1% categories is a table, not a summary, and the
 * bar segments for them would be invisible anyway.
 */
export function CategoryBreakdown({ summary }: { summary: RangeSummary }) {
  if (summary.byCategory.length === 0) return null;

  const visible = summary.byCategory.slice(0, VISIBLE_CATEGORIES);
  const remainder = summary.byCategory
    .slice(VISIBLE_CATEGORIES)
    .reduce((sum, entry) => sum + entry.total, 0);

  const segments: Segment[] = visible.map((entry) => ({
    key: entry.categoryId,
    value: entry.total,
    color: categoryMeta(entry.categoryId).color,
  }));

  if (remainder > 0) {
    segments.push({ key: 'rest', value: remainder, color: categoryMeta('other').color });
  }

  return (
    <View className="gap-3">
      <SectionHeader title={strings.dashboard.byCategory} />

      <ProportionBar segments={segments} />

      <View className="gap-2">
        {visible.map((entry, index) => {
          const meta = categoryMeta(entry.categoryId);
          return (
            <Animated.View
              key={entry.categoryId}
              entering={FadeIn.duration(motion.base).delay(index * motion.stagger)}
              className="flex-row items-center gap-3">
              <View
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: meta.color }}
              />
              <Text className="flex-1 text-copy-14 text-foreground">{meta.label}</Text>
              <Text className="font-mono text-copy-14 text-accents-5">
                {formatShare(entry.total, summary.total)}
              </Text>
              <Text className="font-mono-medium text-copy-14 text-foreground">
                {formatMinorWhole(entry.total)}
              </Text>
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
}
