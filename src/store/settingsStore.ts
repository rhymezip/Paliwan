import { create } from 'zustand';

import { getAllSettings, setSetting } from '@/db/health';
import { DEFAULT_LANGUAGE, isLanguage, type Language } from '@/i18n';
import { REMINDER_DEFAULTS } from '@/logic/reminders';
import { applyWaterReminders, type ReminderSettings } from '@/services/notifications';
import type { ThemePreference } from '@/theme/ThemeProvider';

const KEY = {
  language: 'language',
  theme: 'theme',
  reminders: 'reminders',
  activeProgram: 'active_program',
} as const;

export const DEFAULT_REMINDERS: ReminderSettings = { enabled: false, ...REMINDER_DEFAULTS };

function isTheme(value: unknown): value is ThemePreference {
  return value === 'system' || value === 'light' || value === 'dark';
}

function parseReminders(raw: string | undefined): ReminderSettings {
  if (!raw) return DEFAULT_REMINDERS;
  try {
    const value = JSON.parse(raw) as Partial<ReminderSettings>;
    const hour = (candidate: unknown, fallback: number) =>
      typeof candidate === 'number' && candidate >= 0 && candidate <= 23 ? candidate : fallback;
    return {
      enabled: value.enabled === true,
      startHour: hour(value.startHour, REMINDER_DEFAULTS.startHour),
      endHour: hour(value.endHour, REMINDER_DEFAULTS.endHour),
      everyHours:
        typeof value.everyHours === 'number' && value.everyHours >= 1 && value.everyHours <= 6
          ? value.everyHours
          : REMINDER_DEFAULTS.everyHours,
    };
  } catch {
    return DEFAULT_REMINDERS;
  }
}

/** Settings stay usable in memory when storage is missing (the web preview). */
async function persist(key: string, value: string): Promise<void> {
  try {
    await setSetting(key, value);
  } catch (error) {
    console.warn(`Settings: could not save "${key}".`, error);
  }
}

interface SettingsState {
  loaded: boolean;
  language: Language;
  /** False until the first onboarding step — the language picker — is done. */
  languageChosen: boolean;
  theme: ThemePreference;
  reminders: ReminderSettings;
  activeProgramId: string | null;

  load: () => Promise<void>;
  setLanguage: (language: Language) => Promise<void>;
  setTheme: (theme: ThemePreference) => Promise<void>;
  /** Saves and reschedules. Throws if the reminders cannot be scheduled. */
  setReminders: (reminders: ReminderSettings) => Promise<void>;
  setActiveProgram: (programId: string | null) => Promise<void>;
  /** After "delete all data": back to first-launch defaults, language kept for display. */
  reset: () => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  loaded: false,
  language: DEFAULT_LANGUAGE,
  languageChosen: false,
  theme: 'system',
  reminders: DEFAULT_REMINDERS,
  activeProgramId: null,

  load: async () => {
    let values: Record<string, string> = {};
    try {
      values = await getAllSettings();
    } catch (error) {
      console.warn('Settings: storage unavailable, using defaults.', error);
    }
    const language = values[KEY.language];
    const theme = values[KEY.theme];
    set({
      loaded: true,
      language: isLanguage(language) ? language : DEFAULT_LANGUAGE,
      languageChosen: isLanguage(language),
      theme: isTheme(theme) ? theme : 'system',
      reminders: parseReminders(values[KEY.reminders]),
      activeProgramId: values[KEY.activeProgram] || null,
    });
  },

  setLanguage: async (language) => {
    set({ language, languageChosen: true });
    await persist(KEY.language, language);
    const { reminders } = get();
    if (reminders.enabled) {
      // Reminder text is fixed at scheduling time, so re-schedule in the new language.
      await applyWaterReminders(reminders, language).catch((error) =>
        console.warn('Reminders: could not reschedule.', error),
      );
    }
  },

  setTheme: async (theme) => {
    set({ theme });
    await persist(KEY.theme, theme);
  },

  setReminders: async (reminders) => {
    await applyWaterReminders(reminders, get().language);
    set({ reminders });
    await persist(KEY.reminders, JSON.stringify(reminders));
  },

  setActiveProgram: async (programId) => {
    set({ activeProgramId: programId });
    await persist(KEY.activeProgram, programId ?? '');
  },

  reset: () =>
    set({
      languageChosen: false,
      theme: 'system',
      reminders: DEFAULT_REMINDERS,
      activeProgramId: null,
    }),
}));
