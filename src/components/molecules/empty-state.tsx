import { View } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils/cn';
import { motion } from '@/lib/theme';

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  body: string;
  action?: { label: string; onPress: () => void };
  className?: string;
};

/**
 * Shown when a list has nothing in it — which, on first launch, is every list.
 *
 * The body says what to do next rather than restating the title, and the
 * action is the same verb the destination uses ("Add an expense" → the add
 * screen's "Save expense"), so the flow reads as one sentence.
 */
function EmptyState({ icon, title, body, action, className }: EmptyStateProps) {
  return (
    <Animated.View
      entering={FadeIn.duration(motion.base)}
      className={cn('items-center gap-3 px-6 py-12', className)}>
      <View
        className="h-12 w-12 items-center justify-center rounded-full bg-accents-1"
        style={{ borderCurve: 'continuous' }}>
        <Icon as={icon} size={20} className="text-accents-4" />
      </View>

      <View className="items-center gap-1">
        <Text className="font-semibold text-copy-16 text-foreground">{title}</Text>
        <Text className="text-center text-copy-14 text-accents-5">{body}</Text>
      </View>

      {action ? (
        <Button className="mt-2" onPress={action.onPress}>
          <Text>{action.label}</Text>
        </Button>
      ) : null}
    </Animated.View>
  );
}

export { EmptyState };
export type { EmptyStateProps };
