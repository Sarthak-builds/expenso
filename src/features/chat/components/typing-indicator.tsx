import * as React from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { motion } from '@/lib/theme';

const DOTS = [0, 1, 2];
const CYCLE_MS = 900;

/**
 * Three dots that breathe while Gemini is thinking.
 *
 * One shared value drives all three: `progress` runs 0→1 on a loop and each dot
 * reads it at a phase offset. Three separate timers would drift apart within a
 * few seconds and look broken.
 *
 * Opacity and scale only — a spinner that reflows layout every frame to
 * indicate waiting is a poor trade.
 */
export function TypingIndicator() {
  const progress = useSharedValue(0);

  React.useEffect(() => {
    progress.set(
      withRepeat(withTiming(1, { duration: CYCLE_MS, easing: Easing.linear }), -1, false)
    );
  }, [progress]);

  return (
    <Animated.View
      entering={FadeIn.duration(motion.fast)}
      exiting={FadeOut.duration(motion.fast)}
      className="w-full flex-row justify-start">
      <View
        className="flex-row items-center gap-1.5 rounded-lg bg-accents-1 px-4 py-4"
        style={{ borderCurve: 'continuous' }}>
        {DOTS.map((index) => (
          <Dot key={index} index={index} progress={progress} />
        ))}
      </View>
    </Animated.View>
  );
}

function Dot({
  index,
  progress,
}: {
  index: number;
  progress: ReturnType<typeof useSharedValue<number>>;
}) {
  const style = useAnimatedStyle(() => {
    // Phase-shift each dot by a third of the cycle, wrapping at 1.
    const phase = (progress.get() + index / DOTS.length) % 1;
    // Triangle wave: up for the first half, down for the second.
    const wave = phase < 0.5 ? phase * 2 : (1 - phase) * 2;
    return {
      opacity: interpolate(wave, [0, 1], [0.25, 1]),
      transform: [{ scale: interpolate(wave, [0, 1], [0.8, 1]) }],
    };
  });

  return <Animated.View style={style} className="h-1.5 w-1.5 rounded-full bg-accents-5" />;
}
