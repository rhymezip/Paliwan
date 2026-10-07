import { create } from 'zustand';

import { getStepDays, saveStepDay } from '@/db/health';
import { localDateString, parseLocalDate } from '@/logic/dates';
import { shiftDate } from '@/logic/streak';
import {
  STEP_HISTORY_SUPPORTED,
  requestStepPermission,
  stepPermission,
  stepsBetween,
  watchSteps,
  type StepPermission,
} from '@/services/pedometer';

export interface StepDay {
  localDate: string;
  steps: number;
}

interface StepState {
  permission: StepPermission | 'unknown';
  today: number;
  /** Oldest first, today last. */
  week: StepDay[];
  refresh: () => Promise<void>;
  requestPermission: () => Promise<StepPermission>;
  /** Live updates while a screen is showing. Returns the unsubscribe. */
  startLive: () => () => void;
}

/** Android keeps no step history, so live counts are written down every 15 s. */
const SAVE_EVERY_MS = 15_000;

function lastSevenDates(today: string): string[] {
  return Array.from({ length: 7 }, (_, index) => shiftDate(today, index - 6));
}

async function stepsOn(localDate: string, stored: Record<string, number>): Promise<number> {
  if (STEP_HISTORY_SUPPORTED) {
    const start = parseLocalDate(localDate);
    const end = localDate === localDateString() ? new Date() : parseLocalDate(shiftDate(localDate, 1));
    const steps = await stepsBetween(start, end);
    if (steps !== null) return steps;
  }
  return stored[localDate] ?? 0;
}

export const useStepStore = create<StepState>((set, get) => ({
  permission: 'unknown',
  today: 0,
  week: [],

  refresh: async () => {
    const permission = await stepPermission();
    set({ permission });
    if (permission !== 'granted') return;

    const today = localDateString();
    const dates = lastSevenDates(today);
    let stored: Record<string, number> = {};
    try {
      stored = await getStepDays(dates[0]!);
    } catch {
      // No storage (web preview): history is simply empty.
    }
    const week = await Promise.all(
      dates.map(async (localDate) => ({ localDate, steps: await stepsOn(localDate, stored) })),
    );
    set({ week, today: week[week.length - 1]?.steps ?? 0 });
  },

  requestPermission: async () => {
    const permission = await requestStepPermission();
    set({ permission });
    if (permission === 'granted') await get().refresh();
    return permission;
  },

  startLive: () => {
    if (get().permission !== 'granted') return () => undefined;
    const date = localDateString();
    const base = get().today;
    let lastSaved = 0;

    const stop = watchSteps((sinceStart) => {
      if (localDateString() !== date) return; // past midnight: the next refresh starts a new day
      const today = base + sinceStart;
      set((state) => ({
        today,
        week: state.week.map((day) => (day.localDate === date ? { ...day, steps: today } : day)),
      }));
      if (!STEP_HISTORY_SUPPORTED && Date.now() - lastSaved > SAVE_EVERY_MS) {
        lastSaved = Date.now();
        void saveStepDay(date, today).catch(() => undefined);
      }
    });

    return () => {
      stop();
      if (!STEP_HISTORY_SUPPORTED) void saveStepDay(date, get().today).catch(() => undefined);
    };
  },
}));
