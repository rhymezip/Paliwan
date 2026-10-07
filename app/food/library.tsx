import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';

import { FOODS, type Food } from '@/data/foods';
import { useI18n } from '@/i18n';
import { localDateString, mealTypeForTime } from '@/logic/dates';
import { formatQuantity } from '@/logic/scaling';
import { useDayStore } from '@/store/dayStore';
import { makeStyles, useTheme } from '@/theme/ThemeProvider';
import { MEAL_TYPES, type MealType } from '@/types';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { Field } from '@/ui/Field';
import { ListRow } from '@/ui/ListRow';
import { Divider, EmptyState } from '@/ui/misc';
import { Screen } from '@/ui/Screen';
import { Segmented } from '@/ui/Segmented';
import { Sheet } from '@/ui/Sheet';
import { Stepper } from '@/ui/Stepper';
import { Text } from '@/ui/Text';
import { useToast } from '@/ui/Toast';
import { closeScreen } from '@/ui/navigation';

/** Local and everyday foods with typical portions — works with no internet. */
export default function FoodLibraryScreen() {
  const router = useRouter();
  const theme = useTheme();
  const styles = useStyles();
  const toast = useToast();
  const { tr, f, pick } = useI18n();
  const addMeal = useDayStore((state) => state.addMeal);

  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Food | null>(null);
  const [portions, setPortions] = useState(1);
  const [mealType, setMealType] = useState<MealType>(mealTypeForTime());
  const [saving, setSaving] = useState(false);

  const foods = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return FOODS;
    return FOODS.filter((food) =>
      Object.values(food.name).some((name) => name.toLowerCase().includes(needle)),
    );
  }, [query]);

  const open = (food: Food) => {
    setSelected(food);
    setPortions(1);
  };

  const add = async () => {
    if (!selected) return;
    setSaving(true);
    const name = pick(selected.name);
    try {
      await addMeal({
        loggedAt: new Date().toISOString(),
        localDate: localDateString(),
        mealType,
        name,
        photoUri: null,
        source: 'library',
        confidence: null,
        items: [
          {
            name,
            quantity: portions,
            unit: 'serving',
            calories: selected.kcal * portions,
            proteinG: selected.proteinG * portions,
            carbsG: selected.carbsG * portions,
            fatG: selected.fatG * portions,
            isManualAddition: false,
          },
        ],
      });
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      toast.show({ message: tr.toast.mealSaved, tone: 'success' });
      setSelected(null);
      closeScreen(router);
    } catch {
      toast.show({ message: tr.common.errorGeneric, tone: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen onBack={() => closeScreen(router)} backIcon="close" title={tr.library.title} subtitle={tr.library.approx}>
      <Field value={query} onChangeText={setQuery} placeholder={tr.library.search} autoCorrect={false} />
      <Card padded={false} style={styles.list}>
        {foods.length === 0 ? (
          <EmptyState icon="magnify" title={f(tr.library.empty, { query })} />
        ) : (
          foods.map((food, index) => (
            <View key={food.id}>
              {index > 0 ? <Divider /> : null}
              <ListRow
                icon={food.icon}
                accent={theme.colors.food}
                title={pick(food.name)}
                subtitle={pick(food.portion)}
                right={`${food.kcal} ${tr.common.kcal}`}
                onPress={() => open(food)}
              />
            </View>
          ))
        )}
      </Card>

      <Sheet
        visible={selected !== null}
        onClose={() => setSelected(null)}
        title={selected ? pick(selected.name) : ''}
        footer={<Button label={tr.library.add} icon="plus" loading={saving} onPress={() => void add()} />}
      >
        {selected ? (
          <>
            <Text tone="muted">{pick(selected.portion)}</Text>
            <Text variant="label" tone="muted">
              {tr.library.portions}
            </Text>
            <Stepper value={portions} min={0.5} max={5} step={0.5} format={(value) => `× ${formatQuantity(value)}`} onChange={setPortions} />
            <View style={styles.preview}>
              <Text variant="title">
                {Math.round(selected.kcal * portions)} {tr.common.kcal}
              </Text>
              <Text variant="caption" tone="muted">
                P {Math.round(selected.proteinG * portions)} · C {Math.round(selected.carbsG * portions)} · F{' '}
                {Math.round(selected.fatG * portions)} {tr.common.g}
              </Text>
            </View>
            <Text variant="label" tone="muted">
              {tr.library.meal}
            </Text>
            <Segmented
              value={mealType}
              onChange={setMealType}
              options={MEAL_TYPES.map((type) => ({ value: type, label: tr.mealType[type] }))}
            />
          </>
        ) : null}
      </Sheet>
    </Screen>
  );
}

const useStyles = makeStyles((t) => ({
  list: { paddingHorizontal: t.space.base },
  preview: { alignItems: 'center', gap: t.space.xs, paddingVertical: t.space.sm },
}));
