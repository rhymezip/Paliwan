import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, View } from 'react-native';

import type { NewMeal } from '@/db/queries';
import { useI18n } from '@/i18n';
import { localDateString, mealTypeForTime } from '@/logic/dates';
import { deletePhoto } from '@/media/photos';
import { useCaptureStore } from '@/store/captureStore';
import { useDayStore } from '@/store/dayStore';
import { makeStyles } from '@/theme/ThemeProvider';
import { MEASURE_UNITS, MEAL_TYPES, type MealType, type MeasureUnit } from '@/types';
import { Button } from '@/ui/Button';
import { Field } from '@/ui/Field';
import { SectionHeader } from '@/ui/misc';
import { Screen } from '@/ui/Screen';
import { Segmented } from '@/ui/Segmented';
import { Text } from '@/ui/Text';
import { useToast } from '@/ui/Toast';
import { closeScreen } from '@/ui/navigation';

function parse(value: string): number {
  const parsed = Number.parseFloat(value.replace(',', '.'));
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
}

export default function ManualScreen() {
  const router = useRouter();
  const styles = useStyles();
  const toast = useToast();
  const { tr } = useI18n();

  // A photo is present only when manual entry came from a failed or keyless estimate.
  const { photoUri, clear } = useCaptureStore();
  const addMeal = useDayStore((state) => state.addMeal);

  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState<MeasureUnit>('serving');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [mealType, setMealType] = useState<MealType>(mealTypeForTime());
  const [saving, setSaving] = useState(false);

  const kcal = Number.parseFloat(calories.replace(',', '.'));
  const valid = name.trim().length > 0 && Number.isFinite(kcal) && kcal >= 0;

  const cancel = () => {
    // The photo was only kept for this meal; without it, it is an orphan file.
    deletePhoto(photoUri);
    clear();
    closeScreen(router);
  };

  const save = async () => {
    if (!valid) return;
    setSaving(true);
    const meal: NewMeal = {
      loggedAt: new Date().toISOString(),
      localDate: localDateString(),
      mealType,
      name: name.trim(),
      photoUri,
      source: 'manual',
      confidence: null,
      items: [
        {
          name: name.trim(),
          quantity: parse(quantity) || 1,
          unit,
          calories: parse(calories),
          proteinG: parse(protein),
          carbsG: parse(carbs),
          fatG: parse(fat),
          isManualAddition: false,
        },
      ],
    };
    try {
      await addMeal(meal);
      clear();
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      toast.show({ message: tr.toast.mealSaved, tone: 'success' });
      closeScreen(router);
    } catch {
      setSaving(false);
      toast.show({ message: tr.common.errorGeneric, tone: 'error' });
    }
  };

  return (
    <Screen
      onBack={cancel}
      backIcon="close"
      title={tr.manual.title}
      footer={<Button label={tr.manual.save} icon="check" onPress={() => void save()} disabled={!valid} loading={saving} />}
    >
      {photoUri ? <Image source={{ uri: photoUri }} style={styles.photo} /> : null}

      <Field label={tr.manual.name} value={name} onChangeText={setName} placeholder={tr.manual.namePlaceholder} autoFocus />

      <View style={styles.row}>
        <View style={styles.flex}>
          <Field label={tr.manual.quantity} value={quantity} onChangeText={setQuantity} keyboardType="decimal-pad" numeric />
        </View>
        <View style={styles.flex}>
          <Field
            label={tr.manual.calories}
            value={calories}
            onChangeText={setCalories}
            keyboardType="decimal-pad"
            numeric
            suffix={tr.common.kcal}
          />
        </View>
      </View>

      <SectionHeader title={tr.manual.unit} />
      <View style={styles.units}>
        {MEASURE_UNITS.map((option) => {
          const selected = option === unit;
          return (
            <Pressable
              key={option}
              onPress={() => setUnit(option)}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              style={[styles.unit, selected && styles.unitSelected]}
            >
              <Text variant="label" tone={selected ? 'onPrimary' : 'default'}>
                {tr.measureUnit[option]}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <SectionHeader title={tr.manual.macros} />
      <View style={styles.row}>
        <View style={styles.flex}>
          <Field label={tr.manual.protein} value={protein} onChangeText={setProtein} keyboardType="decimal-pad" numeric />
        </View>
        <View style={styles.flex}>
          <Field label={tr.manual.carbs} value={carbs} onChangeText={setCarbs} keyboardType="decimal-pad" numeric />
        </View>
        <View style={styles.flex}>
          <Field label={tr.manual.fat} value={fat} onChangeText={setFat} keyboardType="decimal-pad" numeric />
        </View>
      </View>

      <SectionHeader title={tr.manual.meal} />
      <Segmented
        value={mealType}
        onChange={setMealType}
        options={MEAL_TYPES.map((type) => ({ value: type, label: tr.mealType[type] }))}
      />
    </Screen>
  );
}

const useStyles = makeStyles((t) => ({
  photo: { width: '100%', height: 170, borderRadius: t.radius.lg },
  row: { flexDirection: 'row', gap: t.space.sm },
  flex: { flex: 1 },
  units: { flexDirection: 'row', flexWrap: 'wrap', gap: t.space.sm },
  unit: {
    paddingHorizontal: t.space.md,
    paddingVertical: t.space.sm,
    borderRadius: t.radius.full,
    backgroundColor: t.colors.surfaceAlt,
  },
  unitSelected: { backgroundColor: t.colors.primary },
}));
