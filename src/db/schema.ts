/**
 * Schema and forward-only migrations.
 *
 * `MIGRATIONS[n]` upgrades the database from `user_version = n` to `n + 1`.
 * Never edit a migration that has shipped — append a new one instead.
 */

const INITIAL_SCHEMA = `
CREATE TABLE profile (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  sex TEXT NOT NULL,
  age INTEGER NOT NULL,
  height_cm REAL NOT NULL,
  weight_kg REAL NOT NULL,
  activity_level TEXT NOT NULL,
  goal TEXT NOT NULL,
  target_calories INTEGER NOT NULL,
  protein_pct REAL NOT NULL DEFAULT 0.30,
  carbs_pct REAL NOT NULL DEFAULT 0.40,
  fat_pct REAL NOT NULL DEFAULT 0.30,
  units TEXT NOT NULL DEFAULT 'metric',
  onboarded_at TEXT NOT NULL
);

CREATE TABLE meals (
  id TEXT PRIMARY KEY,
  logged_at TEXT NOT NULL,
  local_date TEXT NOT NULL,
  meal_type TEXT NOT NULL,
  name TEXT NOT NULL,
  photo_uri TEXT,
  source TEXT NOT NULL,
  confidence TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX idx_meals_date ON meals(local_date);

CREATE TABLE meal_items (
  id TEXT PRIMARY KEY,
  meal_id TEXT NOT NULL REFERENCES meals(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  quantity REAL NOT NULL,
  unit TEXT NOT NULL,
  calories REAL NOT NULL,
  protein_g REAL NOT NULL DEFAULT 0,
  carbs_g REAL NOT NULL DEFAULT 0,
  fat_g REAL NOT NULL DEFAULT 0,
  is_manual_addition INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_meal_items_meal ON meal_items(meal_id);

CREATE TABLE daily_targets (
  local_date TEXT PRIMARY KEY,
  target_calories INTEGER NOT NULL,
  protein_g REAL NOT NULL,
  carbs_g REAL NOT NULL,
  fat_g REAL NOT NULL
);
`;

/**
 * v2 — the fitness redesign. Additive only: old meals and targets are kept.
 * The existing `activity_level` column now holds the training load and `goal`
 * the new goal; old values are mapped when read (see `toProfile`).
 */
const FITNESS_SCHEMA = `
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

ALTER TABLE profile ADD COLUMN name TEXT NOT NULL DEFAULT '';
ALTER TABLE profile ADD COLUMN sport TEXT NOT NULL DEFAULT 'other';
ALTER TABLE profile ADD COLUMN water_goal_ml INTEGER NOT NULL DEFAULT 2000;
ALTER TABLE profile ADD COLUMN step_goal INTEGER NOT NULL DEFAULT 10000;

CREATE TABLE water_logs (
  id TEXT PRIMARY KEY,
  logged_at TEXT NOT NULL,
  local_date TEXT NOT NULL,
  amount_ml INTEGER NOT NULL
);

CREATE INDEX idx_water_date ON water_logs(local_date);

CREATE TABLE activities (
  id TEXT PRIMARY KEY,
  local_date TEXT NOT NULL,
  logged_at TEXT NOT NULL,
  type TEXT NOT NULL,
  duration_min REAL NOT NULL,
  intensity TEXT NOT NULL,
  kcal REAL NOT NULL,
  source TEXT NOT NULL,
  program_id TEXT
);

CREATE INDEX idx_activities_date ON activities(local_date);

CREATE TABLE workout_completions (
  id TEXT PRIMARY KEY,
  program_id TEXT NOT NULL,
  session_index INTEGER NOT NULL,
  completed_at TEXT NOT NULL,
  activity_id TEXT
);

CREATE INDEX idx_completions_program ON workout_completions(program_id);

CREATE TABLE step_days (
  local_date TEXT PRIMARY KEY,
  steps INTEGER NOT NULL,
  updated_at TEXT NOT NULL
);
`;

export const MIGRATIONS: readonly string[] = [INITIAL_SCHEMA, FITNESS_SCHEMA];

export const LATEST_VERSION = MIGRATIONS.length;

/** Drops every table. Used by "Delete all data". */
export const DROP_ALL = `
DROP TABLE IF EXISTS settings;
DROP TABLE IF EXISTS water_logs;
DROP TABLE IF EXISTS activities;
DROP TABLE IF EXISTS workout_completions;
DROP TABLE IF EXISTS step_days;
DROP TABLE IF EXISTS meal_items;
DROP TABLE IF EXISTS meals;
DROP TABLE IF EXISTS daily_targets;
DROP TABLE IF EXISTS profile;
`;
