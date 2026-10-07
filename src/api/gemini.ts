import { VisionError } from '@/api/errors';
import { SYSTEM_PROMPT } from '@/api/prompt';

/**
 * Google Gemini transport.
 *
 * Uses the Generative Language API. The key travels in the `x-goog-api-key`
 * header rather than the URL, so it never lands in request logs.
 * Current flash models have vision and a free-tier quota, so the app works
 * without a funded account (`gemini-2.5-flash` is closed to new keys). The
 * task prompt goes in `systemInstruction`; the image and the per-request ask go
 * in `contents`. `responseMimeType: application/json` makes the model return a
 * bare JSON object, which the shared parser then reads.
 */

/**
 * Tried in order. Busy models answer 503 ("high demand") at peak times, so a
 * request that keeps failing that way moves on to the next model instead of
 * failing the estimate.
 */
const MODELS = [
  { name: 'gemini-3.5-flash', attempts: 2 },
  { name: 'gemini-3.1-flash-lite', attempts: 1 },
  { name: 'gemini-3.8-flash', attempts: 1 },
] as const;
const MODELS_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models';
/** Per request. A busy model can hang instead of answering 503, so give up and move on. */
const TIMEOUT_MS = 20_000;
const RETRY_DELAY_MS = 700;

function endpointFor(model: string): string {
  return `${MODELS_ENDPOINT}/${model}:generateContent`;
}

/** Waits, unless the estimate is cancelled first. */
function pause(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(new VisionError('cancelled', 'Estimate cancelled.'));
    });
  });
}

interface GeminiResponse {
  candidates?: {
    content?: { parts?: { text?: string }[] };
  }[];
}

/** Sends the image and returns the model's raw text (expected to be JSON). */
export async function estimateWithGemini(
  apiKey: string,
  base64Jpeg: string,
  userPrompt: string,
  signal?: AbortSignal,
): Promise<string> {
  const body = {
    systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents: [
      {
        role: 'user',
        parts: [
          { inline_data: { mime_type: 'image/jpeg', data: base64Jpeg } },
          { text: userPrompt },
        ],
      },
    ],
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.2,
      maxOutputTokens: 4096,
    },
  };

  let lastError: unknown = new VisionError('server', 'The service is unavailable.');
  for (const model of MODELS) {
    for (let attempt = 0; attempt < model.attempts; attempt += 1) {
      try {
        const response = await post(endpointFor(model.name), apiKey, body, signal);
        const text = firstPartText(response);
        if (!text) {
          throw new VisionError('malformed', 'The estimate came back empty.');
        }
        return text;
      } catch (error) {
        // Only an overloaded or retired model is worth another try; a bad key,
        // a rate limit or a cancel is the same on every model.
        const retryable = error instanceof VisionError && (error.kind === 'server' || error.kind === 'timeout');
        if (!retryable) throw error;
        lastError = error;
        await pause(RETRY_DELAY_MS * (attempt + 1), signal);
      }
    }
  }
  throw lastError;
}

/**
 * Validates the key by listing models — no generate quota is spent, which
 * matters on the free tier where request-per-day limits are tight.
 */
export async function verifyGeminiKey(apiKey: string): Promise<void> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  let response: Response;
  try {
    response = await fetch(MODELS_ENDPOINT, {
      headers: { 'x-goog-api-key': apiKey },
      signal: controller.signal,
    });
  } catch {
    throw controller.signal.aborted
      ? new VisionError('timeout', 'The check timed out.')
      : new VisionError('network', 'Could not reach the service.');
  } finally {
    clearTimeout(timeout);
  }
  if (!response.ok) {
    throw await errorForResponse(response);
  }
}

async function post(
  url: string,
  apiKey: string,
  body: unknown,
  signal: AbortSignal | undefined,
): Promise<GeminiResponse> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const onExternalAbort = () => controller.abort();
  signal?.addEventListener('abort', onExternalAbort);

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch {
    if (controller.signal.aborted) {
      throw new VisionError(
        signal?.aborted ? 'cancelled' : 'timeout',
        signal?.aborted ? 'Estimate cancelled.' : 'The estimate timed out.',
      );
    }
    throw new VisionError('network', 'Could not reach the service.');
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener('abort', onExternalAbort);
  }

  if (!response.ok) {
    throw await errorForResponse(response);
  }

  try {
    return (await response.json()) as GeminiResponse;
  } catch {
    throw new VisionError('malformed', 'The estimate could not be read.');
  }
}

async function errorForResponse(response: Response): Promise<VisionError> {
  const status = response.status;
  let apiMessage = '';
  try {
    const parsed = (await response.json()) as { error?: { message?: string } };
    apiMessage = parsed.error?.message ?? '';
  } catch {
    // No JSON body; fall back to status alone.
  }

  if (status === 400 && /api key not valid|invalid.*key/i.test(apiMessage)) {
    return new VisionError('unauthorized', 'Your API key was rejected.');
  }
  if (status === 401 || status === 403) {
    return new VisionError('unauthorized', 'Your API key was rejected.');
  }
  if (status === 429) {
    // Gemini's free tier reports rate and daily limits here.
    return new VisionError(
      'rate_limited',
      'This key has hit its Gemini free-tier limit. Try again later.',
    );
  }
  if (status >= 500) {
    return new VisionError('server', 'The service is unavailable.');
  }
  if (status === 404 || /no longer available|is not found|not supported/i.test(apiMessage)) {
    // A retired model: let the caller fall through to the next one.
    return new VisionError('server', apiMessage || 'The model is unavailable.');
  }
  return new VisionError(
    'malformed',
    apiMessage || `The request was rejected (${status}).`,
  );
}

function firstPartText(response: GeminiResponse): string | null {
  const parts = response.candidates?.[0]?.content?.parts;
  const withText = parts?.find((part) => typeof part.text === 'string');
  return withText?.text ?? null;
}
