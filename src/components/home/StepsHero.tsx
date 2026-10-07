import { View } from 'react-native';

import { useI18n } from '@/i18n';
import { stepsToKcal, stepsToKm } from '@/logic/steps';
import type { StepPermission } from '@/services/pedometer';
import { makeStyles, useTheme } from '@/theme/ThemeProvider';
import type { Profile } from '@/types';
import { Card } from '@/ui/Card';
import { Icon } from '@/ui/Icon';
import { ProgressRing } from '@/ui/ProgressRing';
import { Text } from '@/ui/Text';

export function formatSteps(steps: number): string {
  return Math.round(steps).toLocaleString('en-US').replace(/,/g, ' ');
}

interface StepsHeroProps {
  profile: Profile;
  steps: number;
  permission: StepPermission | 'unknown';
  onPress: () => void;
}

/** The big gradient card at the top of Home: today's steps against the goal. */
export function StepsHero({ profile, steps, permission, onPress }: StepsHeroProps) {
  const theme = useTheme();
  const styles = useStyles();
  const { tr } = useI18n();
  const counting = permission === 'granted';
  const km = stepsToKm(steps, profile.heightCm, profile.sex);
  const kcal = stepsToKcal(steps, profile.weightKg, profile.heightCm, profile.sex);

  return (
    <Card gradient="hero" onPress={onPress} accessibilityLabel={tr.steps.title}>
      <View style={styles.row}>
        <ProgressRing
          size={128}
          stroke={12}
          progress={counting ? steps / profile.stepGoal : 0}
          color={theme.colors.onMedia}
          trackColor="rgba(255, 255, 255, 0.22)"
        >
          <Icon name="shoe-print" size={30} color={theme.colors.onMedia} />
        </ProgressRing>
        <View style={styles.stats}>
          <Text variant="overline" tone="onMediaMuted">
            {tr.home.steps}
          </Text>
          {counting ? (
            <>
              <Text variant="display" tone="onMedia" numberOfLines={1} adjustsFontSizeToFit>
                {formatSteps(steps)}
              </Text>
              <Text variant="label" tone="onMediaMuted">
                {tr.steps.goal} {formatSteps(profile.stepGoal)}
              </Text>
              <View style={styles.chips}>
                <View style={styles.chip}>
                  <Text variant="label" tone="onMedia">
                    {km.toFixed(1)} {tr.common.km}
                  </Text>
                </View>
                <View style={styles.chip}>
                  <Text variant="label" tone="onMedia">
                    {kcal} {tr.common.kcal}
                  </Text>
                </View>
              </View>
            </>
          ) : (
            <Text variant="bodyStrong" tone="onMedia">
              {permission === 'unavailable' ? tr.home.stepsUnavailable : tr.home.stepsAllow}
            </Text>
          )}
        </View>
      </View>
    </Card>
  );
}

const useStyles = makeStyles((t) => ({
  row: { flexDirection: 'row', alignItems: 'center', gap: t.space.lg },
  stats: { flex: 1, gap: t.space.xxs },
  chips: { flexDirection: 'row', gap: t.space.sm, marginTop: t.space.sm, flexWrap: 'wrap' },
  chip: {
    paddingHorizontal: t.space.md,
    paddingVertical: t.space.xs,
    borderRadius: t.radius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
}));
