import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { StepShell } from '@/components/onboarding/StepShell';
import type { IconName } from '@/data/icons';
import { useI18n } from '@/i18n';
import { ADULT_AGE, goalsForAge } from '@/logic/energy';
import { useOnboardingStore } from '@/store/onboardingStore';
import { makeStyles, useTheme } from '@/theme/ThemeProvider';
import type { Goal, TrainingLoad } from '@/types';
import { Card } from '@/ui/Card';
import { Icon } from '@/ui/Icon';
import { OptionCard } from '@/ui/OptionCard';
import { Text } from '@/ui/Text';

const LOADS: readonly { value: TrainingLoad; icon: IconName }[] = [
  { value: 'light', icon: 'signal-cellular-1' },
  { value: 'moderate', icon: 'signal-cellular-2' },
  { value: 'high', icon: 'signal-cellular-3' },
  { value: 'very_high', icon: 'fire' },
];

const GOAL_ICONS: Record<Goal, IconName> = {
  perform: 'trophy-outline',
  grow: 'arm-flex',
  lose: 'scale-bathroom',
};

export default function TrainingStep() {
  const router = useRouter();
  const theme = useTheme();
  const styles = useStyles();
  const { tr } = useI18n();
  const draft = useOnboardingStore();
  const age = draft.age ?? ADULT_AGE;
  const goals = goalsForAge(age);
  const [load, setLoad] = useState<TrainingLoad>(draft.trainingLoad ?? 'moderate');
  const [goal, setGoal] = useState<Goal>(
    draft.goal && goals.includes(draft.goal) ? draft.goal : 'perform',
  );

  return (
    <StepShell
      step="training"
      title={tr.onboarding.training.title}
      primaryLabel={tr.common.continue}
      onPrimary={() => {
        draft.set({ trainingLoad: load, goal });
        router.push('/onboarding/targets');
      }}
    >
      <View style={styles.group}>
        {LOADS.map((option) => (
          <OptionCard
            key={option.value}
            icon={option.icon}
            accent={theme.colors.steps}
            title={tr.load[option.value].title}
            detail={tr.load[option.value].detail}
            selected={load === option.value}
            onPress={() => setLoad(option.value)}
          />
        ))}
      </View>

      <Text variant="heading" style={styles.goalTitle}>
        {tr.onboarding.training.goalTitle}
      </Text>
      <View style={styles.group}>
        {goals.map((option) => (
          <OptionCard
            key={option}
            icon={GOAL_ICONS[option]}
            title={tr.goal[option].title}
            detail={tr.goal[option].detail}
            selected={goal === option}
            onPress={() => setGoal(option)}
          />
        ))}
      </View>

      {age < ADULT_AGE ? (
        <Card style={styles.note}>
          <Icon name="information-outline" size={20} color={theme.colors.primary} />
          <Text variant="caption" tone="muted" style={styles.noteText}>
            {tr.onboarding.training.under18}
          </Text>
        </Card>
      ) : null}
    </StepShell>
  );
}

const useStyles = makeStyles((t) => ({
  group: { gap: t.space.sm },
  goalTitle: { marginTop: t.space.sm },
  note: { flexDirection: 'row', gap: t.space.md, alignItems: 'flex-start' },
  noteText: { flex: 1 },
}));
