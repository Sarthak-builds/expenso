/**
 * Transport types for the Gemini call.
 *
 * Domain-free on purpose: this module knows about turns, schemas and HTTP
 * failures, never about expenses. The response schema and system instruction
 * are supplied by the caller, which is what keeps `lib/ai` free of a
 * `CategoryId` import.
 */

export type GeminiRole = 'user' | 'model';

export type GeminiTurn = { role: GeminiRole; text: string };

/**
 * A subset of OpenAPI 3 — the shape Gemini's `responseSchema` accepts.
 * Narrow rather than complete: it covers what this app declares and nothing
 * speculative.
 */
export type GeminiSchema = {
  type: 'OBJECT' | 'STRING' | 'NUMBER' | 'INTEGER' | 'BOOLEAN' | 'ARRAY';
  description?: string;
  nullable?: boolean;
  enum?: readonly string[];
  items?: GeminiSchema;
  properties?: Record<string, GeminiSchema>;
  required?: readonly string[];
  /** Gemini honours field order in the output when this is set. */
  propertyOrdering?: readonly string[];
};

export type GeminiRequest = {
  apiKey: string;
  systemInstruction: string;
  history: readonly GeminiTurn[];
  message: string;
  responseSchema: GeminiSchema;
  signal?: AbortSignal;
};

/**
 * Every way the call can fail, as a closed set.
 *
 * The UI maps each to a sentence that says what to do next, so an unhandled
 * variant would be a compile error rather than a blank error state.
 */
export type GeminiErrorKind =
  | 'no-key'
  | 'invalid-key'
  | 'rate-limited'
  | 'network'
  | 'timeout'
  | 'malformed'
  | 'unexpected';

export class GeminiError extends Error {
  readonly kind: GeminiErrorKind;

  constructor(kind: GeminiErrorKind, message?: string) {
    super(message ?? kind);
    this.name = 'GeminiError';
    this.kind = kind;
  }
}
