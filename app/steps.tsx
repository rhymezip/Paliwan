import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { View } from 'react-native';

import { formatSteps } from '@/components/home/StepsHero';
import { useI18n } from '@/i18n';
import { localDateString } from '@/logic/dates';
import { stepsToKcal, stepsToKm } from '@/logic/steps';
import { useProfileStore } from '@/store/profileStore';
import { useStepStore } from '@/store/stepStore';
import { makeStyles, useTheme } from '@/theme/ThemeProvider';
import { BarChart } from '@/ui/BarChart';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { Icon } from '@/ui/Icon';
import { ProgressRing } from '@/ui/ProgressRing';
import { Screen } from '@/ui/Screen';
import { Text } from '@/ui/Text';
import { closeScreen } from '@/ui/navigation';

export default function StepsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const styles = useStyles();
  const { tr, weekdayShort } = useI18n();
  const profile = useProfileStore((state) => state.profile);
  const { permission, today, week, requestPermission } = useStepStore();

  useFocusEffect(
    useCallback(() => {
      let stop = () => undefined as void;
      void useStepStore
        .getState()
        .refresh()
        .then(() => {
          stop = useStepStore.getState().startLive();
        });
      return () => stop();
    }, []),
  );

  if (!profile) return <Screen onBack={() => closeScreen(router)} />;

  const goal = profile.stepGoal;
  const todayDate = localDateString();
  const km = stepsToKm(today, profile.heightCm, profile.sex);
  const kcal = stepsToKcal(today, profile.weightKg, profile.heightCm, profile.sex);

  return (
    <Screen onBack={() => closeScreen(router)} title={tr.steps.title}>
      {permission === 'granted' ? (
        <>
          <Card style={styles.hero}>
            <ProgressRing size={220} stroke={18} progress={today / goal} color={theme.colors.steps}>
              <Icon name="shoe-print" size={28} color={theme.colors.steps} />
              <Text variant="display">{formatSteps(today)}</Text>
              <Text variant="label" tone="muted">
                {tr.steps.goal} {formatSteps(goal)}
              </Text>
            </ProgressRing>
            {today >= goal ? (
              <Text variant="subheading" color={theme.colors.success}>
                {tr.steps.goalReached}
              </Text>
            ) : null}
          </Card>

          <View style={styles.row}>
            <Card style={styles.metric}>
              <Icon name="map-marker-distance" size={22} color={theme.colors.water} />
              <Text variant="number">{km.toFixed(2)}</Text>
              <Text variant="caption" tone="muted">
                {tr.steps.distance}, {tr.common.km}
              </Text>
            </Card>
            <Card style={styles.metric}>
              <Icon name="fire" size={22} color={theme.colors.steps} />
              <Text variant="number">{kcal}</Text>
              <Text variant="caption" tone="muted">
                {tr.steps.energy}, {tr.common.kcal}
              </Text>
            </Card>
          </View>

          {week.length > 0 ? (
            <Card style={styles.chart}>
              <Text variant="subheading">{tr.steps.week}</Text>
              <BarChart
                color={theme.colors.steps}
                goal={goal}
                bars={week.map((day) => ({
                  label: weekdayShort(day.localDate),
                  value: day.steps,
                  highlight: day.localDate === todayDate,
                }))}
              />
            </Card>
          ) : null}
        </>
      ) : (
        <Card style={styles.blocked}>
          <Icon name="shoe-print" size={40} color={theme.colors.steps} />
          <Text align="center" tone="muted">
            {permission === 'unavailable'
              ? tr.steps.unavailable
              : permission === 'denied'
                ? tr.steps.denied
                : tr.home.stepsAllow}
          </Text>
          {permission === 'undetermined' || permission === 'unknown' ? (
            <Button label={tr.steps.allow} onPress={() => void requestPermission()} />
          ) : null}
        </Card>
      )}
    </Screen>
  );
}

const useStyles = makeStyles((t) => ({
  hero: { alignItems: 'center', gap: t.space.md, paddingVertical: t.space.xl },
  row: { flexDirection: 'row', gap: t.space.md },
  metric: { flex: 1, gap: t.space.xs },
  chart: { gap: t.space.base },
  blocked: { alignItems: 'center', gap: t.space.base, paddingVertical: t.space.xl },
}));
