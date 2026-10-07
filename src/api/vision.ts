import { VisionError, type VisionErrorKind } from '@/api/errors';
import { estimateWithGemini, verifyGeminiKey } from '@/api/gemini';
import { getApiKey } from '@/api/keyStore';
import { parseEstimate } from '@/api/parse';
import { userPrompt } from '@/api/prompt';
import type { Dictionary, Language } from '@/i18n';
import type { MealEstimate } from '@/types';

/**
 * The vision facade. Screens call `estimateMeal` and `verifyApiKey` here; this
 * module owns the single Gemini transport and parses its structured JSON.
 */

export { VisionError } from '@/api/errors';
export type { VisionErrorKind } from '@/api/errors';

/**
 * Estimates a meal from a base64 JPEG, with names in the app's language.
 *
 * Retries once on malformed JSON, then gives up so the caller can fall back to
 * manual entry with the photo attached.
 *
 * Preconditions:
 * base64Jpeg is the raw base64 payload, without a data URI prefix
 */
export async function estimateMeal(
  base64Jpeg: string,
  language: Language,
  signal?: AbortSignal,
): Promise<MealEstimate> {
  const apiKey = await getApiKey();
  if (!apiKey) {
    throw new VisionError('no_key', 'No API key is set.');
  }
  const request = () => estimateWithGemini(apiKey, base64Jpeg, userPrompt(language), signal);

  try {
    return parseEstimate(await request());
  } catch (error) {
    if (error instanceof VisionError && error.kind === 'malformed') {
      return parseEstimate(await request());
    }
    throw error;
  }
}

/** Confirms the stored key works, for the "Test key" button. */
export async function verifyApiKey(): Promise<void> {
  const apiKey = await getApiKey();
  if (!apiKey) {
    throw new VisionError('no_key', 'No API key is set.');
  }
  return verifyGeminiKey(apiKey);
}

/* -------------------------------------------------------------------------- */
/* Recovery                                                                    */
/* -------------------------------------------------------------------------- */

export type RecoveryAction = 'retry' | 'settings' | 'manual';

export function errorKindOf(error: unknown): VisionErrorKind {
  return error instanceof VisionError ? error.kind : 'malformed';
}

/** What the error screen offers first. Errors say what happened and what to do. */
export const RECOVERY: Record<VisionErrorKind, RecoveryAction> = {
  no_key: 'settings',
  unauthorized: 'settings',
  billing: 'retry',
  rate_limited: 'retry',
  server: 'retry',
  network: 'retry',
  timeout: 'retry',
  cancelled: 'retry',
  malformed: 'manual',
};

const COPY_KEY: Record<VisionErrorKind, keyof Dictionary['visionErrors']> = {
  no_key: 'noKey',
  unauthorized: 'unauthorized',
  billing: 'billing',
  rate_limited: 'rateLimited',
  server: 'network',
  network: 'network',
  timeout: 'timeout',
  cancelled: 'cancelled',
  malformed: 'malformed',
};

export function copyForError(
  tr: Dictionary,
  error: unknown,
): { title: string; detail: string; action: RecoveryAction } {
  const kind = errorKindOf(error);
  return { ...tr.visionErrors[COPY_KEY[kind]], action: RECOVERY[kind] };
}
