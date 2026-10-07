/** Shared domain types. Mirrors the SQLite schema in `src/db/schema.ts`. */

export type Sex = 'male' | 'female';

/** How hard the athlete trains in a normal week. Sets the activity level (PAL). */
export type TrainingLoad = 'light' | 'moderate' | 'high' | 'very_high';

/** `lose` is only offered from 18 — see `goalsForAge`. */
export type Goal = 'perform' | 'grow' | 'lose';

export type Intensity = 'easy' | 'moderate' | 'hard';

export type Units = 'metric' | 'imperial';

export type SportId =
  | 'football'
  | 'wrestling'
  | 'boxing'
  | 'judo'
  | 'swimming'
  | 'athletics'
  | 'basketball'
  | 'volleyball'
  | 'gymnastics'
  | 'tennis'
  | 'cycling'
  | 'other';

export type ActivityTypeId =
  | 'training'
  | 'running'
  | 'walking'
  | 'cycling'
  | 'swimming'
  | 'football'
  | 'basketball'
  | 'volleyball'
  | 'wrestling'
  | 'boxing'
  | 'judo'
  | 'gymnastics'
  | 'tennis'
  | 'strength'
  | 'jump_rope'
  | 'yoga'
  | 'dance'
  | 'horse_riding'
  | 'other';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export type MealSource = 'photo' | 'manual' | 'library';

export type Confidence = 'high' | 'medium' | 'low';

export type MeasureUnit =
  | 'g'
  | 'ml'
  | 'piece'
  | 'cup'
  | 'tbsp'
  | 'tsp'
  | 'slice'
  | 'serving';

export const MEASURE_UNITS: readonly MeasureUnit[] = [
  'g',
  'ml',
  'piece',
  'cup',
  'tbsp',
  'tsp',
  'slice',
  'serving',
];

export const MEAL_TYPES: readonly MealType[] = [
  'breakfast',
  'lunch',
  'dinner',
  'snack',
];

export interface Profile {
  name: string;
  sex: Sex;
  age: number;
  heightCm: number;
  weightKg: number;
  sport: SportId;
  trainingLoad: TrainingLoad;
  goal: Goal;
  targetCalories: number;
  waterGoalMl: number;
  stepGoal: number;
  units: Units;
  onboardedAt: string;
}

export interface MealItem {
  id: string;
  mealId: string;
  name: string;
  quantity: number;
  unit: MeasureUnit;
  /** Calories for the whole row, i.e. already multiplied by `quantity`. */
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  isManualAddition: boolean;
  sortOrder: number;
}

export interface Meal {
  id: string;
  loggedAt: string;
  localDate: string;
  mealType: MealType;
  name: string;
  photoUri: string | null;
  source: MealSource;
  confidence: Confidence | null;
  createdAt: string;
}

export interface MealWithItems extends Meal {
  items: MealItem[];
}

export interface Macros {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

export interface DailyTarget {
  localDate: string;
  targetCalories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

export interface WaterLog {
  id: string;
  loggedAt: string;
  localDate: string;
  amountMl: number;
}

export type ActivitySource = 'manual' | 'workout';

export interface Activity {
  id: string;
  localDate: string;
  loggedAt: string;
  type: ActivityTypeId;
  durationMin: number;
  intensity: Intensity;
  kcal: number;
  source: ActivitySource;
  programId: string | null;
}

export interface WorkoutCompletion {
  id: string;
  programId: string;
  sessionIndex: number;
  completedAt: string;
  activityId: string | null;
}

/** A hidden-ingredient quick-pick, loaded from `assets/hidden-ingredients.json`. */
export interface HiddenIngredient {
  name: string;
  defaultQuantity: number;
  unit: MeasureUnit;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

/** A single detected food, as returned by the vision model. */
export interface EstimatedItem {
  name: string;
  quantity: number;
  unit: MeasureUnit;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

/** A parsed, validated vision response. */
export interface MealEstimate {
  mealName: string;
  estimatedWeightG: number | null;
  confidence: Confidence;
  items: EstimatedItem[];
  likelyHiddenIngredients: string[];
}
