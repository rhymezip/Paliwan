# Paliwan — AI food diary

Paliwan is a local-first React Native + Expo nutrition app with a simple loop:

**Photo → Gemini analysis → review → daily tracker**

The supplied botanical mark and green palette give the app a fresh, Turkmenistan-inspired identity while the application name remains centralized in `src/constants/brand.ts` for an easy final rename.

## Features

- Photograph a meal or choose one from the gallery.
- Google Gemini identifies the complete dish, visible ingredients, portion size, calories, macros, and likely hidden oils or sauces.
- Review and correct the AI estimate before saving it.
- Track daily calories, protein, carbohydrates, and fat locally in SQLite.
- Keep the Gemini API key in SecureStore; it is never written to SQLite or exports.
- Export or delete your local diary at any time.

## Quick start

```bash
npm install
npm start
```

Create a key in [Google AI Studio](https://aistudio.google.com/apikey), then add it during onboarding or from Settings. For local development only, `SNAP_DEV_GEMINI_API_KEY` can be provided through the Expo config as a SecureStore seed.

## Architecture

- `app/` — Expo Router screens for onboarding, camera, review, Today, and Settings.
- `src/api/` — Gemini transport, structured nutrition prompt, parser, and secure key storage.
- `src/db/` — SQLite schema, migrations, and meal/profile queries.
- `src/logic/` — calorie targets, macro calculations, date handling, scaling, and export.
- `src/constants/brand.ts` — the single runtime source for product name, descriptor, logo, and brand colors.

## Privacy

There is no Paliwan account or intermediary server. Photos are sent directly from the device to Gemini only when the user requests analysis. Meals, profile data, targets, and photos stay on the device unless the user explicitly shares an export.

## License

MIT. See [LICENSE](./LICENSE).
