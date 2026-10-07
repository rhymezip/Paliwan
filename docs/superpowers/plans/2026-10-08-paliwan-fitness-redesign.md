# Paliwan Fitness Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> Execution note: this plan is executed inline by its author overnight (the user is
> asleep and asked for no subagents). Pure logic is specified with exact test cases;
> UI tasks are specified by files, interfaces and acceptance checks, and their code
> lives in the commits rather than being duplicated here.

**Goal:** Rebuild Paliwan into a health & fitness app for young athletes: onboarding with language and name, Home dashboard (steps, water, activity, food), training programs with a workout player, nutrition (Gemini photo, local food list, manual), profile, light/dark mode, TM/RU/EN.

**Architecture:** Keep the SQLite layer, Gemini transport and meal logic; add an additive migration; replace the static colour constants with a theme context and `makeStyles`; add a typed dictionary i18n; rebuild every screen on a new `src/ui` kit; domain stores in zustand; pure, tested logic in `src/logic`.

**Tech Stack:** Expo SDK 54, React Native 0.81, expo-router 6, expo-sqlite, zustand, expo-sensors (Pedometer), expo-notifications (local), react-native-svg, expo-linear-gradient, expo-keep-awake, @expo-google-fonts/manrope, Node test runner + sucrase for unit tests.

## Global Constraints

- Must run in Expo Go SDK 54 on iOS: only Expo SDK modules, versions from `npx expo install`.
- Must start on Node 20.17 (`app.config.ts` may import JSON only, not `.ts`).
- Offline-first: nothing but the optional Gemini estimate touches the network.
- Every user-visible string comes from the active dictionary (tk, ru, en). No hard-coded copy.
- No hex colours outside `src/theme/palette.ts`.
- Under 18: no weight-loss goal, no calorie deficit.
- Every async user action catches errors and shows a localized toast.
- Commit after each task on branch `redesign`; never push.

---

## File structure

```
app.config.ts                     modify: JSON brand meta, env rename, plugins, automatic UI style
src/constants/brandMeta.json      create: name, descriptor, colours
src/constants/brandMeta.ts        modify: typed re-export of the JSON
scripts/run-tests.js              create: requires sucrase hook + all test files
src/theme/palette.ts              light/dark colour tokens
src/theme/tokens.ts               space, radius, font, type scale, layout
src/theme/ThemeProvider.tsx       ThemePreference, ThemeProvider, useTheme, makeStyles
src/theme/navigationTheme.ts      React Navigation theme from our theme
src/i18n/format.ts                format(template, params), pickLocalized(lang, l)
src/i18n/types.ts                 Language, Localized, DeepString
src/i18n/en.ts | tk.ts | ru.ts    dictionaries (en is the shape)
src/i18n/index.tsx                LANGUAGES, I18nProvider, useI18n
src/data/sports.ts                SPORTS (id, name, icon, activity type)
src/data/activityTypes.ts         ACTIVITY_TYPES (id, name, icon, met)
src/data/exercises.ts             EXERCISES (name, cue, icon)
src/data/programs.ts              PROGRAMS, SESSIONS_PER_PROGRAM, workoutForSession
src/data/foods.ts                 FOODS (local + common, per portion)
src/data/tips.ts                  TIPS
src/logic/energy.ts               schofieldBmr, PAL, goalsForAge, energyTargets
src/logic/macros.ts               macroTargets(kcal, kg), addMacros, EMPTY_MACROS
src/logic/activity.ts             INTENSITY_FACTOR, activityKcal
src/logic/water.ts                waterGoalMl
src/logic/steps.ts                strideMeters, stepsToKm, stepsToKcal
src/logic/reminders.ts            reminderTimes
src/logic/streak.ts               shiftDate, streakDays
src/logic/__tests__/*.test.ts     unit tests
src/db/schema.ts                  + MIGRATION_2
src/db/queries.ts                 profile mapping for new fields
src/db/health.ts                  settings, water, activities, completions, step_days
src/services/pedometer.ts         expo-sensors wrapper
src/services/notifications.ts     expo-notifications wrapper
src/store/*.ts                    settings, profile, onboarding, water, activity, program, steps, day, capture
src/ui/*.tsx                      Text, Screen, Card, Button, IconButton, Field, OptionCard,
                                  Segmented, ProgressRing, ProgressBar, Sheet, Toast, Stepper,
                                  ListRow, SectionHeader, EmptyState, BarChart, TabBar, Avatar
src/components/...                feature components (home, food, onboarding)
app/...                           all screens (see tasks)
```

