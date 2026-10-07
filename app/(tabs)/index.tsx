import * as Haptics from 'expo-haptics';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { Pressable, View } from 'react-native';

import { StatTile } from '@/components/home/StatTile';
import { StepsHero } from '@/components/home/StepsHero';
import { useTodayFood } from '@/components/home/useTodayFood';
import { WorkoutCard } from '@/components/home/WorkoutCard';
import { programById } from '@/data/programs';
import { tipForDate } from '@/data/tips';
import { useI18n } from '@/i18n';
import { localDateString } from '@/logic/dates';
import { stepsToKcal } from '@/logic/steps';
import { todayWaterGoalMl } from '@/logic/water';
import { activitiesOn, totalsFor, useActivityStore } from '@/store/activityStore';
import { useProfileStore } from '@/store/profileStore';
import { completedSessions, nextSessionIndex, useProgramStore } from '@/store/programStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useStepStore } from '@/store/stepStore';
import { useWaterStore } from '@/store/waterStore';
import { makeStyles, useTheme } from '@/theme/ThemeProvider';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { Icon } from '@/ui/Icon';
import { Avatar } from '@/ui/misc';
import { Screen } from '@/ui/Screen';
import { Text } from '@/ui/Text';
import { useToast } from '@/ui/Toast';

const QUICK_WATER_ML = 250;

function greetingFor(hour: number): 'greetingMorning' | 'greetingDay' | 'greetingEvening' {
  if (hour < 12) return 'greetingMorning';
  if (hour < 18) return 'greetingDay';
  return 'greetingEvening';
}

