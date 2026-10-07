import type { Sex } from '@/types';

/** Walking stride as a share of height — the common pedometer estimate. */
const STRIDE_FACTOR: Record<Sex, number> = { male: 0.415, female: 0.413 };

/** Net energy cost of walking, per kg of body weight per km. */
const WALKING_KCAL_PER_KG_KM = 0.5;

export function strideMeters(heightCm: number, sex: Sex): number {
  return (heightCm / 100) * STRIDE_FACTOR[sex];
}

export function stepsToKm(steps: number, heightCm: number, sex: Sex): number {
  return (Math.max(0, steps) * strideMeters(heightCm, sex)) / 1000;
}

export function stepsToKcal(
  steps: number,
  weightKg: number,
  heightCm: number,
  sex: Sex,
): number {
  return Math.round(WALKING_KCAL_PER_KG_KM * weightKg * stepsToKm(steps, heightCm, sex));
}
