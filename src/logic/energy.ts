import type { Goal, Sex, TrainingLoad } from '@/types';

/**
 * Daily energy needs for young athletes.
 *
 * BMR comes from the Schofield (1985) weight-based equations, which have bands
 * for children and teenagers — Mifflin-St Jeor, the usual app formula, was fitted
 * on adults only. Daily needs are BMR × a physical activity level (PAL) set by the
 * athlete's weekly training load.
 */

interface SchofieldBand {
  /** The band covers ages below this. */
  below: number;
  /** [kcal per kg, constant] */
  male: readonly [number, number];
  female: readonly [number, number];
}

const SCHOFIELD: readonly SchofieldBand[] = [
  { below: 10, male: [22.706, 504.3], female: [20.315, 485.9] },
  { below: 18, male: [17.686, 658.2], female: [13.384, 692.6] },
  { below: 30, male: [15.057, 692.2], female: [14.818, 486.6] },
  { below: 60, male: [11.472, 873.1], female: [8.126, 845.6] },
  { below: Infinity, male: [11.711, 587.7], female: [9.082, 658.5] },
];

export function schofieldBmr(sex: Sex, age: number, weightKg: number): number {
  const band =
    SCHOFIELD.find((candidate) => age < candidate.below) ?? SCHOFIELD[SCHOFIELD.length - 1]!;
  const [perKg, constant] = band[sex];
  return perKg * weightKg + constant;
}

/** Physical activity level by weekly training load. */
export const PAL: Record<TrainingLoad, number> = {
  light: 1.5,
  moderate: 1.65,
  high: 1.8,
  very_high: 2.0,
};

/** Weight-loss goals are adults-only. */
export const ADULT_AGE = 18;

const GOAL_ADJUSTMENT: Record<Goal, number> = { perform: 0, grow: 300, lose: -300 };

/** A deficit never takes the target below BMR × this. */
const LOSE_FLOOR = 1.3;

export function goalsForAge(age: number): Goal[] {
  return age >= ADULT_AGE ? ['perform', 'grow', 'lose'] : ['perform', 'grow'];
}

export interface EnergyInput {
  sex: Sex;
  age: number;
  weightKg: number;
  load: TrainingLoad;
  goal: Goal;
}

export interface EnergyTargets {
  bmr: number;
  /** Energy to hold weight at this training load. */
  maintenance: number;
  /** Maintenance adjusted for the goal. */
  target: number;
}

export function energyTargets(input: EnergyInput): EnergyTargets {
  const bmr = schofieldBmr(input.sex, input.age, input.weightKg);
  const maintenance = Math.round(bmr * PAL[input.load]);
  // A goal the age doesn't allow (an old profile, a birthday edit) falls back.
  const goal = goalsForAge(input.age).includes(input.goal) ? input.goal : 'perform';

  let target = maintenance + GOAL_ADJUSTMENT[goal];
  if (goal === 'lose') {
    target = Math.max(target, Math.round(bmr * LOSE_FLOOR));
  }
  return { bmr: Math.round(bmr), maintenance, target };
}
