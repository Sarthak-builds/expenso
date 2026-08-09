import { buildSpendDigest } from '@/features/expenses';
import { GeminiError, generateStructured, getGeminiKey, type GeminiTurn } from '@/lib/ai';
import { todayKey } from '@/lib/format';

import type { ChatMessage, ChatReply } from '../model/types';
import { parseChatReply } from './parse-reply';
import { chatResponseSchema } from './response.schema';
import { buildSystemInstruction } from './system-instruction';

/**
 * One user message → one validated reply. One round trip.
 *
 * Composition order matters: the digest is memoized on `revision`, so it is
 * free when nothing has been added since the last message and recomputed
 * exactly once when something has.
 */
export async function sendChatMessage({
  message,
  history,
  revision,
  signal,
}: {
  message: string;
  history: readonly ChatMessage[];
  revision: number;
  signal?: AbortSignal;
}): Promise<ChatReply> {
  const apiKey = getGeminiKey();
  if (!apiKey) throw new GeminiError('no-key');

  const today = todayKey();

  const json = await generateStructured({
    apiKey,
    systemInstruction: buildSystemInstruction(today, buildSpendDigest(revision, today)),
    history: toTurns(history),
    message,
    responseSchema: chatResponseSchema,
    ...(signal ? { signal } : {}),
  });

  return parseChatReply(json);
}

/**
 * Only the prose crosses the wire. Confirm cards, suggestion state and ids are
 * local presentation, and replaying them as text would spend tokens teaching
 * the model a UI it cannot see.
 */
function toTurns(history: readonly ChatMessage[]): GeminiTurn[] {
  return history.map((entry) => ({
    role: entry.role === 'user' ? 'user' : 'model',
    text: entry.text,
  }));
}
