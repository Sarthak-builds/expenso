import { CATEGORY_IDS } from '@/features/expenses';
import type { GeminiSchema } from '@/lib/ai';

/**
 * The structured-output contract.
 *
 * One call with a discriminated union, rather than classify-then-extract. Two
 * calls double latency and cost to answer a question the model already knows
 * the answer to while it is reading the message.
 *
 * `enum` on `intent` and `categoryId` is the load-bearing part: the app can
 * never receive a category it does not understand, so there is no "unknown
 * category" branch anywhere downstream.
 *
 * See docs/adr/0007-gemini-integration.md
 */
export const chatResponseSchema: GeminiSchema = {
  type: 'OBJECT',
  properties: {
    intent: {
      type: 'STRING',
      enum: ['add_expense', 'answer_question', 'clarify'],
      description: 'add_expense only when a label AND an amount are both present.',
    },
    expense: {
      type: 'OBJECT',
      nullable: true,
      description: 'Present only when intent is add_expense.',
      properties: {
        label: { type: 'STRING', description: 'What was bought, e.g. "Milk".' },
        amountMinor: {
          type: 'INTEGER',
          description: 'Amount in paise. 30 rupees is 3000.',
        },
        categoryId: { type: 'STRING', enum: CATEGORY_IDS },
        day: { type: 'STRING', description: 'YYYY-MM-DD, local date.' },
      },
      required: ['label', 'amountMinor', 'categoryId', 'day'],
      propertyOrdering: ['label', 'amountMinor', 'categoryId', 'day'],
    },
    reply: {
      type: 'STRING',
      description: 'One or two sentences shown to the user.',
    },
  },
  required: ['intent', 'reply'],
  // Ordering matters: the model commits to an intent before writing the reply,
  // so the prose it produces is consistent with the branch it chose.
  propertyOrdering: ['intent', 'expense', 'reply'],
};
