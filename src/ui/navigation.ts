import type { Href, Router } from 'expo-router';

/**
 * Leaves a pushed screen. When there is nothing to go back to — a deep link,
 * a reload on web — it lands on `fallback` instead of doing nothing.
 */
export function closeScreen(router: Router, fallback: Href = '/(tabs)'): void {
  if (router.canGoBack()) router.back();
  else router.replace(fallback);
}