---

### Task 1: Config fix and test harness

**Files:** Create `src/constants/brandMeta.json`, `scripts/run-tests.js`. Modify `src/constants/brandMeta.ts`, `app.config.ts`, `.env.example`, `package.json`.

- [ ] Move brand meta to JSON; `brandMeta.ts` becomes `import meta from './brandMeta.json'; export const brandMeta = meta;`.
- [ ] `app.config.ts`: import `./src/constants/brandMeta.json`; env `PALIWAN_GEMINI_API_KEY`; `userInterfaceStyle: 'automatic'`; plugins `expo-sensors` (`motionPermission`), `expo-notifications`; camera `recordAudioAndroid: false`; android permission `ACTIVITY_RECOGNITION`; splash dark background.
- [ ] `scripts/run-tests.js`: `require('sucrase/register/ts')`, then require every `src/logic/__tests__/*.test.ts`.
- [ ] `package.json`: `"test": "node scripts/run-tests.js"`; remove `@expo-google-fonts/archivo` and `fraunces` once no file imports them (Task 5).
- [ ] Verify: `npx expo config --type public` succeeds **without** `NODE_OPTIONS`.
- [ ] Commit.

### Task 2: Pure logic with tests

**Files:** `src/logic/{energy,macros,activity,water,steps,reminders,streak}.ts`, tests in `src/logic/__tests__/`.

**Interfaces (produced):**
```ts
type Sex = 'male' | 'female';
type TrainingLoad = 'light' | 'moderate' | 'high' | 'very_high';
type Goal = 'perform' | 'grow' | 'lose';
type Intensity = 'easy' | 'moderate' | 'hard';
schofieldBmr(sex: Sex, age: number, weightKg: number): number
PAL: Record<TrainingLoad, number>            // 1.5, 1.65, 1.8, 2.0
goalsForAge(age: number): Goal[]              // <18: perform, grow
energyTargets(i: {sex; age; weightKg; load; goal}): { bmr: number; maintenance: number; target: number }
macroTargets(kcal: number, weightKg: number): { proteinG: number; carbsG: number; fatG: number }
activityKcal(met: number, minutes: number, intensity: Intensity, weightKg: number): number
waterGoalMl(weightKg: number, trainedMinutes: number): number
strideMeters(heightCm, sex) / stepsToKm(steps, heightCm, sex) / stepsToKcal(steps, weightKg, heightCm, sex)
reminderTimes(startHour: number, endHour: number, everyHours: number): { hour: number; minute: number }[]
shiftDate(localDate: string, days: number): string
streakDays(activeDates: readonly string[], today: string): number
```

Logic files use only `import type` from `@/…` (sucrase elides them) and relative runtime imports.

**Test cases (exact expectations):**

