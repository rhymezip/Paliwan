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

function clampGoal(ml: number): number {
  return Math.min(WATER_GOAL_RANGE_ML.max, Math.max(WATER_GOAL_RANGE_ML.min, ml));
}

/** Extra water for the minutes trained today. */
export function trainingWaterMl(trainedMinutes: number): number {
  const minutes = Number.isFinite(trainedMinutes) ? Math.max(0, trainedMinutes) : 0;
  return roundTo((ML_PER_TRAINING_HOUR * minutes) / 60, ROUNDING_ML);
}

/** The everyday base goal for a body weight. */
export function baseWaterGoalMl(weightKg: number): number {
  return clampGoal(roundTo(ML_PER_KG * weightKg, ROUNDING_ML));
}

export function waterGoalMl(weightKg: number, trainedMinutes: number): number {
  return clampGoal(roundTo(ML_PER_KG * weightKg, ROUNDING_ML) + trainingWaterMl(trainedMinutes));
}

/** Today's goal: the athlete's own base goal plus training, within range. */
export function todayWaterGoalMl(baseGoalMl: number, trainedMinutes: number): number {
  return clampGoal(baseGoalMl + trainingWaterMl(trainedMinutes));
}

/** The quick-add amounts on Home and the water screen. */
export const WATER_PORTIONS_ML = [150, 250, 330, 500] as const;
