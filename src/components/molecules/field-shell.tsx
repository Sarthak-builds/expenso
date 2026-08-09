import { View } from 'react-native';
import Animated, { FadeInUp, FadeOut } from 'react-native-reanimated';

import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils/cn';
import { motion } from '@/lib/theme';

type FieldShellProps = {
  label: string;
  /** The control itself — an input, a chip grid, a date picker. */
  children: React.ReactNode;
  /** Static guidance. Hidden while an error is showing, to avoid two hints. */
  hint?: string;
  error?: string;
  /** Marks the field required to assistive tech. No asterisk — see below. */
  required?: boolean;
  className?: string;
};

/**
 * Label, control, and the one line of feedback beneath it.
 *
 * Every field in the app is wrapped in this, which is what keeps label
 * placement, spacing and error colour identical across the login form, the add
 * form and settings — none of them restyle a label.
 *
 * No required asterisk: on a four-field form where three are required, marking
 * them is noise. The submit button reports what is missing instead.
 *
 * The error animates in rather than appearing instantly, because it shifts the
 * content below it — an unannounced jump reads as a glitch.
 */
function FieldShell({ label, children, hint, error, required, className }: FieldShellProps) {
  return (
    <View className={cn('gap-2', className)}>
      {/* `Label` already renders its own text node — nesting one inside would
          put a Text in a Text and lose the label's press-to-focus behaviour. */}
      <Label className="font-medium text-copy-14 text-foreground">{label}</Label>

      <View aria-required={required}>{children}</View>

      {error ? (
        <Animated.View entering={FadeInUp.duration(motion.fast)} exiting={FadeOut}>
          <Text className="text-copy-14 text-red">{error}</Text>
        </Animated.View>
      ) : hint ? (
        <Text className="text-copy-14 text-accents-5">{hint}</Text>
      ) : null}
    </View>
  );
}

export { FieldShell };
export type { FieldShellProps };
