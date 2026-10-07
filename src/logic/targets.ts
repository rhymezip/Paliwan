import type { Profile } from '@/types';

import { energyTargets } from './energy';
import { baseWaterGoalMl } from './water';

/**
 * Daily step goal. Children and teens are advised an hour of activity a day,
 * which lands nearer 12,000 steps than the adult 10,000.
 */
export function defaultStepGoal(age: number): number {
  return age < 18 ? 12000 : 10000;
}

export type ProfileBasics = Pick<
  Profile,
  'name' | 'sex' | 'age' | 'heightCm' | 'weightKg' | 'sport' | 'trainingLoad' | 'goal'
>;

/** A complete profile from the basics, with every target freshly computed. */
export function profileFromBasics(basics: ProfileBasics, onboardedAt: string): Profile {
  return {
    ...basics,
    targetCalories: energyTargets({
      sex: basics.sex,
      age: basics.age,
      weightKg: basics.weightKg,
      load: basics.trainingLoad,
      goal: basics.goal,
    }).target,
    waterGoalMl: baseWaterGoalMl(basics.weightKg),
    stepGoal: defaultStepGoal(basics.age),
    units: 'metric',
    onboardedAt,
  };
}

/**
 * Applies an edit. The energy target is always recomputed; the water goal
 * follows a weight change unless the edit sets it explicitly.
 */
export function applyProfileEdit(current: Profile, patch: Partial<Profile>): Profile {
  const merged: Profile = { ...current, ...patch };
  const weightChanged = patch.weightKg !== undefined && patch.weightKg !== current.weightKg;
  return {
    ...merged,
    targetCalories: energyTargets({
      sex: merged.sex,
      age: merged.age,
      weightKg: merged.weightKg,
      load: merged.trainingLoad,
      goal: merged.goal,
    }).target,
    waterGoalMl:
      patch.waterGoalMl ?? (weightChanged ? baseWaterGoalMl(merged.weightKg) : merged.waterGoalMl),
  };
}
