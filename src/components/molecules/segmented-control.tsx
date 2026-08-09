import * as React from 'react';
import { Pressable, View, type LayoutChangeEvent } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils/cn';
import { motion } from '@/lib/theme';

type SegmentedOption<T extends string> = { value: T; label: string };

type SegmentedControlProps<T extends string> = {
  options: readonly SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Announced to screen readers as the group's purpose. */
  accessibilityLabel?: string;
  className?: string;
};

/**
 * A row of mutually exclusive choices with a sliding indicator.
 *
 * The indicator is one absolutely positioned view that translates, rather than
 * a background toggled on each segment. That gives continuity between states
 * for free, and `translateX` runs on the GPU — animating each segment's
 * background colour instead would be a layout-free but per-segment repaint.
 *
 * Width comes from `onLayout` because the control stretches to its container.
 * Until the first layout the indicator has zero width and is invisible, which
 * is correct: there is nothing to point at yet.
 */
function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  accessibilityLabel,
  className,
}: SegmentedControlProps<T>) {
  const [trackWidth, setTrackWidth] = React.useState(0);
  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value)
  );

  // The state is "which index is selected". The offset is derived from it.
  const index = useSharedValue(selectedIndex);

  React.useEffect(() => {
    index.set(withTiming(selectedIndex, { duration: motion.base }));
  }, [index, selectedIndex]);

  const segmentWidth = options.length > 0 ? trackWidth / options.length : 0;

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: index.get() * segmentWidth }],
  }));

  const handleLayout = React.useCallback((event: LayoutChangeEvent) => {
    setTrackWidth(event.nativeEvent.layout.width);
  }, []);

  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel={accessibilityLabel}
      onLayout={handleLayout}
      className={cn('flex-row rounded-md bg-accents-1 p-0.5', className)}
      style={{ borderCurve: 'continuous' }}>
      <Animated.View
        pointerEvents="none"
        className="absolute bottom-0.5 left-0.5 top-0.5 rounded-sm bg-background shadow-sm shadow-black/5"
        style={[{ width: segmentWidth, borderCurve: 'continuous' }, indicatorStyle]}
      />

      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            className="min-h-[36px] flex-1 items-center justify-center px-3 py-2">
            <Text
              className={cn(
                'text-copy-14',
                selected ? 'font-medium text-foreground' : 'text-accents-5'
              )}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export { SegmentedControl };
export type { SegmentedControlProps, SegmentedOption };
