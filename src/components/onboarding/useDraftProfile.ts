import { useMemo } from 'react';

import { profileFromBasics } from '@/logic/targets';
import { useOnboardingStore } from '@/store/onboardingStore';
import type { Profile } from '@/types';

/** The profile the draft would save, with targets; null when a step was skipped. */
export function useDraftProfile(): Profile | null {
  const draft = useOnboardingStore();
  return useMemo(() => {
    if (
      !draft.name ||
      !draft.sex ||
      draft.age === null ||
      draft.heightCm === null ||
      draft.weightKg === null ||
      !draft.sport ||
      !draft.trainingLoad ||
      !draft.goal
    ) {
      return null;
    }
    return profileFromBasics(
      {
        name: draft.name,
        sex: draft.sex,
        age: draft.age,
        heightCm: draft.heightCm,
        weightKg: draft.weightKg,
        sport: draft.sport,
        trainingLoad: draft.trainingLoad,
        goal: draft.goal,
      },
      new Date().toISOString(),
    );
  }, [draft]);
}
