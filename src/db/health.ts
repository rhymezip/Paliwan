import { randomUUID } from 'expo-crypto';

import { db } from '@/db';
import type {
  Activity,
  ActivitySource,
  ActivityTypeId,
  Intensity,
  WaterLog,
  WorkoutCompletion,
} from '@/types';

/* -------------------------------------------------------------------------- */
/* Settings — small key/value pairs (language, theme, reminders…)              */
/* -------------------------------------------------------------------------- */

export async function getAllSettings(): Promise<Record<string, string>> {
  const rows = await db().getAllAsync<{ key: string; value: string }>(
    'SELECT key, value FROM settings',
  );
  return Object.fromEntries(rows.map((row) => [row.key, row.value]));
}

export async function setSetting(key: string, value: string): Promise<void> {
  await db().runAsync(
    `INSERT INTO settings (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    [key, value],
  );
}

/* -------------------------------------------------------------------------- */
/* Water                                                                       */
/* -------------------------------------------------------------------------- */

interface WaterRow {
  id: string;
  logged_at: string;
  local_date: string;
  amount_ml: number;
}

function toWater(row: WaterRow): WaterLog {
  return {
    id: row.id,
    loggedAt: row.logged_at,
    localDate: row.local_date,
    amountMl: row.amount_ml,
  };
}

export async function listWater(localDate: string): Promise<WaterLog[]> {
  const rows = await db().getAllAsync<WaterRow>(
    'SELECT * FROM water_logs WHERE local_date = ? ORDER BY logged_at DESC',
    [localDate],
  );
  return rows.map(toWater);
}

export async function insertWater(
  amountMl: number,
  localDate: string,
  loggedAt: string,
): Promise<WaterLog> {
  const log: WaterLog = { id: randomUUID(), loggedAt, localDate, amountMl };
  await db().runAsync(
    'INSERT INTO water_logs (id, logged_at, local_date, amount_ml) VALUES (?, ?, ?, ?)',
    [log.id, log.loggedAt, log.localDate, log.amountMl],
  );
  return log;
}

export async function deleteWater(id: string): Promise<void> {
  await db().runAsync('DELETE FROM water_logs WHERE id = ?', [id]);
}

/* -------------------------------------------------------------------------- */
/* Activities                                                                  */
/* -------------------------------------------------------------------------- */

interface ActivityRow {
  id: string;
  local_date: string;
  logged_at: string;
  type: string;
  duration_min: number;
  intensity: string;
  kcal: number;
  source: string;
  program_id: string | null;
}

function toActivity(row: ActivityRow): Activity {
  return {
    id: row.id,
    localDate: row.local_date,
    loggedAt: row.logged_at,
    type: row.type as ActivityTypeId,
    durationMin: row.duration_min,
    intensity: row.intensity as Intensity,
    kcal: row.kcal,
    source: row.source as ActivitySource,
    programId: row.program_id,
  };
}

export type NewActivity = Omit<Activity, 'id'>;

export async function insertActivity(input: NewActivity): Promise<Activity> {
  const activity: Activity = { id: randomUUID(), ...input };
  await db().runAsync(
    `INSERT INTO activities
       (id, local_date, logged_at, type, duration_min, intensity, kcal, source, program_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      activity.id,
      activity.localDate,
      activity.loggedAt,
      activity.type,
      activity.durationMin,
      activity.intensity,
      activity.kcal,
      activity.source,
      activity.programId,
    ],
  );
  return activity;
}

export async function deleteActivity(id: string): Promise<void> {
  await db().runAsync('DELETE FROM activities WHERE id = ?', [id]);
}

/** Activities from `fromDate` (inclusive) on, newest first. */
export async function listActivitiesSince(fromDate: string): Promise<Activity[]> {
  const rows = await db().getAllAsync<ActivityRow>(
    'SELECT * FROM activities WHERE local_date >= ? ORDER BY logged_at DESC',
    [fromDate],
  );
  return rows.map(toActivity);
}

export async function listRecentActivities(limit: number): Promise<Activity[]> {
  const rows = await db().getAllAsync<ActivityRow>(
    'SELECT * FROM activities ORDER BY logged_at DESC LIMIT ?',
    [limit],
  );
  return rows.map(toActivity);
}

/** Every date with at least one activity — feeds the streak. */
export async function activityDates(): Promise<string[]> {
  const rows = await db().getAllAsync<{ local_date: string }>(
    'SELECT DISTINCT local_date FROM activities',
  );
  return rows.map((row) => row.local_date);
}

/* -------------------------------------------------------------------------- */
/* Program progress                                                            */
/* -------------------------------------------------------------------------- */

interface CompletionRow {
  id: string;
  program_id: string;
  session_index: number;
  completed_at: string;
  activity_id: string | null;
}

function toCompletion(row: CompletionRow): WorkoutCompletion {
  return {
    id: row.id,
    programId: row.program_id,
    sessionIndex: row.session_index,
    completedAt: row.completed_at,
    activityId: row.activity_id,
  };
}

export async function listCompletions(): Promise<WorkoutCompletion[]> {
  const rows = await db().getAllAsync<CompletionRow>(
    'SELECT * FROM workout_completions ORDER BY completed_at ASC',
  );
  return rows.map(toCompletion);
}

export async function insertCompletion(
  programId: string,
  sessionIndex: number,
  activityId: string | null,
): Promise<WorkoutCompletion> {
  const completion: WorkoutCompletion = {
    id: randomUUID(),
    programId,
    sessionIndex,
    completedAt: new Date().toISOString(),
    activityId,
  };
  await db().runAsync(
    `INSERT INTO workout_completions (id, program_id, session_index, completed_at, activity_id)
     VALUES (?, ?, ?, ?, ?)`,
    [
      completion.id,
      completion.programId,
      completion.sessionIndex,
      completion.completedAt,
      completion.activityId,
    ],
  );
  return completion;
}

/* -------------------------------------------------------------------------- */
/* Steps — daily snapshots for history where the OS keeps none (Android)       */
/* -------------------------------------------------------------------------- */

export async function saveStepDay(localDate: string, steps: number): Promise<void> {
  await db().runAsync(
    `INSERT INTO step_days (local_date, steps, updated_at) VALUES (?, ?, ?)
     ON CONFLICT(local_date) DO UPDATE SET steps = excluded.steps, updated_at = excluded.updated_at`,
    [localDate, Math.max(0, Math.round(steps)), new Date().toISOString()],
  );
}

export async function getStepDays(fromDate: string): Promise<Record<string, number>> {
  const rows = await db().getAllAsync<{ local_date: string; steps: number }>(
    'SELECT local_date, steps FROM step_days WHERE local_date >= ?',
    [fromDate],
  );
  return Object.fromEntries(rows.map((row) => [row.local_date, row.steps]));
}

/* -------------------------------------------------------------------------- */
/* Export                                                                      */
/* -------------------------------------------------------------------------- */

export async function exportHealth(): Promise<{
  water: WaterLog[];
  activities: Activity[];
  completions: WorkoutCompletion[];
}> {
  const water = await db().getAllAsync<WaterRow>('SELECT * FROM water_logs ORDER BY logged_at');
  const activities = await db().getAllAsync<ActivityRow>(
    'SELECT * FROM activities ORDER BY logged_at',
  );
  return {
    water: water.map(toWater),
    activities: activities.map(toActivity),
    completions: await listCompletions(),
  };
}
