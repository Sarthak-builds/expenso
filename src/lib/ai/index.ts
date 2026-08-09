export { geminiKeySource, getGeminiKey, setGeminiKeyOverride } from './api-key';
export { generateStructured } from './gemini.client';
export { GEMINI_MODEL, HISTORY_TURN_LIMIT } from './gemini.config';
export { GeminiError } from './types';

export type {
  GeminiErrorKind,
  GeminiRequest,
  GeminiRole,
  GeminiSchema,
  GeminiTurn,
} from './types';
