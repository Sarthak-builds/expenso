import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';

import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils/cn';
import { motion } from '@/lib/theme';

type AnimatedValueProps = {
  /** Already formatted. This component animates presentation, not arithmetic. */
  value: string;
  className?: string;
};

/**
 * Swaps a formatted figure with a short vertical cross-fade.
 *
 * Deliberately NOT a digit tween. Tweening would mean formatting on the UI
 * thread, and `Intl` does not exist in a worklet — the usual workaround is to
 * hand-roll grouping in a worklet, which reintroduces the currency formatting
 * this app keeps in exactly one place.
 *
 * Keying on the value is what drives the animation: a new string is a new
 * element, so `entering` runs. Same value, no key change, no animation.
 */
function AnimatedValue({ value, className }: AnimatedValueProps) {
  return (
    <Animated.View
      key={value}
      entering={FadeInDown.duration(motion.slow)}
      exiting={FadeOutUp.duration(motion.fast)}>
      <Text className={cn('font-mono', className)}>{value}</Text>
    </Animated.View>
  );
}

export { AnimatedValue };
export type { AnimatedValueProps };
