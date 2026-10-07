import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { StepShell } from '@/components/onboarding/StepShell';
import { useI18n } from '@/i18n';
import { ONBOARDING_LIMITS, useOnboardingStore } from '@/store/onboardingStore';
import { makeStyles, useTheme } from '@/theme/ThemeProvider';
import type { Sex } from '@/types';
import { Field } from '@/ui/Field';
import { OptionCard } from '@/ui/OptionCard';
import { Text } from '@/ui/Text';

export default function AboutStep() {
  const router = useRouter();
  const theme = useTheme();
  const styles = useStyles();
  const { tr, f } = useI18n();
  const draft = useOnboardingStore();
  const [ageText, setAgeText] = useState(draft.age ? String(draft.age) : '');
  const [sex, setSex] = useState<Sex | null>(draft.sex);

  const age = Number.parseInt(ageText, 10);
  const { min, max } = ONBOARDING_LIMITS.age;
  const ageValid = Number.isFinite(age) && age >= min && age <= max;
  const showAgeError = ageText.length >= 2 && !ageValid;

  const advance = () => {
    if (!ageValid || !sex) return;
    draft.set({ age, sex });
    router.push('/onboarding/body');
  };

  return (
    <StepShell
      step="about"
      title={tr.onboarding.about.title}
      primaryLabel={tr.common.continue}
      primaryDisabled={!ageValid || !sex}
      onPrimary={advance}
    >
      <Field
        label={tr.onboarding.about.age}
        value={ageText}
        onChangeText={(text) => setAgeText(text.replace(/[^0-9]/g, ''))}
        keyboardType="number-pad"
        placeholder="15"
        suffix={tr.onboarding.about.years}
        numeric
        maxLength={2}
        error={showAgeError ? f(tr.onboarding.about.ageError, { min, max }) : undefined}
      />
      <View style={styles.group}>
        <Text variant="label" tone="muted">
          {tr.onboarding.about.sex}
        </Text>
        <OptionCard
          icon="human-male"
          accent={theme.colors.water}
          title={tr.sex.male}
          selected={sex === 'male'}
          onPress={() => setSex('male')}
        />
        <OptionCard
          icon="human-female"
          accent={theme.colors.activity}
          title={tr.sex.female}
          selected={sex === 'female'}
          onPress={() => setSex('female')}
        />
        <Text variant="caption" tone="faint">
          {tr.onboarding.about.sexHint}
        </Text>
      </View>
    </StepShell>
  );
}

const useStyles = makeStyles((t) => ({
  group: { gap: t.space.sm },
}));
