import { useRouter } from 'expo-router';
import { useState } from 'react';

import { StepShell } from '@/components/onboarding/StepShell';
import { useI18n } from '@/i18n';
import { ONBOARDING_LIMITS, useOnboardingStore } from '@/store/onboardingStore';
import { Field } from '@/ui/Field';

function parseDecimal(text: string): number {
  return Number.parseFloat(text.replace(',', '.'));
}

export default function BodyStep() {
  const router = useRouter();
  const { tr, f } = useI18n();
  const draft = useOnboardingStore();
  const [heightText, setHeightText] = useState(draft.heightCm ? String(draft.heightCm) : '');
  const [weightText, setWeightText] = useState(draft.weightKg ? String(draft.weightKg) : '');

  const height = parseDecimal(heightText);
  const weight = parseDecimal(weightText);
  const { heightCm: hRange, weightKg: wRange } = ONBOARDING_LIMITS;
  const heightValid = Number.isFinite(height) && height >= hRange.min && height <= hRange.max;
  const weightValid = Number.isFinite(weight) && weight >= wRange.min && weight <= wRange.max;

  const advance = () => {
    if (!heightValid || !weightValid) return;
    draft.set({ heightCm: Math.round(height), weightKg: Math.round(weight * 10) / 10 });
    router.push('/onboarding/sport');
  };

  return (
    <StepShell
      step="body"
      title={tr.onboarding.body.title}
      detail={tr.onboarding.body.detail}
      primaryLabel={tr.common.continue}
      primaryDisabled={!heightValid || !weightValid}
      onPrimary={advance}
    >
      <Field
        label={tr.onboarding.body.height}
        value={heightText}
        onChangeText={setHeightText}
        keyboardType="decimal-pad"
        placeholder="165"
        suffix={tr.common.cm}
        numeric
        maxLength={5}
        error={
          heightText.length >= 3 && !heightValid
            ? f(tr.onboarding.body.heightError, { min: hRange.min, max: hRange.max })
            : undefined
        }
      />
      <Field
        label={tr.onboarding.body.weight}
        value={weightText}
        onChangeText={setWeightText}
        keyboardType="decimal-pad"
        placeholder="55"
        suffix={tr.common.kg}
        numeric
        maxLength={5}
        error={
          weightText.length >= 2 && !weightValid
            ? f(tr.onboarding.body.weightError, { min: wRange.min, max: wRange.max })
            : undefined
        }
      />
    </StepShell>
  );
}
