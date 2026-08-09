import * as React from 'react';
import { Pressable, type PressableProps, type ViewStyle } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type AnimatedProps,
} from 'react-native-reanimated';

import { cn } from '@/lib/utils/cn';
import { motion } from '@/lib/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type PressableScaleProps = PressableProps & {
  /** How far to sink on press. `subtle` for rows, `firm` for cards and tiles. */
  depth?: 'subtle' | 'firm';
  className?: string;
  style?: AnimatedProps<{ style?: ViewStyle }>['style'];
};

const DEPTH = { subtle: 0.985, firm: 0.96 } as const;

/**
 * Press feedback that runs on the UI thread.
 *
 * `Pressable` rather than `TouchableOpacity`, and `transform`/`opacity` rather
 * than anything that triggers layout — those are the only two properties the
 * GPU can animate without a layout pass per frame.
 *
 * The shared value holds `pressed` (0 or 1), not `scale`. State is the minimal
 * truth; the visual is derived. That is what lets opacity and scale come off
 * one value, and it makes the animation readable when you inspect it.
 */
function PressableScale({
  depth = 'subtle',
  className,
  style,
  onPressIn,
  onPressOut,
  disabled,
  ...props
}: PressableScaleProps) {
  const pressed = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(pressed.get(), [0, 1], [1, DEPTH[depth]]) }],
    opacity: interpolate(pressed.get(), [0, 1], [1, 0.9]),
  }));

  const handlePressIn = React.useCallback<NonNullable<PressableProps['onPressIn']>>(
    (event) => {
      pressed.set(withTiming(1, { duration: motion.fast }));
      onPressIn?.(event);
    },
    [onPressIn, pressed]
  );

  const handlePressOut = React.useCallback<NonNullable<PressableProps['onPressOut']>>(
    (event) => {
      pressed.set(withTiming(0, { duration: motion.base }));
      onPressOut?.(event);
    },
    [onPressOut, pressed]
  );

  return (
    <AnimatedPressable
      className={cn(disabled && 'opacity-50', className)}
      disabled={disabled}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[animatedStyle, style]}
      {...props}
    />
  );
}

export { PressableScale };
export type { PressableScaleProps };
