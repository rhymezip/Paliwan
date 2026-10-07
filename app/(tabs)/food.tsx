import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { View } from 'react-native';

import { hasApiKey } from '@/api/keyStore';
import { DateStrip } from '@/components/food/DateStrip';
import { MacroBars } from '@/components/food/MacroBars';
import { MealRow } from '@/components/food/MealRow';
import { useI18n } from '@/i18n';
import { isToday } from '@/logic/dates';
import { roundCalories } from '@/logic/scaling';
import { useDayStore } from '@/store/dayStore';
import { makeStyles, useTheme } from '@/theme/ThemeProvider';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { Divider, EmptyState, SectionHeader } from '@/ui/misc';
import { ProgressRing } from '@/ui/ProgressRing';
import { Screen } from '@/ui/Screen';
import { Sheet } from '@/ui/Sheet';
import { Text } from '@/ui/Text';
import { useToast } from '@/ui/Toast';

export default function FoodScreen() {
  const router = useRouter();
  const theme = useTheme();
  const styles = useStyles();
  const toast = useToast();
  const { tr, longDate } = useI18n();
  const {
    selectedDate,
    meals,
    target,
    consumed,
    loggedDates,
    selectDate,
    removeMeal,
    undoRemove,
    commitRemove,
  } = useDayStore();
  const [noKeyOpen, setNoKeyOpen] = useState(false);

  useFocusEffect(
    useCallback(() => {
      void useDayStore.getState().refresh().catch(() => undefined);
    }, []),
  );

  const targetKcal = target?.targetCalories ?? 0;
  const eaten = roundCalories(consumed.calories);
  const remaining = targetKcal - eaten;
  const over = remaining < 0;

  const takePhoto = async () => {
    const present = await hasApiKey().catch(() => false);
    if (present) router.push('/capture');
    else setNoKeyOpen(true);
  };

  const onDelete = async (mealId: string) => {
    try {
      await removeMeal(mealId);
      toast.show({
        message: tr.food.removed,
        actionLabel: tr.common.undo,
        onAction: () => void undoRemove().catch(() => undefined),
        onExpire: commitRemove,
        durationMs: 5_000,
      });
    } catch {
      toast.show({ message: tr.common.errorGeneric, tone: 'error' });
    }
  };

  return (
    <Screen tabBarSpace title={tr.food.title} subtitle={isToday(selectedDate) ? tr.common.today : longDate(selectedDate)}>
      <DateStrip
        selectedDate={selectedDate}
        loggedDates={loggedDates}
        onSelect={(date) => void selectDate(date).catch(() => undefined)}
      />

      <Card style={styles.hero}>
        <ProgressRing size={150} stroke={14} progress={targetKcal > 0 ? eaten / targetKcal : 0} color={over ? theme.colors.warning : theme.colors.food}>
          <Text variant="number" style={styles.ringNumber}>
            {Math.abs(remaining)}
          </Text>
          <Text variant="caption" tone="muted">
            {over ? tr.food.over : tr.food.remaining}
          </Text>
        </ProgressRing>
        <View style={styles.heroStats}>
          <Stat label={tr.food.eaten} value={`${eaten}`} />
          <Stat label={tr.food.target} value={`${targetKcal}`} />
          <Text variant="caption" tone="faint">
            {tr.common.kcal}
          </Text>
        </View>
      </Card>

      {target ? (
        <Card>
          <MacroBars consumed={consumed} target={target} />
        </Card>
      ) : null}

      <View style={styles.actions}>
        <Button label={tr.food.photo} icon="camera-outline" size="sm" style={styles.action} onPress={() => void takePhoto()} />
        <Button label={tr.food.list} icon="format-list-bulleted" size="sm" variant="secondary" style={styles.action} onPress={() => router.push('/food/library')} />
        <Button label={tr.food.manual} icon="pencil-outline" size="sm" variant="secondary" style={styles.action} onPress={() => router.push('/manual')} />
      </View>

      <SectionHeader title={tr.food.meals} />
      <Card padded={false} style={styles.list}>
        {meals.length === 0 ? (
          <EmptyState icon="food-apple-outline" title={tr.food.empty} detail={tr.food.emptyDetail} />
        ) : (
          meals.map((meal, index) => (
            <View key={meal.id}>
              {index > 0 ? <Divider /> : null}
              <MealRow meal={meal} onDelete={() => void onDelete(meal.id)} />
            </View>
          ))
        )}
      </Card>

      <Sheet
        visible={noKeyOpen}
        onClose={() => setNoKeyOpen(false)}
        title={tr.food.noKeyTitle}
        footer={
          <>
            <Button
              label={tr.food.useList}
              icon="format-list-bulleted"
              onPress={() => {
                setNoKeyOpen(false);
                router.push('/food/library');
              }}
            />
            <Button
              label={tr.food.addKey}
              variant="secondary"
              onPress={() => {
                setNoKeyOpen(false);
                router.navigate('/(tabs)/profile');
              }}
            />
          </>
        }
      >
        <Text tone="muted">{tr.food.noKeyBody}</Text>
      </Sheet>
    </Screen>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View>
      <Text variant="caption" tone="muted">
        {label}
      </Text>
      <Text variant="number">{value}</Text>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  hero: { flexDirection: 'row', alignItems: 'center', gap: t.space.xl },
  ringNumber: { fontSize: 28, lineHeight: 32 },
  heroStats: { flex: 1, gap: t.space.md },
  actions: { flexDirection: 'row', gap: t.space.sm },
  action: { flex: 1, paddingHorizontal: t.space.sm },
  list: { paddingHorizontal: t.space.base },
}));
