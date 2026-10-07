import { useRouter } from 'expo-router';
import { useState } from 'react';

import { StepShell } from '@/components/onboarding/StepShell';
import { useI18n } from '@/i18n';
import { ONBOARDING_LIMITS, useOnboardingStore } from '@/store/onboardingStore';
import { Field } from '@/ui/Field';

export default function NameStep() {
  const router = useRouter();
  const { tr } = useI18n();
  const stored = useOnboardingStore((state) => state.name);
  const set = useOnboardingStore((state) => state.set);
  const [value, setValue] = useState(stored);
  const [touched, setTouched] = useState(false);

  const name = value.trim();
  const valid = name.length > 0;

  const advance = () => {
    setTouched(true);
    if (!valid) return;
    set({ name });
    router.push('/onboarding/about');
  };

  return (
    <StepShell
      step="name"
      title={tr.onboarding.name.title}
      primaryLabel={tr.common.continue}
      primaryDisabled={!valid}
      onPrimary={advance}
    >
      <Field
        value={value}
        onChangeText={setValue}
        placeholder={tr.onboarding.name.placeholder}
        autoFocus
        autoCapitalize="words"
        autoComplete="given-name"
        maxLength={ONBOARDING_LIMITS.nameLength}
        returnKeyType="next"
        onSubmitEditing={advance}
        error={touched && !valid ? tr.onboarding.name.error : undefined}
      />
    </StepShell>
  );
}
