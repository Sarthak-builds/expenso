import * as React from 'react';
import { View } from 'react-native';

import { Text } from '@/components/ui/text';
import { formatDayRelative, formatMinorWhole, type DayKey } from '@/lib/format';

/**
 * The day divider in the transaction list.
 *
 * Primitive props for the same reason as `ExpenseRow`, and a separate
 * component so `getItemType` can keep headers in their own recycling pool —
 * FlashList reuses views by type, and a header recycled as a row means a
 * measurable layout jump mid-scroll.
 */
export const DayHeader = React.memo(function DayHeader({
  day,
  total,
}: {
  day: DayKey;
  total: number;
}) {
  return (
    <View className="flex-row items-baseline justify-between bg-background px-4 pb-2 pt-4">
      <Text className="font-medium uppercase tracking-wider text-label-12 text-accents-5">
        {formatDayRelative(day)}
      </Text>
      <Text className="font-mono text-label-12 text-accents-4">{formatMinorWhole(total)}</Text>
    </View>
  );
});
