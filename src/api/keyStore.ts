import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';

/**
 * The only module that touches the Gemini API key.
 *
 * The key lives in the device Keychain / Keystore via `expo-secure-store`. It is
 * never written to SQLite, never put in a Zustand store, never logged, and never
 * included in the JSON export. Everything else in the app asks for it here, at
 * call time, and lets it go immediately.
 *
 * There are two ways a key gets in:
 *
 *   1. The user pastes it — during onboarding or in Settings. This is the path
 *      that matters for anyone running a published build.
 *   2. `SNAP_DEV_GEMINI_API_KEY` in a local `.env`, surfaced through
 *      `app.config.ts` (see `.env.example`). This is a development convenience:
 *      the value is inlined into the JS bundle, so it must be left unset when
 *      publishing. On first launch it is copied into secure storage once and
 *      never read again.
 */

const STORAGE_KEY = 'gemini_api_key';

function bundledDevKey(): string | null {
  const value = Constants.expoConfig?.extra?.['geminiDevApiKey'];
  return typeof value === 'string' && value.trim().length > 0
    ? value.trim()
    : null;
}

/**
 * Syncs the `.env` key (`SNAP_DEV_GEMINI_API_KEY`, via app.config.ts) into
 * secure storage. When present it is treated as authoritative and written on
 * every launch, so a key baked into a development build "just works" with no
 * onboarding key step. Leave the env var unset when publishing — users then
 * supply their own key in-app, and this is a no-op.
 *
 * The environment key wins whenever it is set, which keeps local development
 * predictable without changing the published-app storage path.
 */
export async function seedFromEnvironment(): Promise<void> {
  const devKey = bundledDevKey();
  if (!devKey) return;

  const existing = await SecureStore.getItemAsync(STORAGE_KEY);
  if (existing !== devKey) {
    await SecureStore.setItemAsync(STORAGE_KEY, devKey);
  }
}

export async function getApiKey(): Promise<string | null> {
  return SecureStore.getItemAsync(STORAGE_KEY);
}

export async function hasApiKey(): Promise<boolean> {
  return (await getApiKey()) !== null;
}

export async function setApiKey(value: string): Promise<void> {
  await SecureStore.setItemAsync(STORAGE_KEY, value.trim());
}

export async function clearApiKey(): Promise<void> {
  await SecureStore.deleteItemAsync(STORAGE_KEY);
}

/** `AIza…4f2a` — enough to recognise a key, not enough to use one. */
export function maskKey(value: string): string {
  if (value.length <= 12) return '••••••••';
  return `${value.slice(0, 7)}…${value.slice(-4)}`;
}

export async function maskedApiKey(): Promise<string | null> {
  const key = await getApiKey();
  return key ? maskKey(key) : null;
}

/** Shape check only. A real check is performed by the Gemini models endpoint. */
export function looksLikeApiKey(value: string): boolean {
  const trimmed = value.trim();
  return /^(AIza|AQ\.)[A-Za-z0-9_.\-]{10,}$/.test(trimmed);
}
