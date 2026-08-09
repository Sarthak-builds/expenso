import * as React from 'react';
import { KeyboardAvoidingView, Platform, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { MessageCircleQuestionMark } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/molecules';
import { strings } from '@/lib/strings';

import { Composer } from '../components/composer';
import { ExpenseConfirmCard } from '../components/expense-confirm-card';
import { MessageBubble } from '../components/message-bubble';
import { TypingIndicator } from '../components/typing-indicator';
import { useChat } from '../hooks/useChat';
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
        contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 16 }}
        contentContainerClassName="px-4"
        ListFooterComponent={isPending ? <TypingIndicator /> : null}
        ListEmptyComponent={
          <EmptyState
            icon={MessageCircleQuestionMark}
            title={strings.chat.empty.title}
            body={strings.chat.empty.body}
          />
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