| Function | Input | Expected |
|---|---|---|
| schofieldBmr | male, 15, 55 | 1630.93 (±0.01) |
| schofieldBmr | female, 16, 50 | 1361.8 |
| schofieldBmr | male, 20, 70 | 1746.19 |
| schofieldBmr | male, 40, 80 | 1790.86 |
| schofieldBmr | female, 9, 30 | 1095.35 |
| goalsForAge | 15 / 18 | [perform, grow] / [perform, grow, lose] |
| energyTargets | m,15,55,high,perform | maintenance 2936, target 2936 |
| energyTargets | m,15,55,high,grow | 3236 |
| energyTargets | m,15,55,high,lose | 2936 (no deficit under 18) |
| energyTargets | m,20,70,moderate,lose | 2581 |
| energyTargets | f,25,45,light,lose | 1499 (floor BMR×1.3) |
| macroTargets | 2936 kcal, 55 kg | P 88, C 426, F 98 |
| macroTargets | 1499 kcal, 45 kg | P 72, C 190, F 50 |
| macroTargets | 1200 kcal, 70 kg | P 112, C 210, F 27 (carb floor) |
| activityKcal | 7, 60, moderate, 55 | 385 |
| activityKcal | 7, 60, hard, 55 | 462 |
| activityKcal | 7, 30, easy, 55 | 154 |
| activityKcal | 7, -5, moderate, 55 | 0 |
| waterGoalMl | 55, 0 | 1950 |
| waterGoalMl | 55, 90 | 2700 |
| waterGoalMl | 30, 0 / 120, 240 | 1500 / 4500 |
| stepsToKm | 10000, 168, male | 6.972 |
| stepsToKcal | 10000, 55, 168, male | 192 |
| reminderTimes | 9, 21, 2 | hours 9,11,13,15,17,19,21 |
| reminderTimes | 8, 20, 3 | hours 8,11,14,17,20 |
| reminderTimes | 21, 9, 2 | [] |
| streakDays | [10-08,10-07,10-06,10-04], 10-08 | 3 |
| streakDays | [10-07,10-06], 10-08 | 2 |
| streakDays | [10-05], 10-08 | 0 |

- [ ] Write the tests, run `npm test`, see them fail.
- [ ] Implement, run `npm test`, all pass.
- [ ] Commit.

### Task 3: Theme system

**Files:** `src/theme/{palette,tokens,ThemeProvider,navigationTheme}.ts(x)`.

**Produces:** `useTheme(): Theme` with `colors` (`background, surface, surfaceAlt, border, text, textMuted, textFaint, primary, primarySoft, onPrimary, danger, warning, success, steps, water, food, activity, protein, carbs, fat, overlay, tabBar`), `dark: boolean`, `gradients.hero: [string, string]`, plus `space`, `radius`, `font`, `type`, `layout`. `makeStyles(factory)` returns a hook memoised on the theme. `ThemePreference = 'system' | 'light' | 'dark'`.

- [ ] Implement; `npm run typecheck` passes. Commit with Task 5.

### Task 4: i18n

**Files:** `src/i18n/{types,format,en,tk,ru,index}.ts(x)`, test `src/logic/__tests__/format.test.ts`.

**Produces:** `useI18n(): { lang: Language; tr: Dictionary; f(template: string, params?: Record<string, string | number>): string; pick(l: Localized): string }`; `format('Salam, {name}!', { name: 'Aman' }) === 'Salam, Aman!'`; missing params stay as `{x}`.

- [ ] Write format tests; implement; dictionaries for every screen in Tasks 6–12; `tk.ts`/`ru.ts` typed as `Dictionary`.
- [ ] Commit with Task 5.

### Task 5: Data layer, stores, UI kit, root layout, navigation shell

**Files:** `src/db/schema.ts` (+migration 2), `src/db/health.ts`, `src/db/queries.ts`, `src/types.ts`, stores, `src/ui/*`, `app/_layout.tsx`, `app/index.tsx`, `app/(tabs)/_layout.tsx` with `TabBar` + centre FAB + quick-add sheet. Delete `app/debug/tokens.tsx`, `app/(tabs)/settings.tsx`, old components that are no longer imported.

