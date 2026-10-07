/**
 * Daily water goal: 35 ml per kg, plus 500 ml for every hour trained, rounded
 * to 50 ml and kept within 1.5–4.5 l.
 */

const ML_PER_KG = 35;
const ML_PER_TRAINING_HOUR = 500;
const ROUNDING_ML = 50;
export const WATER_GOAL_RANGE_ML = { min: 1500, max: 4500 } as const;

function roundTo(value: number, step: number): number {
  return Math.round(value / step) * step;
}

export function waterGoalMl(weightKg: number, trainedMinutes: number): number {
  const minutes = Number.isFinite(trainedMinutes) ? Math.max(0, trainedMinutes) : 0;
  const base = roundTo(ML_PER_KG * weightKg, ROUNDING_ML);
  const training = roundTo((ML_PER_TRAINING_HOUR * minutes) / 60, ROUNDING_ML);
  return Math.min(
    WATER_GOAL_RANGE_ML.max,
    Math.max(WATER_GOAL_RANGE_ML.min, base + training),
  );
}

/** The quick-add amounts on Home and the water screen. */
export const WATER_PORTIONS_ML = [150, 250, 330, 500] as const;
