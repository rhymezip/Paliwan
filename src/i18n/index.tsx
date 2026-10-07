import { createContext, useContext, useMemo, type ReactNode } from 'react';

import { en, type Dictionary } from './en';
import { format, pickLocalized } from './format';
import { ru } from './ru';
import { tk } from './tk';
import type { Language, Localized } from './types';

export type { Dictionary } from './en';
export { format } from './format';
export type { Language, Localized } from './types';

export const DICTIONARIES: Record<Language, Dictionary> = { tk, ru, en };

export const LANGUAGES: readonly { code: Language; nativeName: string; englishName: string }[] = [
  { code: 'tk', nativeName: 'Türkmençe', englishName: 'Turkmen' },
  { code: 'ru', nativeName: 'Русский', englishName: 'Russian' },
  { code: 'en', nativeName: 'English', englishName: 'English' },
];

export const DEFAULT_LANGUAGE: Language = 'tk';

export function isLanguage(value: unknown): value is Language {
  return value === 'tk' || value === 'ru' || value === 'en';
}

export interface I18n {
  lang: Language;
  tr: Dictionary;
  /** Fills `{name}` placeholders. */
  f: (template: string, params?: Record<string, string | number>) => string;
  /** Picks the active language from static data. */
  pick: (value: Localized) => string;
  /** e.g. "Wednesday, 8 October" / "8 oktýabr, Çarşenbe". */
  longDate: (localDate: string) => string;
  /** Monday-first short weekday for a `yyyy-MM-dd` date. */
  weekdayShort: (localDate: string) => string;
}

function parts(localDate: string): { day: number; monthIndex: number; weekdayIndex: number } {
  const [year = 1970, month = 1, day = 1] = localDate.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return { day, monthIndex: month - 1, weekdayIndex: (date.getDay() + 6) % 7 };
}

/** Builds the translator for a language. Usable outside React (notifications). */
export function translatorFor(lang: Language): I18n {
  const tr = DICTIONARIES[lang];
  return {
    lang,
    tr,
    f: format,
    pick: (value) => pickLocalized(lang, value),
    longDate: (localDate) => {
      const { day, monthIndex, weekdayIndex } = parts(localDate);
      return format(tr.dates.long, {
        weekday: tr.dates.weekdaysLong[weekdayIndex] ?? '',
        day,
        month: tr.dates.months[monthIndex] ?? '',
      });
    },
    weekdayShort: (localDate) => tr.dates.weekdaysShort[parts(localDate).weekdayIndex] ?? '',
  };
}

const I18nContext = createContext<I18n>(translatorFor(DEFAULT_LANGUAGE));

export function I18nProvider({ language, children }: { language: Language; children: ReactNode }) {
  const value = useMemo(() => translatorFor(language), [language]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18n {
  return useContext(I18nContext);
}
