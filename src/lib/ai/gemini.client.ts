import {
  GEMINI_ENDPOINT,
  GEMINI_GENERATION_CONFIG,
  GEMINI_KEY_HEADER,
  HISTORY_TURN_LIMIT,
  REQUEST_TIMEOUT_MS,
} from './gemini.config';
import { GeminiError, type GeminiRequest, type GeminiTurn } from './types';

/**
 * One round trip to Gemini, returning the raw JSON text it produced.
 *
 * Parsing that text into something the app trusts is the caller's job — this
 * module guarantees a *string that came back from the API*, nothing more.
 * Structured output constrains shape, not sanity.
 */
export async function generateStructured(request: GeminiRequest): Promise<string> {
  if (!request.apiKey) throw new GeminiError('no-key');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  // Honour a caller's cancellation too — React Query aborts in-flight mutations
  // when the chat screen unmounts.
  request.signal?.addEventListener('abort', () => controller.abort());

  let response: Response;
  try {
    response = await fetch(GEMINI_ENDPOINT, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        [GEMINI_KEY_HEADER]: request.apiKey,
      },
      body: JSON.stringify(buildBody(request)),
      signal: controller.signal,
    });
  } catch (error) {
    // An aborted fetch and a dead socket both land here; only the deadline
    // distinguishes them, and they need different copy.
    throw new GeminiError(
      controller.signal.aborted ? 'timeout' : 'network',
      error instanceof Error ? error.message : undefined
    );
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) throw errorForStatus(response.status);

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new GeminiError('malformed', 'Response body was not JSON.');
  }

  const text = extractText(payload);
  if (text === undefined) throw new GeminiError('malformed', 'No text part in the response.');
  return text;
}

function buildBody(request: GeminiRequest) {
  return {
    systemInstruction: { parts: [{ text: request.systemInstruction }] },
    contents: [
      ...trimHistory(request.history).map((turn) => ({
        role: turn.role,
        parts: [{ text: turn.text }],
      })),
      { role: 'user' as const, parts: [{ text: request.message }] },
    ],
    generationConfig: {
      ...GEMINI_GENERATION_CONFIG,
      responseSchema: request.responseSchema,
    },
  };
}

/**
 * Keeps the last N turns, and never starts on a `model` turn — Gemini rejects
 * a `contents` array whose first entry is not from the user, which is exactly
 * what a naive `slice(-6)` produces half the time.
 */
function trimHistory(history: readonly GeminiTurn[]): GeminiTurn[] {
  const recent = history.slice(-HISTORY_TURN_LIMIT);
  const firstUser = recent.findIndex((turn) => turn.role === 'user');
  return firstUser <= 0 ? recent : recent.slice(firstUser);
}

function errorForStatus(status: number): GeminiError {
  if (status === 400 || status === 401 || status === 403) return new GeminiError('invalid-key');
  if (status === 429) return new GeminiError('rate-limited');
  if (status >= 500) return new GeminiError('network');
  return new GeminiError('unexpected', `HTTP ${status}`);
}

/** Walks to `candidates[0].content.parts[0].text` without trusting a step. */
function extractText(payload: unknown): string | undefined {
  if (typeof payload !== 'object' || payload === null) return undefined;
  const candidates = (payload as { candidates?: unknown }).candidates;
  if (!Array.isArray(candidates) || candidates.length === 0) return undefined;

  const parts = (candidates[0] as { content?: { parts?: unknown } })?.content?.parts;
  if (!Array.isArray(parts)) return undefined;

  const text = (parts[0] as { text?: unknown })?.text;
  return typeof text === 'string' ? text : undefined;
}