Migration 2:
```sql
CREATE TABLE settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
ALTER TABLE profile ADD COLUMN name TEXT NOT NULL DEFAULT '';
ALTER TABLE profile ADD COLUMN sport TEXT NOT NULL DEFAULT 'other';
ALTER TABLE profile ADD COLUMN water_goal_ml INTEGER NOT NULL DEFAULT 2000;
ALTER TABLE profile ADD COLUMN step_goal INTEGER NOT NULL DEFAULT 10000;
CREATE TABLE water_logs (id TEXT PRIMARY KEY, logged_at TEXT NOT NULL, local_date TEXT NOT NULL, amount_ml INTEGER NOT NULL);
CREATE INDEX idx_water_date ON water_logs(local_date);
CREATE TABLE activities (id TEXT PRIMARY KEY, local_date TEXT NOT NULL, logged_at TEXT NOT NULL, type TEXT NOT NULL,
  duration_min REAL NOT NULL, intensity TEXT NOT NULL, kcal REAL NOT NULL, source TEXT NOT NULL, program_id TEXT);
CREATE INDEX idx_activities_date ON activities(local_date);
CREATE TABLE workout_completions (id TEXT PRIMARY KEY, program_id TEXT NOT NULL, session_index INTEGER NOT NULL,
  completed_at TEXT NOT NULL, activity_id TEXT);
CREATE TABLE step_days (local_date TEXT PRIMARY KEY, steps INTEGER NOT NULL, updated_at TEXT NOT NULL);
```
The existing `activity_level` column stores the training load and `goal` stores the new goal; old values map (`sedentary|light → light`, `moderate → moderate`, `active → high`, `very_active → very_high`; `maintain → perform`, `gain → grow`, `lose → lose` only if 18+).

Acceptance: app boots to onboarding on a fresh install; boots to tabs when a named profile exists; tabs render in light and dark; typecheck clean. Commit.

### Task 6: Onboarding

**Files:** `app/onboarding/{_layout,language,welcome,name,about,body,sport,training,targets,permissions}.tsx`, `src/components/onboarding/StepShell.tsx`, `src/store/onboardingStore.ts`. Delete old step files.

Acceptance: language choice switches copy instantly; name required (1–30 chars); age 10–80; height 120–230 cm; weight 25–200 kg; goals list from `goalsForAge`; targets screen shows kcal, P/C/F, water and step goals with the disclaimer; permissions screen requests motion and notification permission, both skippable; finishing saves the profile and lands on Home. Commit.

### Task 7: Home, steps, water, reminders

**Files:** `app/(tabs)/index.tsx`, `app/steps.tsx`, `app/water.tsx`, `src/services/{pedometer,notifications}.ts`, `src/store/{steps,water}Store.ts`, home components.

Acceptance: steps tile updates live on iOS and shows a clear "not available" state on web; +250 ml updates the ring immediately and persists; water screen deletes a log; reminders schedule daily local notifications at `reminderTimes` in the active language and cancel when disabled. Commit.

### Task 8: Activities, programs, workout player

**Files:** `app/(tabs)/train.tsx`, `app/activity/new.tsx`, `app/program/[id].tsx`, `app/workout/[programId].tsx`, `src/store/{activity,program}Store.ts`, data files.

Acceptance: logging 60 min moderate football at 55 kg shows 385 kcal and appears on Home and Train; starting a program sets it active; the player walks every set and rest, pause/skip work, finishing records a completion and an activity, and the next session advances; streak counts days with activities. Commit.

### Task 9: Food

**Files:** `app/(tabs)/food.tsx`, `app/food/library.tsx`, restyled `app/{capture,review,manual}.tsx`, food components.

Acceptance: targets from `macroTargets`; adding a food-list item with 1.5 portions stores 1.5× values; photo without a key offers Profile or the food list; save/capture failures show a toast and re-enable buttons; macro fields labelled; cancelling a manual entry from a failed estimate deletes the orphan photo. Commit.

### Task 10: Profile

**Files:** `app/(tabs)/profile.tsx`, `app/profile-edit.tsx`, API key form, export/delete.

Acceptance: theme switch applies instantly; language switch re-schedules reminders; edit recomputes targets; delete all data returns to onboarding. Commit.

### Task 11: Polish, README, verification

- [ ] `npm test` and `npm run typecheck` clean.
- [ ] Web smoke test of every flow in light and dark, in TM, RU, EN.
- [ ] iOS bundle builds via Expo Go without red errors in the Metro log.
- [ ] README rewritten (features, run instructions, structure, numbers and sources).
- [ ] Commit.
