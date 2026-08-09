import * as React from 'react';
import { View, type LayoutChangeEvent } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { colors } from '@/lib/theme';

import { areaPath, linePath, scalePoints, type Point } from './path';

type SparklineProps = {
  points: readonly Point[];
  height?: number;
  color?: string;
  /** Faint fill under the line. Off by default — one stroke is usually enough. */
  filled?: boolean;
  className?: string;
};

/**
 * One `<Path>`, sharing the bar chart's geometry helpers.
 *
 * Deliberately axis-less and label-less: a sparkline's job is shape, not
 * magnitude — the figure it sits beside carries the number. See
 * docs/adr/0008-charts.md
 */
function Sparkline({
  points,
  height = 32,
  color = colors.accent,
  filled = false,
  className,
}: SparklineProps) {
  const [width, setWidth] = React.useState(0);

  const handleLayout = React.useCallback((event: LayoutChangeEvent) => {
    setWidth(event.nativeEvent.layout.width);
  }, []);

  // Inset by the stroke's half-width so the extremes are not clipped.
  const scaled = width > 0 ? scalePoints(points, { width, height: height - 2 }) : [];

  return (
    <View onLayout={handleLayout} className={className} style={{ height }}>
      {scaled.length > 1 ? (
        <Svg width={width} height={height}>
          {filled ? (
            <Path d={areaPath(scaled, height)} fill={color} fillOpacity={0.08} />
          ) : null}
          <Path
            d={linePath(scaled)}
            stroke={color}
            strokeWidth={1.5}
            strokeLinejoin="round"
            strokeLinecap="round"
            fill="none"
            translateY={1}
          />
        </Svg>
      ) : null}
    </View>
  );
}

export { Sparkline };
export type { SparklineProps };
