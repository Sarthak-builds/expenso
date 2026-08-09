import { View } from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';

import { cn } from '@/lib/utils/cn';
import { colors, motion } from '@/lib/theme';

type Segment = { key: string; value: number; color: string };

type ProportionBarProps = {
  segments: readonly Segment[];
  height?: number;
  className?: string;
};

const MIN_FLEX = 0.02;

/**
 * A single stacked bar showing how a total splits.
 *
 * No SVG — this is flexbox. Each segment's `flexGrow` is its share, so the row
 * fills the container exactly without anyone computing a pixel width, and it
 * stays correct across rotation and split-screen for free.
 *
 * `LinearTransition` handles the resize when the window changes. Layout
 * animations are the one sanctioned way to animate geometry: Reanimated drives
 * them from its own layout engine rather than by setting `width` on the JS
 * thread every frame. See docs/adr/0008-charts.md
 */
function ProportionBar({ segments, height = 8, className }: ProportionBarProps) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);

  if (total <= 0) {
    return (
      <View
        className={cn('overflow-hidden rounded-full bg-accents-2', className)}
        style={{ height, borderCurve: 'continuous' }}
      />
    );
  }

  return (
    <View
      className={cn('flex-row gap-0.5 overflow-hidden rounded-full', className)}
      style={{ height, borderCurve: 'continuous' }}>
      {segments.map((segment) => (
        <Animated.View
          key={segment.key}
          layout={LinearTransition.duration(motion.base)}
          style={{
            // A rounding-error segment still deserves a sliver rather than
            // vanishing — otherwise the legend lists a category the bar denies.
            flexGrow: Math.max(MIN_FLEX, segment.value / total),
            flexBasis: 0,
            backgroundColor: segment.color || colors.border,
          }}
        />
      ))}
    </View>
  );
}

export { ProportionBar };
export type { ProportionBarProps, Segment };
