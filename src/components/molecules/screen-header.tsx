import { View } from 'react-native';

import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils/cn';

type ScreenHeaderProps = {
  title: string;
  /** One line under the title. Context, not decoration — omit if it repeats. */
  subtitle?: string;
  /** Right-aligned slot: a filter, a count, an action. */
  children?: React.ReactNode;
  className?: string;
};

/**
 * The title block at the top of every tab.
 *
 * Exists because the four screens had drifted: two had a `heading-40` title,
 * two had none at all, and each set its own top padding. A screen you reach by
 * tapping a tab needs to say where you are, and it needs to say it in the same
 * place every time — otherwise switching tabs makes the content appear to jump.
 *
 * Vertical rhythm lives here, not at the call sites. Screens supply the safe
 * area inset via their scroll container's `contentContainerStyle`; this adds
 * the breathing room between the status bar and the title, which was the part
 * that felt cramped.
 */
function ScreenHeader({ title, subtitle, children, className }: ScreenHeaderProps) {
  return (
    <View className={cn('gap-4 pb-2 pt-2', className)}>
      <View className="flex-row items-start justify-between gap-4">
        <View className="flex-1 gap-1">
          {/* `accessibilityRole="header"` lets a screen reader jump straight
              here, which is the whole point of a landmark. */}
          <Text
            accessibilityRole="header"
            className="font-bold text-heading-40 text-foreground">
            {title}
          </Text>
          {subtitle ? (
            <Text className="text-copy-14 text-accents-5">{subtitle}</Text>
          ) : null}
        </View>
      </View>

      {children}
    </View>
  );
}

export { ScreenHeader };
export type { ScreenHeaderProps };
