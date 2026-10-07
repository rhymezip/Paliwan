/** Moves a `yyyy-MM-dd` date by whole days, in UTC so DST cannot skip a day. */
export function shiftDate(localDate: string, days: number): string {
  const [year = 1970, month = 1, day = 1] = localDate.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/**
 * Consecutive active days ending today — or ending yesterday, so a streak is not
 * lost before today's session has happened.
 */
export function streakDays(activeDates: readonly string[], today: string): number {
  const active = new Set(activeDates);
  let cursor = active.has(today) ? today : shiftDate(today, -1);
  let count = 0;
  while (active.has(cursor)) {
    count += 1;
    cursor = shiftDate(cursor, -1);
  }
  return count;
}
