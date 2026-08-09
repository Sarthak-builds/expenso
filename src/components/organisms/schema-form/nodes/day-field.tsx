import { ScrollView } from 'react-native';

import { Chip, FieldShell } from '@/components/molecules';
import { addDays, formatDayRelative, todayKey } from '@/lib/format';

import { useField } from '../context';
import type { FieldNode } from '../types';

const DEFAULT_DAYS = 7;

/**
 * Recent days as a horizontal strip of chips.
 *
 * Not a calendar. `@react-native-community/datetimepicker` is a native module,
 * so adding it forces a rebuild — and a modal date picker is three taps and a
 * dismissal for the answer that is "today" almost every time. A strip of the
 * last week is one tap for the overwhelmingly common case.
 *
 * The trade-off is real and bounded: entering an expense from three weeks ago
 * is not possible here. If back-dating turns out to matter, this is the one
 * component to revisit — the schema node stays the same.
 *
 * A `ScrollView` rather than a list: the row is a fixed seven items, which is
 * below the point where virtualization pays for itself.
 */
function DayField({ node }: { node: Extract<FieldNode, { kind: 'day' }> }) {
  const { value, error, setValue } = useField(node.name);

  const today = todayKey();
  const count = node.days ?? DEFAULT_DAYS;
  // Newest first: today sits under the thumb rather than off the far end.
  const days = Array.from({ length: count }, (_, index) => addDays(today, -index));

  return (
    <FieldShell label={node.label} hint={node.hint} error={error}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="flex-row gap-2 pr-4">
        {days.map((day) => (
          <Chip
            key={day}
            label={formatDayRelative(day, today)}
            selected={day === value}
            onPress={() => setValue(day)}
          />
        ))}
      </ScrollView>
    </FieldShell>
  );
}

export { DayField };
