# Paliwan redesign: health & fitness for young athletes

Date: 2026-10-08 · Status: approved by the user in chat · Branch: `redesign`

## Goal

Turn Paliwan from a photo calorie tracker into a full health and fitness app for
young athletes (the "Sanly türgen – 2026" hackathon theme). Calorie tracking stays,
as one module of four. Must run in Expo Go (SDK 54) on the user's iPhone and work
without internet, except for the optional Gemini photo estimate.

## Users and success criteria

- A young athlete (10–25) opens the app, picks a language, enters a name, body data
  and sport, and lands on a dashboard that already shows live steps.
- They can log water in one tap and get water reminders.
- They can follow a training program with a guided workout player.
- They can log any sport session and see calories burned.
- They can log food by photo (Gemini), from a local food list, or by hand.
- Light and dark mode; Turkmen, Russian and English with no mixed-language screens.
- No action ever leaves a spinner running forever; failures show a localized toast.

## Navigation

Bottom tabs with a raised centre button: **Home · Training · [+] · Food · Profile**.
The [+] button opens a quick-add sheet: drink water, log activity, photo meal,
food list, start workout.

Stack screens (modals): onboarding, water, steps, activity/new, program/[id],
workout/[programId], food/library, capture, review, manual, profile-edit.
The debug "Design tokens" screen is removed.

## Onboarding

language → welcome → name → age & sex → height & weight → sport → training load
& goal → targets summary → permissions (steps, water reminders; both skippable).
The Gemini key is no longer an onboarding step; it lives in Profile and is offered
when the user first tries a photo estimate without one.

## Screens

- **Home:** greeting with name, ring tiles for steps / water / food kcal, active
  minutes and kcal burned, one-tap +250 ml water, today's workout from the active
  program, streak, a daily tip.
- **Steps:** today's steps, km, kcal, 7-day bars (iOS history API).
- **Water:** progress, quick amounts (150/250/330/500 ml), today's log with delete,
  link to reminder settings.
- **Training:** active program card (next session, progress), five programs, recent
  activities, "Log activity".
- **Program detail:** description, 12 sessions (3 workouts × 4 weeks) with ticks.
- **Workout player:** timed or reps steps with sets and rests, pause/skip, progress,
  keep-awake, haptics; finishing saves an activity and a completion.
- **Log activity:** sport/activity grid, minutes, intensity, kcal preview.
- **Food:** day view (date strip, remaining kcal ring, macro bars, meals), add by
  photo / food list / manual.
- **Food list:** ~30 local and common foods with portion sizes; pick, adjust
  portions, save.
- **Profile:** profile card and edit, targets (water and step goals editable),
  language, theme (System / Light / Dark), water reminders (on/off, from, to, every),
  Gemini key, export data, delete all data, disclaimer.

## Numbers (pure functions, unit-tested)

- **Energy:** Schofield weight-based BMR by age band and sex, × PAL by training
  load (light 1.5, moderate 1.65, high 1.8, very high 2.0).
- **Goals:** under 18 → "perform" (±0) or "grow" (+300). 18+ may also "lose"
  (−300, floored at BMR × 1.3). No deficit goals under 18.
- **Macros:** protein 1.6 g/kg, fat 30 % of kcal, carbs = remainder (floor 3 g/kg).
- **Activity kcal:** MET × kg × hours × intensity factor (easy 0.8, moderate 1,
  hard 1.2). METs from the Compendium of Physical Activities.
- **Water goal:** 35 ml/kg rounded to 50 ml, + 500 ml per hour trained,
  clamped to 1500–4500 ml.
- **Steps:** stride = height × 0.415 (male) / 0.413 (female); kcal = 0.5 × kg × km.
- **Reminders:** daily times from start to end hour every N hours.
- **Streak:** consecutive days, ending today or yesterday, with an activity.

All targets carry a "guidance, not medical advice" note.

## Architecture

- **Theme:** `src/theme` with light and dark palettes, `ThemeProvider`
  (preference: system/light/dark), `useTheme()`, and `makeStyles()` so styles
  follow the theme. React Navigation theme set to match. Font: Manrope (has
  Cyrillic and Turkmen letters; Archivo/Fraunces lack Cyrillic).
- **i18n:** `src/i18n` with `en.ts` as the source shape and `tk.ts`, `ru.ts` typed
  to the same shape (a missing key is a type error). `useI18n()` returns the active
  dictionary and a `{param}` formatter. Static data carries `{ tk, ru, en }` names.
- **Data:** SQLite migration 2 (additive): `settings` key/value, profile columns
  `name`, `sport`, `water_goal_ml`, `step_goal`, tables `water_logs`, `activities`,
  `workout_completions`, `step_days`. Old meals are kept. Old activity levels and
  goals map to the new ones.
- **Services:** `pedometer` (expo-sensors) and `notifications` (expo-notifications
  local daily triggers). Both no-op with a clear state on web.
- **State:** zustand stores per domain (settings, profile, day/food, water,
  activity, program, steps).
- **Errors:** every async handler catches and shows a localized toast.
- **Config:** `app.config.ts` stops importing a `.ts` file (brand meta moves to
  JSON) so Node 20 can start the project; env var renamed to
  `PALIWAN_GEMINI_API_KEY`; `userInterfaceStyle: automatic`; plugins for sensors
  and notifications.

## Testing

- `npm test`: Node's built-in test runner (with sucrase) over `src/logic`.
- `npm run typecheck` clean.
- Smoke test of every flow in the web preview; bundle check on the iPhone via
  Expo Go.

## Build order

1. Foundation: theme, i18n, fonts, navigation, onboarding, migration, config fix.
2. Home, steps, water, reminders.
3. Activities, programs, workout player.
4. Food redesign and local food list.
5. Profile, polish, tests, README.

## Out of scope

Accounts and sync, coach/multi-athlete mode, push notifications from a server,
Health/Google Fit integration, sounds, custom program builder.
