import * as React from 'react';
import { View } from 'react-native';
import { Check } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { addExpense, categoryMeta } from '@/features/expenses';
import { formatDayRelative, formatMinor } from '@/lib/format';
import { strings } from '@/lib/strings';
import { motion } from '@/lib/theme';

import type { ChatMessage } from '../model/types';
import { useSetSuggestionState } from '../store/chat.store';

/**
 * The confirm step between "milk 30" and a stored record.
 *
 * **The chat path never writes unprompted.** One tap is a small price, and it
 * is the only thing standing between a misparse and a database quietly filling
 * with wrong entries — which, in a tracker whose whole value is the totals
 * being right, is the worst possible failure.
 *
 * Everything the write will contain is on the card first: label, amount,
 * category, date.
 */
export function ExpenseConfirmCard({ message }: { message: ChatMessage }) {
  const router = useRouter();
  const setSuggestionState = useSetSuggestionState();
  const suggestion = message.suggestion;

  const handleConfirm = React.useCallback(() => {
    if (!suggestion) return;
    addExpense({ ...suggestion, source: 'chat' });
    setSuggestionState(message.id, 'added');
  }, [message.id, setSuggestionState, suggestion]);

  const handleEdit = React.useCallback(() => {
    if (!suggestion) return;
    setSuggestionState(message.id, 'dismissed');
    // Hands the parse to the add form rather than discarding it — the model
    // usually got three of the four fields right.
    router.navigate({
      pathname: '/add',
      params: {
        label: suggestion.label,
        amountMinor: String(suggestion.amountMinor),
        categoryId: suggestion.categoryId,
        day: suggestion.day,
      },
    });
  }, [message.id, router, setSuggestionState, suggestion]);

  if (!suggestion || message.suggestionState === 'dismissed') return null;

  const meta = categoryMeta(suggestion.categoryId);
  const added = message.suggestionState === 'added';

  return (
    <Animated.View
      entering={FadeIn.duration(motion.base)}
      className="w-full flex-row justify-start">
      <View
        className="w-[85%] gap-4 rounded-lg border border-accents-2 bg-background p-4"
        style={{ borderCurve: 'continuous' }}>
        <Text className="font-medium uppercase tracking-wider text-label-12 text-accents-5">
          {strings.chat.confirmCard.title}
        </Text>

        <View className="gap-2">
          <View className="flex-row items-baseline justify-between gap-3">
            <Text className="flex-1 font-medium text-copy-16 text-foreground" numberOfLines={1}>
              {suggestion.label}
            </Text>
            <Text className="font-mono-medium text-heading-24 text-foreground">
              {formatMinor(suggestion.amountMinor)}
            </Text>
          </View>

          <View className="flex-row items-center gap-2">
            <View className="h-2 w-2 rounded-full" style={{ backgroundColor: meta.color }} />
            <Text className="text-copy-14 text-accents-5">{meta.label}</Text>
            <Text className="text-copy-14 text-accents-3">·</Text>
            <Text className="text-copy-14 text-accents-5">
              {formatDayRelative(suggestion.day)}
            </Text>
          </View>
        </View>

        {added ? (
          <View className="flex-row items-center gap-2">
            <Icon as={Check} size={14} className="text-blue" />
            <Text className="text-copy-14 text-blue">{strings.chat.confirmCard.added}</Text>
          </View>
        ) : (
          <View className="flex-row gap-2">
            <Button size="sm" className="flex-1" onPress={handleConfirm}>
              <Text>{strings.chat.confirmCard.confirm}</Text>
            </Button>
            <Button size="sm" variant="outline" className="flex-1" onPress={handleEdit}>
              <Text>{strings.chat.confirmCard.edit}</Text>
            </Button>
          </View>
        )}
      </View>
    </Animated.View>
  );
}
