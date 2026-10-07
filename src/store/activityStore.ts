import { create } from 'zustand';

import {
  activityDates,
  deleteActivity,
  insertActivity,
  listActivitiesSince,
  listRecentActivities,
  type NewActivity,
} from '@/db/health';
import { localDateString } from '@/logic/dates';
import { shiftDate, streakDays } from '@/logic/streak';
import type { Activity } from '@/types';

interface ActivityState {
  /** The last 7 days, today included, newest first. */
  week: Activity[];
  recent: Activity[];
  streak: number;
  load: () => Promise<void>;
  add: (input: NewActivity) => Promise<Activity>;
  remove: (id: string) => Promise<void>;
}

export const useActivityStore = create<ActivityState>((set, get) => ({
  week: [],
  recent: [],
  streak: 0,

  load: async () => {
    const today = localDateString();
    const [week, recent, dates] = await Promise.all([
      listActivitiesSince(shiftDate(today, -6)),
      listRecentActivities(20),
      activityDates(),
    ]);
    set({ week, recent, streak: streakDays(dates, today) });
  },

  add: async (input) => {
    const activity = await insertActivity(input);
    await get().load();
    return activity;
  },

  remove: async (id) => {
    await deleteActivity(id);
    await get().load();
  },
}));

export interface ActivityTotals {
  minutes: number;
  kcal: number;
}

export function totalsFor(activities: readonly Activity[]): ActivityTotals {
  return activities.reduce<ActivityTotals>(
    (total, activity) => ({
      minutes: total.minutes + activity.durationMin,
      kcal: total.kcal + activity.kcal,
    }),
    { minutes: 0, kcal: 0 },
  );
}

export function activitiesOn(activities: readonly Activity[], localDate: string): Activity[] {
  return activities.filter((activity) => activity.localDate === localDate);
}
