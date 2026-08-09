import { randomUUID } from 'expo-crypto';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { mmkvSessionStorage } from '@/lib/storage';

import type { ChatMessage, ExpenseSuggestion } from '../model/types';

/** Bounded so `persist` — which rewrites the whole slice — stays cheap. */
const MAX_MESSAGES = 50;

type ChatState = {
  messages: ChatMessage[];
  append: (message: Omit<ChatMessage, 'id' | 'createdAt'>) => ChatMessage;
  setSuggestionState: (id: string, state: NonNullable<ChatMessage['suggestionState']>) => void;
  clear: () => void;
};

export const useChatStore = create<ChatState>()(
  persist<ChatState, [], [], Pick<ChatState, 'messages'>>(
    (set) => ({
      messages: [],

      append: (message) => {
        const entry: ChatMessage = { ...message, id: randomUUID(), createdAt: Date.now() };
        set((state) => ({ messages: [...state.messages, entry].slice(-MAX_MESSAGES) }));
        return entry;
      },

      setSuggestionState: (id, suggestionState) =>
        set((state) => ({
          messages: state.messages.map((entry) =>
            entry.id === id ? { ...entry, suggestionState } : entry
          ),
        })),

      clear: () => set({ messages: [] }),
    }),
    {
      name: 'store:chat',
      storage: createJSONStorage(() => mmkvSessionStorage),
      partialize: (state) => ({ messages: state.messages }),
    }
  )
);

export const useMessages = () => useChatStore((state) => state.messages);
export const useAppendMessage = () => useChatStore((state) => state.append);
export const useSetSuggestionState = () => useChatStore((state) => state.setSuggestionState);

/** Suggestions are read at confirm time, not held in component state. */
export function suggestionFor(id: string): ExpenseSuggestion | undefined {
  return useChatStore.getState().messages.find((entry) => entry.id === id)?.suggestion;
}
