import type { Language, Localized } from './types';

/** Fills `{name}` placeholders. Unknown placeholders stay visible, never blank. */
export function format(
  template: string,
  params: Record<string, string | number> = {},
): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in params ? String(params[key]) : match,
  );
}

export function pickLocalized(lang: Language, value: Localized): string {
  return value[lang];
}
