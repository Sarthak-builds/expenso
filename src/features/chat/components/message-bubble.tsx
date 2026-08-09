import * as React from 'react';
import { View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils/cn';
import { motion } from '@/lib/theme';

/**
 * One turn in the transcript.
 *
 * The user's turn is Geist's solid black; the assistant's is the faintest
 * accent fill. That is the whole visual language — no tails, no avatars, no
 * timestamps. Alignment and fill already say who is speaking.
 *
 * `max-w-[85%]` rather than a fixed width so a two-word reply is a two-word
 * bubble.
 */
export const MessageBubble = React.memo(function MessageBubble({
  text,
  isUser,
}: {
  text: string;
  isUser: boolean;
}) {
  return (
    <Animated.View
      entering={FadeInDown.duration(motion.base)}
      className={cn('w-full flex-row', isUser ? 'justify-end' : 'justify-start')}>
      <View
        className={cn(
          'max-w-[85%] rounded-lg px-4 py-3',
          isUser ? 'bg-foreground' : 'bg-accents-1'
        )}
        style={{ borderCurve: 'continuous' }}>
        <Text className={cn('text-copy-16', isUser ? 'text-background' : 'text-foreground')}>
          {text}
        </Text>
      </View>
    </Animated.View>
  );
});