export default function HomeScreen() {
  const router = useRouter();
  const theme = useTheme();
  const styles = useStyles();
  const toast = useToast();
  const { tr, f, pick, longDate } = useI18n();

  const profile = useProfileStore((state) => state.profile);
  const activeProgramId = useSettingsStore((state) => state.activeProgramId);
  const water = useWaterStore();
  const activities = useActivityStore();
  const steps = useStepStore();
  const completions = useProgramStore((state) => state.completions);
  const loadCompletions = useProgramStore((state) => state.load);
  const eaten = useTodayFood();

  const today = localDateString();

  useFocusEffect(
    useCallback(() => {
      void useWaterStore.getState().load().catch(() => undefined);
      void useActivityStore.getState().load().catch(() => undefined);
      void loadCompletions().catch(() => undefined);
      // Only start listening if the screen is still focused when the count arrives;
      // otherwise every quick visit would leave a listener behind.
      let active = true;
      let stopLive = () => undefined as void;
      void useStepStore
        .getState()
        .refresh()
        .then(() => {
          if (active) stopLive = useStepStore.getState().startLive();
        });
      return () => {
        active = false;
        stopLive();
      };
    }, [loadCompletions]),
  );

  const todayActivity = useMemo(
    () => totalsFor(activitiesOn(activities.week, today)),
    [activities.week, today],
  );

  if (!profile) return <Screen tabBarSpace />;

  const program = activeProgramId ? programById(activeProgramId) : undefined;
  const sessionIndex = program ? nextSessionIndex(completions, program.id) : null;
  const waterGoal = todayWaterGoalMl(profile.waterGoalMl, todayActivity.minutes);
  const stepKcal = steps.permission === 'granted'
    ? stepsToKcal(steps.today, profile.weightKg, profile.heightCm, profile.sex)
    : 0;
  const burned = Math.round(todayActivity.kcal + stepKcal);
  const hour = new Date().getHours();

  const drink = async () => {
    try {
      await water.add(QUICK_WATER_ML);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      toast.show({ message: f(tr.toast.waterAdded, { ml: QUICK_WATER_ML }), tone: 'success' });
    } catch {
      toast.show({ message: tr.common.errorGeneric, tone: 'error' });
    }
  };

  return (
    <Screen tabBarSpace>
      <View style={styles.header}>
        <View style={styles.flex}>
          <Text variant="caption" tone="muted">
            {longDate(today)}
          </Text>
          <Text variant="heading" numberOfLines={2}>
            {f(tr.home[greetingFor(hour)], { name: profile.name })}
          </Text>
        </View>
        <Pressable onPress={() => router.navigate('/(tabs)/profile')} accessibilityRole="button" accessibilityLabel={tr.tabs.profile}>
          <Avatar name={profile.name} />
        </Pressable>
      </View>

      <View style={styles.streak}>
        <Icon name="fire" size={18} color={activities.streak > 0 ? theme.colors.steps : theme.colors.textFaint} />
        <Text variant="label" tone={activities.streak > 0 ? 'default' : 'muted'}>
          {activities.streak > 0 ? f(tr.home.streak, { n: activities.streak }) : tr.home.streakZero}
        </Text>
      </View>

      <StepsHero
        profile={profile}
        steps={steps.today}
        permission={steps.permission}
        onPress={() => router.push('/steps')}
      />

      <View style={styles.row}>
        <StatTile
          label={tr.home.water}
          value={`${water.totalMl}`}
          caption={`/ ${waterGoal} ${tr.common.ml}`}
          icon="cup-water"
          color={theme.colors.water}
          progress={water.totalMl / waterGoal}
          onPress={() => router.push('/water')}
          footer={
            <Button
              label={f(tr.home.addWater, { ml: QUICK_WATER_ML })}
              size="sm"
              variant="secondary"
              icon="plus"
              onPress={() => void drink()}
            />
          }
        />
        <StatTile
          label={tr.home.eaten}
          value={`${Math.round(eaten.calories)}`}
          caption={`/ ${profile.targetCalories} ${tr.common.kcal}`}
          icon="food-apple"
          color={theme.colors.food}
          progress={eaten.calories / profile.targetCalories}
          onPress={() => router.navigate('/(tabs)/food')}
        />
      </View>

      <View style={styles.row}>
        <StatTile
          label={tr.home.active}
          value={f(tr.home.minutes, { n: Math.round(todayActivity.minutes) })}
          caption={tr.common.today}
          icon="timer-outline"
          color={theme.colors.activity}
          onPress={() => router.navigate('/(tabs)/train')}
        />
        <StatTile
          label={tr.home.burned}
          value={`${burned}`}
          caption={tr.common.kcal}
          icon="fire"
          color={theme.colors.steps}
          onPress={() => router.navigate('/(tabs)/train')}
        />
      </View>

      <WorkoutCard
        program={program}
        sessionIndex={sessionIndex}
        completedCount={program ? completedSessions(completions, program.id).size : 0}
        onStart={() =>
          program &&
          router.push({ pathname: '/workout/[programId]', params: { programId: program.id } })
        }
        onChoose={() => router.navigate('/(tabs)/train')}
      />

      <Card style={styles.tip}>
        <View style={styles.tipIcon}>
          <Icon name="lightbulb-on-outline" size={22} color={theme.colors.warning} />
        </View>
        <View style={styles.flex}>
          <Text variant="overline" tone="muted">
            {tr.home.tip}
          </Text>
          <Text variant="bodyStrong">{pick(tipForDate(today))}</Text>
        </View>
      </Card>
    </Screen>
  );
}

const useStyles = makeStyles((t) => ({
  header: { flexDirection: 'row', alignItems: 'center', gap: t.space.md, marginTop: t.space.sm },
  flex: { flex: 1, gap: t.space.xxs },
  streak: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: t.space.xs,
    paddingHorizontal: t.space.md,
    paddingVertical: t.space.xs,
    borderRadius: t.radius.full,
    backgroundColor: t.colors.surface,
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  row: { flexDirection: 'row', gap: t.space.md },
  tip: { flexDirection: 'row', gap: t.space.md, alignItems: 'center' },
  tipIcon: {
    width: 44,
    height: 44,
    borderRadius: t.radius.md,
    backgroundColor: t.colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
}));
