import * as React from 'react';
import { useMutation } from '@tanstack/react-query';

import { useRevision } from '@/features/expenses';
import { GeminiError, type GeminiErrorKind } from '@/lib/ai';
import { strings } from '@/lib/strings';

import type { ChatReply } from '../model/types';
import { sendChatMessage } from '../services/send-message';
import { useAppendMessage, useChatStore, useMessages } from '../store/chat.store';

const ERROR_MESSAGES: Record<GeminiErrorKind, string> = {
  'no-key': strings.chat.errors.noKey,
  'invalid-key': strings.chat.errors.invalidKey,
  'rate-limited': strings.chat.errors.rateLimited,
  network: strings.chat.errors.network,
  timeout: strings.chat.errors.timeout,
  malformed: strings.chat.errors.malformed,
  unexpected: strings.chat.errors.unexpected,
};

/**
 * The chat transcript and the one mutation that extends it.
 *
 * This is the ONLY React Query usage in the app — a real network call with
 * retries, in-flight state and cancellation, which is what the library is
 * actually for. Local reads stay synchronous. See
 * docs/adr/0002-state-management.md
 *
 * Failures land in the transcript as an assistant message rather than in a
 * banner. The user asked a question; the answer is "I couldn't reach Gemini",
 * and that belongs in the conversation where the question is.
 */
export function useChat() {
  const messages = useMessages();
  const append = useAppendMessage();
  const revision = useRevision();

  const mutation = useMutation<ChatReply, unknown, string>({
    mutationFn: (message) =>
      sendChatMessage({
        // Read history at call time: the user's own message is appended before
        // this runs, and echoing it back as history would duplicate it.
        history: useChatStore.getState().messages.slice(0, -1),
        message,
        revision,
      }),

    onSuccess: (reply) => {
      append({
        role: 'assistant',
        text: reply.reply,
        ...(reply.suggestion
          ? { suggestion: reply.suggestion, suggestionState: 'pending' as const }
          : {}),
      });
    },

    onError: (error) => {
      const kind = error instanceof GeminiError ? error.kind : 'unexpected';
      append({ role: 'assistant', text: ERROR_MESSAGES[kind] });
    },
  });

  const send = React.useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (trimmed === '' || mutation.isPending) return;
      append({ role: 'user', text: trimmed });
      mutation.mutate(trimmed);
    },
    [append, mutation]
  );

  return { messages, send, isPending: mutation.isPending };
}
