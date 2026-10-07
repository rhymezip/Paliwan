import { create } from 'zustand';

import type { Goal, Sex, SportId, TrainingLoad } from '@/types';

/**
 * The onboarding draft. Held in memory only — nothing is written until the
 * permissions step finishes onboarding.
 */
interface OnboardingDraft {
  name: string;
  sex: Sex | null;
  age: number | null;
  heightCm: number | null;
  weightKg: number | null;
  sport: SportId | null;
  trainingLoad: TrainingLoad | null;
  goal: Goal | null;
}

interface OnboardingState extends OnboardingDraft {
  set: (patch: Partial<OnboardingDraft>) => void;
  reset: () => void;
}

const EMPTY: OnboardingDraft = {
  name: '',
  sex: null,
  age: null,
  heightCm: null,
  weightKg: null,
  sport: null,
  trainingLoad: null,
  goal: null,
};

export const useOnboardingStore = create<OnboardingState>((set) => ({
  ...EMPTY,
  set: (patch) => set(patch),
  reset: () => set(EMPTY),
}));

/** Ordered step routes, used by the progress bar. */
export const ONBOARDING_STEPS = [
  'language',
  'welcome',
  'name',
  'about',
  'body',
  'sport',
  'training',
  'targets',
  'permissions',
] as const;

export type OnboardingStep = (typeof ONBOARDING_STEPS)[number];

export const ONBOARDING_LIMITS = {
  age: { min: 10, max: 80 },
  heightCm: { min: 120, max: 230 },
  weightKg: { min: 25, max: 200 },
  nameLength: 30,
} as const;
