import type { CategoryId, DayKey } from '@/features/expenses';

/**
 * `features/chat` may import `features/expenses`. That edge is sanctioned and
 * ONE-WAY — nothing in expenses imports chat. See CLAUDE.md.
 */

/** The three things a message can be. `clarify` is not optional — see below. */
export type ChatIntent = 'add_expense' | 'answer_question' | 'clarify';

/** A parsed, sanitised expense the model proposed. Never written unprompted. */
export type ExpenseSuggestion = {
  label: string;
  amountMinor: number;
  categoryId: CategoryId;
  day: DayKey;
};

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  createdAt: number;
  /** Present only on an `add_expense` reply. Renders as a confirm card. */
  suggestion?: ExpenseSuggestion;
  /** Flips to `added` once the user confirms, so the card cannot double-write. */
  suggestionState?: 'pending' | 'added' | 'dismissed';
};

/** What the model returned, after validation. */
export type ChatReply = {
  intent: ChatIntent;
  reply: string;
  suggestion?: ExpenseSuggestion;
};
