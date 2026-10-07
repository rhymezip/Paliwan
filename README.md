# Paliwan — pocket coach for young athletes

Paliwan is a health and fitness app for young athletes, built with React Native and
Expo. It counts steps, reminds you to drink water, guides training sessions, logs
any sport you play, and tracks food — by photo, from a list of local dishes, or by
hand. Everything stays on the phone and works offline; only the optional photo
estimate talks to the internet (Google Gemini).

Made for the **«Sanly türgen – 2026»** hackathon (digital tools for training young
athletes).

## Features

- **Onboarding** — language first (Türkmençe, Русский, English), then name, age,
  sex, height, weight, sport, training load and goal, daily targets, and two
  optional permissions (steps, water reminders).
- **Home** — live step ring, water and food rings, active minutes and calories
  burned, today's workout, streak, tip of the day.
- **Steps** — counted automatically by the phone's motion sensor, with distance,
  calories and a 7-day chart (iPhone keeps 7 days of history).
- **Water** — one-tap glasses, a daily goal that grows on training days, and local
  reminders every few hours (no server, no account).
- **Training** — five bodyweight programs (speed & agility, strength, endurance,
  mobility, core & injury prevention), each 3 workouts × 4 weeks, with a guided
  player: timers, sets, rests, pause and skip, screen kept awake. Programs that
  suit your sport are flagged.
- **Activities** — log football, wrestling, swimming… with duration and intensity;
  calories come from MET values.
- **Food** — day view with calories and macros, a list of ~30 local and everyday
  foods (palaw, dograma, çorba, gutap, somsa, manty, çörek, gatyk, çal, gawun…),
  manual entry, and a Gemini photo estimate that answers in the app's language.
- **Profile** — edit details, water and step goals, language, light/dark/system
  theme, reminder window, Gemini key, export, delete everything.

## Numbers and safety

| What | How | Source |
|---|---|---|
| Energy | Schofield (1985) weight-based BMR by age band × activity level (1.5–2.0 by training load) | Schofield equations; FAO/WHO |
| Goals | Under 18: perform or grow (+300 kcal) only — **no deficit**. 18+: may lose 300 kcal, never below BMR × 1.3 | |
| Macros | Protein 1.6 g/kg, fat 30 % of energy, carbs the rest (min 3 g/kg) | Sports-nutrition guidance (1.2–2.0 g/kg protein) |
| Activity burn | MET × kg × hours × intensity (0.8 / 1 / 1.2) | Compendium of Physical Activities |
| Water | 35 ml/kg + 500 ml per hour trained, 1.5–4.5 l | |
| Steps | stride = height × 0.415 (♂) / 0.413 (♀); 0.5 kcal per kg per km | |

Every target screen says the numbers are guidance, not medical advice.

## Run it

Requirements: Node 20+ (22 or 24 LTS recommended) and the **Expo Go** app for
SDK 54 on your phone.

```bash
npm install
npm start
```

Scan the QR code with the iPhone camera (or Expo Go on Android). Phone and computer
must be on the same Wi-Fi. On Windows you can also double-click `start-expo.cmd`.

Browser preview: `npm run web`. Steps, reminders and the camera need a phone; the
rest works in the browser.

### Photo estimates (optional)

Create a key at [Google AI Studio](https://aistudio.google.com/apikey) and add it
in **Profile → Photo estimates**. The key is kept in the phone's secure storage and
sent only to Gemini, in a request header. For local development you can put it in
`.env` as `PALIWAN_GEMINI_API_KEY` (see `.env.example`) — never in a published
build.

## Checks

```bash
npm test            # unit tests for the energy, macro, water, step, streak and workout math
npm run typecheck   # strict TypeScript
```

## Project layout

```
app/                  screens (expo-router)
  (tabs)/             Home, Training, Food, Profile + custom tab bar
  onboarding/         language → … → permissions
  workout/            guided workout player
src/
  api/                Gemini transport, prompt, parser, key storage
  components/         feature components (home, food, onboarding, tab bar)
  data/               sports, activities, exercises, programs, foods, tips
  db/                 SQLite schema + migrations, queries
  i18n/               en (source shape), tk, ru — a missing key is a type error
  logic/              pure, tested calculations
  services/           step counter, local notifications
  store/              zustand stores per domain
  theme/              light/dark palettes, tokens, ThemeProvider, makeStyles
  ui/                 design-system components
docs/superpowers/     design spec and implementation plan
```

## Privacy

There is no account and no server. Profile, meals, water, activities and photos
stay on the phone until you export them. Delete everything from Profile at any
time.

## License

MIT. See [LICENSE](./LICENSE).
