import * as React from 'react';
import { Alert, KeyboardAvoidingView, Platform, RefreshControl, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { MessageCircleQuestionMark } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState, PressableScale, ScreenHeader } from '@/components/molecules';
import { Text } from '@/components/ui/text';
import { refreshExpenses } from '@/features/expenses';
import { useRefreshControl } from '@/lib/hooks/use-refresh-control';
import { strings } from '@/lib/strings';
import { useThemeColors } from '@/lib/theme';

import { ChatSuggestions } from '../components/chat-suggestions';
import { Composer } from '../components/composer';
import { ExpenseConfirmCard } from '../components/expense-confirm-card';
import { MessageBubble } from '../components/message-bubble';
import { TypingIndicator } from '../components/typing-indicator';
import { useChat } from '../hooks/useChat';
import { useChatStore } from '../store/chat.store';
import type { ChatMessage } from '../model/types';

/**
 * The chat screen.
 *
 * Virtualized like every other list here — a transcript is capped at 50
 * messages, but "it is short" is not a reason to mount all of it.
 *
 * Natural order plus `maintainVisibleContentPosition`, not an inverted list.
 * FlashList v2 dropped `inverted` in favour of this, and it is the better
 * mechanism: nothing is flipped, so text selection, accessibility order and
 * the separator all behave the way they read. `startRenderingFromBottom`
 * covers the first paint, and the autoscroll threshold means a new reply
 * follows the user only when they are already at the bottom — scrolling back
 * through history does not get yanked forward mid-read.
 */
export function ChatScreen() {
  const insets = useSafeAreaInsets();
  const { messages, send, isPending } = useChat();
  const colors = useThemeColors();
  // Re-derives the spend digest the next message will carry, so a pull here
  // means the assistant is answering from current totals.
  const refresh = useRefreshControl(refreshExpenses);
  const clearChat = useChatStore((state) => state.clear);

  const handleClear = React.useCallback(() => {
    Alert.alert(strings.chat.clearTitle, strings.chat.clearBody, [
      { text: strings.common.cancel, style: 'cancel' },
      { text: strings.chat.clear, style: 'destructive', onPress: clearChat },
    ]);
  }, [clearChat]);

  const renderItem = React.useCallback(({ item }: { item: ChatMessage }) => {
    if (item.suggestion) {
      return (
        <View className="gap-3">
          <MessageBubble text={item.text} isUser={false} />
          <ExpenseConfirmCard message={item} />
        </View>
      );
    }
    return <MessageBubble text={item.text} isUser={item.role === 'user'} />;
  }, []);

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      keyboardVerticalOffset={insets.bottom}
      behavior={Platform.select({ ios: 'padding', default: undefined })}>
      {/* Outside the list: a transcript header that scrolled away with the
          messages would take the only way to clear it with it. */}
      <View
        className="flex-row items-center justify-between px-4"
        style={{ paddingTop: insets.top + 8 }}>
        <ScreenHeader title={strings.chat.title} className="flex-1" />
        {messages.length > 0 ? (
          <PressableScale
            accessibilityRole="button"
            accessibilityLabel={strings.chat.clearTitle}
            hitSlop={12}
            onPress={handleClear}>
            <Text className="font-medium text-copy-14 text-accents-5">
              {strings.chat.clear}
            </Text>
          </PressableScale>
        ) : null}
      </View>

      <FlashList
        data={messages}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        getItemType={getItemType}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        maintainVisibleContentPosition={{
          startRenderingFromBottom: true,
          autoscrollToBottomThreshold: 0.2,
        }}
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 16 }}
        contentContainerClassName="px-4"
        refreshControl={
          <RefreshControl
            {...refresh}
            tintColor={colors.accent}
            colors={[colors.accent]}
            progressBackgroundColor={colors.background}
          />
        }
        ListFooterComponent={isPending ? <TypingIndicator /> : null}
        ListEmptyComponent={
          <View className="gap-4">
            <EmptyState
              icon={MessageCircleQuestionMark}
              title={strings.chat.empty.title}
              body={strings.chat.empty.body}
            />
            <ChatSuggestions onSelect={send} />
          </View>
        }
        ItemSeparatorComponent={Separator}
      />

      <Composer onSend={send} disabled={isPending} />
    </KeyboardAvoidingView>
  );
}

function Separator() {
  return <View className="h-3" />;
}

function keyExtractor(item: ChatMessage): string {
  return item.id;
}

/** A confirm card is much taller than a bubble; separate pools stop the jump. */
function getItemType(item: ChatMessage): string {
  if (item.suggestion) return 'suggestion';
  return item.role;
}
