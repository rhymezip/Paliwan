import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { StepShell } from '@/components/onboarding/StepShell';
import { SPORTS } from '@/data/sports';
import { useI18n } from '@/i18n';
import { useOnboardingStore } from '@/store/onboardingStore';
import { makeStyles, useTheme } from '@/theme/ThemeProvider';
import type { SportId } from '@/types';
import { Icon } from '@/ui/Icon';
import { Text } from '@/ui/Text';

export default function SportStep() {
  const router = useRouter();
  const theme = useTheme();
  const styles = useStyles();
  const { tr, pick } = useI18n();
  const draft = useOnboardingStore();
  const [sport, setSport] = useState<SportId | null>(draft.sport);

  return (
    <StepShell
      step="sport"
      title={tr.onboarding.sport.title}
      detail={tr.onboarding.sport.detail}
      primaryLabel={tr.common.continue}
      primaryDisabled={!sport}
      onPrimary={() => {
        if (!sport) return;
        draft.set({ sport });
        router.push('/onboarding/training');
      }}
    >
      <View style={styles.grid}>
        {SPORTS.map((option) => {
          const selected = option.id === sport;
          return (
            <Pressable
              key={option.id}
              onPress={() => setSport(option.id)}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              accessibilityLabel={pick(option.name)}
              style={({ pressed }) => [styles.tile, selected && styles.selected, pressed && styles.pressed]}
            >
              <Icon
                name={option.icon}
                size={30}
                color={selected ? theme.colors.primary : theme.colors.textMuted}
              />
              <Text variant="label" align="center" numberOfLines={2}>
                {pick(option.name)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </StepShell>
  );
}

const useStyles = makeStyles((t) => ({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: t.space.sm },
  tile: {
    width: '31%',
    flexGrow: 1,
    aspectRatio: 1,
    borderRadius: t.radius.lg,
    backgroundColor: t.colors.surface,
    borderWidth: 1.5,
    borderColor: t.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.space.sm,
    padding: t.space.sm,
  },
  selected: { borderColor: t.colors.primary, backgroundColor: t.colors.primarySoft },
  pressed: { opacity: 0.85 },
}));
