export interface ReminderTime {
  hour: number;
  minute: number;
}

/**
 * Daily reminder times on the hour, from `startHour` to `endHour` inclusive,
 * every `everyHours`. An inverted window yields no reminders.
 */
export function reminderTimes(
  startHour: number,
  endHour: number,
  everyHours: number,
): ReminderTime[] {
  const step = Math.max(1, Math.round(everyHours));
  const times: ReminderTime[] = [];
  for (let hour = startHour; hour <= endHour && hour <= 23; hour += step) {
    times.push({ hour, minute: 0 });
  }
  return times;
}

export const REMINDER_DEFAULTS = { startHour: 9, endHour: 21, everyHours: 2 } as const;
