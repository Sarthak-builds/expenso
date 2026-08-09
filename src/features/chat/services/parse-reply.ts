import { isCategoryId } from '@/features/expenses';
import { GeminiError } from '@/lib/ai';
import { addDays, clampDayKey, isDayKey, todayKey } from '@/lib/format';

import type { ChatIntent, ChatReply, ExpenseSuggestion } from '../model/types';

/**
 * Turns Gemini's JSON text into something the app is willing to act on.
 *
 * **The model response is untrusted input.** `responseSchema` constrains
 * shape, not sanity — it will happily return an `amountMinor` of `-1`, a `day`
 * in 2031, or a 4,000-character label, all perfectly schema-valid. Every one of
 * those would be written straight into MMKV without this pass.
 *
 * See docs/adr/0007-gemini-integration.md
 */

const MAX_LABEL_LENGTH = 64;
const MAX_BACKDATE_DAYS = 365;
/** ₹10,00,000. Above this it is a parse error, not a grocery run. */
const MAX_AMOUNT_MINOR = 100_000_000;

const INTENTS: readonly ChatIntent[] = ['add_expense', 'answer_question', 'clarify'];

export function parseChatReply(json: string): ChatReply {
  let payload: unknown;
  try {
    payload = JSON.parse(json);
  } catch {
    throw new GeminiError('malformed', 'Reply was not valid JSON.');
  }

  if (typeof payload !== 'object' || payload === null) {
    throw new GeminiError('malformed', 'Reply was not an object.');
  }

  const record = payload as Record<string, unknown>;

  const intent = INTENTS.includes(record.intent as ChatIntent)
    ? (record.intent as ChatIntent)
    : 'answer_question';

  const reply = typeof record.reply === 'string' ? record.reply.trim() : '';
  if (reply === '') throw new GeminiError('malformed', 'Reply had no text.');

  // A suggestion is only ever built for add_expense. If the model sets an
  // expense on a clarify — which it does occasionally — it is dropped, because
  // the whole point of clarify is that something was missing.
  const suggestion = intent === 'add_expense' ? parseSuggestion(record.expense) : undefined;

  // An add_expense whose payload failed validation is not an add_expense.
  // Degrading to clarify asks the user for the missing piece instead of
  // silently doing nothing.
  return suggestion || intent !== 'add_expense'
    ? { intent, reply, ...(suggestion ? { suggestion } : {}) }
    : { intent: 'clarify', reply };
}

function parseSuggestion(value: unknown): ExpenseSuggestion | undefined {
  if (typeof value !== 'object' || value === null) return undefined;
  const record = value as Record<string, unknown>;

  const label = typeof record.label === 'string' ? record.label.trim() : '';
  if (label === '') return undefined;

  const amountMinor = record.amountMinor;
  if (
    typeof amountMinor !== 'number' ||
    !Number.isFinite(amountMinor) ||
    !Number.isInteger(amountMinor) ||
    amountMinor <= 0 ||
    amountMinor > MAX_AMOUNT_MINOR
  ) {
    return undefined;
  }

  if (!isCategoryId(record.categoryId)) return undefined;

  const today = todayKey();
  // Clamped rather than rejected: "milk yesterday" with a slightly wrong year
  // is still a real expense, and the confirm card shows the date before
  // anything is written.
  const day =
    typeof record.day === 'string' && isDayKey(record.day)
      ? clampDayKey(record.day, addDays(today, -MAX_BACKDATE_DAYS), today)
      : today;

  return { label: label.slice(0, MAX_LABEL_LENGTH), amountMinor, categoryId: record.categoryId, day };
}
