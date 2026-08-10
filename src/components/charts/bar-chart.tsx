import * as React from 'react';
import { View, type LayoutChangeEvent } from 'react-native';
import Svg, { Rect } from 'react-native-svg';

import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils/cn';
import { radius, useThemeColors } from '@/lib/theme';

import { maxY, type Point } from './path';

type BarChartProps = {
  points: readonly Point[];
  height?: number;
  /** Bar fill. Defaults to the active theme's accent. */
  color?: string;
  /** Up to two labels under the axis — usually the window's first and last day. */
  axisLabels?: [string, string];
  className?: string;
};

const MIN_BAR_WIDTH = 1;
const GAP_RATIO = 0.25;

/**
 * Daily totals as bars. Domain-free — it takes `{ x, y }` and nothing else.
 *
 * No gridlines, no axis ticks, no legend. Geist's chart language is minimal by
 * definition, and at 180 bars in a phone's width any gridline is louder than
 * the data. See docs/adr/0008-charts.md
 *
 * Bars are `<Rect>` rather than views: 180 views is 180 shadow nodes and a
 * layout pass each, while 180 rects is one SVG node with a flat child list.
 */
function BarChart({
  points,
  height = 120,
  color,
  axisLabels,
  className,
}: BarChartProps) {
  const [width, setWidth] = React.useState(0);
  // Resolved here rather than as a default parameter — a default cannot call a
  // hook, and hard-coding one would ignore the theme.
  const colors = useThemeColors();
  const barColor = color ?? colors.accent;

  const handleLayout = React.useCallback((event: LayoutChangeEvent) => {
    setWidth(event.nativeEvent.layout.width);
  }, []);

  const peak = maxY(points);
  const slot = points.length > 0 ? width / points.length : 0;
  // Below ~4px a gap eats the bar entirely, so dense windows render solid.
  const barWidth = Math.max(MIN_BAR_WIDTH, slot * (slot > 4 ? 1 - GAP_RATIO : 1));

  return (
    <View className={cn('gap-2', className)}>
      <View onLayout={handleLayout} style={{ height }}>
        {width > 0 ? (
          <Svg width={width} height={height}>
            {points.map((point, index) => {
              // Zero days still get a hairline, so the axis reads as a
              // continuous timeline rather than a series with holes in it.
              const barHeight = point.y > 0 ? Math.max(2, (point.y / peak) * height) : 1;
              return (
                <Rect
                  key={index}
                  x={index * slot + (slot - barWidth) / 2}
                  y={height - barHeight}
                  width={barWidth}
                  height={barHeight}
                  rx={radius.bar}
                  fill={point.y > 0 ? barColor : colors.border}
                />
              );
            })}
          </Svg>
        ) : null}
      </View>

      {axisLabels ? (
        <View className="flex-row justify-between">
          <Text className="font-mono text-label-12 text-accents-4">{axisLabels[0]}</Text>
          <Text className="font-mono text-label-12 text-accents-4">{axisLabels[1]}</Text>
        </View>
      ) : null}
    </View>
  );
}

export { BarChart };
export type { BarChartProps };
