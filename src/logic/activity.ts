import type { Intensity } from '@/types';

/** Scales an activity's MET for how hard the session felt. */
export const INTENSITY_FACTOR: Record<Intensity, number> = {
  easy: 0.8,
  moderate: 1,
  hard: 1.2,
};

/**
 * Energy burned by an activity: MET × kg × hours × intensity factor. METs come
 * from the Compendium of Physical Activities (see `src/data/activityTypes.ts`).
 * Impossible input burns nothing rather than a negative or NaN amount.
 */
export function activityKcal(
  met: number,
  minutes: number,
  intensity: Intensity,
  weightKg: number,
): number {
  const valid = [met, minutes, weightKg].every((value) => Number.isFinite(value) && value > 0);
  if (!valid) return 0;
  return Math.round(met * weightKg * (minutes / 60) * INTENSITY_FACTOR[intensity]);
}
