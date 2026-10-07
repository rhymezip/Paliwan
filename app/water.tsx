import * as Haptics from 'expo-haptics';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { Pressable, View } from 'react-native';

import { ReminderSettings } from '@/components/ReminderSettings';
import { useI18n } from '@/i18n';
import { localDateString, timeOfDay } from '@/logic/dates';
import { WATER_PORTIONS_ML, todayWaterGoalMl } from '@/logic/water';
import { activitiesOn, totalsFor, useActivityStore } from '@/store/activityStore';
import { useProfileStore } from '@/store/profileStore';
import { useWaterStore } from '@/store/waterStore';
import { makeStyles, useTheme } from '@/theme/ThemeProvider';
import { Card } from '@/ui/Card';
import { Icon } from '@/ui/Icon';
import { ListRow } from '@/ui/ListRow';
import { ProgressRing } from '@/ui/ProgressRing';
import { Screen } from '@/ui/Screen';
import { Text } from '@/ui/Text';
import { useToast } from '@/ui/Toast';
import { EmptyState, SectionHeader } from '@/ui/misc';
import { closeScreen } from '@/ui/navigation';

export default function WaterScreen() {
  const router = useRouter();
  const theme = useTheme();
  const styles = useStyles();
  const toast = useToast();
  const { tr, f } = useI18n();
  const profile = useProfileStore((state) => state.profile);
  const { logs, totalMl, add, remove } = useWaterStore();
  const week = useActivityStore((state) => state.week);

  useFocusEffect(
    useCallback(() => {
      void useWaterStore.getState().load().catch(() => undefined);
      // Today's training raises the goal, so the activities must be current too.
      void useActivityStore.getState().load().catch(() => undefined);
    }, []),
  );

  const trained = useMemo(() => totalsFor(activitiesOn(week, localDateString())).minutes, [week]);
  const goal = profile ? todayWaterGoalMl(profile.waterGoalMl, trained) : 2000;
  const left = Math.max(0, goal - totalMl);

  const addAmount = async (ml: number) => {
    try {
      await add(ml);
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      toast.show({ message: tr.common.errorGeneric, tone: 'error' });
    }
  };

  const removeLog = async (id: string) => {
    try {
      await remove(id);
    } catch {
      toast.show({ message: tr.common.errorGeneric, tone: 'error' });
    }
  };

  return (
    <Screen onBack={() => closeScreen(router)} title={tr.water.title}>
      <Card style={styles.hero}>
        <ProgressRing size={210} stroke={18} progress={totalMl / goal} color={theme.colors.water}>
          <Icon name="water" size={30} color={theme.colors.water} />
          <Text variant="display">{totalMl}</Text>
          <Text variant="label" tone="muted">
            {f(tr.water.goal, { ml: goal })}
          </Text>
        </ProgressRing>
        <Text variant="subheading" color={left === 0 ? theme.colors.success : theme.colors.text}>
          {left === 0 ? tr.water.reached : f(tr.water.left, { ml: left })}
        </Text>
      </Card>

      <View style={styles.portions}>
        {WATER_PORTIONS_ML.map((ml) => (
          <Pressable
            key={ml}
            onPress={() => void addAmount(ml)}
            accessibilityRole="button"
            accessibilityLabel={`+${ml} ${tr.common.ml}`}
            style={({ pressed }) => [styles.portion, pressed && styles.pressed]}
          >
            <Icon name={ml >= 330 ? 'bottle-soda-classic-outline' : 'cup-water'} size={26} color={theme.colors.water} />
            <Text variant="label">+{ml}</Text>
          </Pressable>
        ))}
      </View>

      <ReminderSettings />

      <SectionHeader title={tr.water.log} />
      <Card padded={false} style={styles.list}>
        {logs.length === 0 ? (
          <EmptyState icon="cup-water" title={tr.water.empty} />
        ) : (
          logs.map((log) => (
            <ListRow
              key={log.id}
              icon="water"
              accent={theme.colors.water}
              title={`${log.amountMl} ${tr.common.ml}`}
              subtitle={timeOfDay(log.loggedAt)}
              onDelete={() => void removeLog(log.id)}
            />
          ))
        )}
      </Card>
    </Screen>
  );
}

const useStyles = makeStyles((t) => ({
  hero: { alignItems: 'center', gap: t.space.md, paddingVertical: t.space.xl },
  portions: { flexDirection: 'row', gap: t.space.sm },
  portion: {
    flex: 1,
    alignItems: 'center',
    gap: t.space.xs,
    paddingVertical: t.space.md,
    borderRadius: t.radius.lg,
    backgroundColor: t.colors.surface,
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  pressed: { opacity: 0.7, transform: [{ scale: 0.97 }] },
  list: { paddingHorizontal: t.space.base },
}));
