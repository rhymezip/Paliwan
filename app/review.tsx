import { randomUUID } from 'expo-crypto';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, View } from 'react-native';

import { VisionError, copyForError, estimateMeal } from '@/api/vision';
import { HiddenIngredientSheet, ItemRow, QuantitySheet } from '@/components/food/ItemSheets';
import { matchHiddenIngredient } from '@/data/foods';
import type { NewMeal } from '@/db/queries';
import { useI18n } from '@/i18n';
import { localDateString, mealTypeForTime } from '@/logic/dates';
import { formatGrams, macrosOfItems, roundCalories } from '@/logic/scaling';
import { deletePhoto } from '@/media/photos';
import { useCaptureStore } from '@/store/captureStore';
import { useDayStore } from '@/store/dayStore';
import { camera } from '@/theme/palette';
import { makeStyles, useTheme } from '@/theme/ThemeProvider';
import { MEAL_TYPES, type Confidence, type EstimatedItem, type MealItem, type MealType } from '@/types';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { Field } from '@/ui/Field';
import { Divider, SectionHeader } from '@/ui/misc';
import { Screen } from '@/ui/Screen';
import { Segmented } from '@/ui/Segmented';
import { Text } from '@/ui/Text';
import { useToast } from '@/ui/Toast';
import { closeScreen } from '@/ui/navigation';

type Phase = { kind: 'analyzing' } | { kind: 'error'; error: unknown } | { kind: 'review' };

function toMealItem(estimated: EstimatedItem, manual: boolean): MealItem {
  return {
    id: randomUUID(),
    mealId: '',
    name: estimated.name,
    quantity: estimated.quantity,
    unit: estimated.unit,
    calories: estimated.calories,
    proteinG: estimated.proteinG,
    carbsG: estimated.carbsG,
    fatG: estimated.fatG,
    isManualAddition: manual,
    sortOrder: 0,
  };
}

export default function ReviewScreen() {
  const router = useRouter();
  const theme = useTheme();
  const styles = useStyles();
  const toast = useToast();
  const { tr, f, lang } = useI18n();

  const { photoUri, base64, estimate, clear } = useCaptureStore();
  const addMeal = useDayStore((state) => state.addMeal);

  const [phase, setPhase] = useState<Phase>(estimate ? { kind: 'review' } : { kind: 'analyzing' });
  const [mealName, setMealName] = useState(estimate?.mealName ?? '');
  const [weightG, setWeightG] = useState<number | null>(estimate?.estimatedWeightG ?? null);
  const [items, setItems] = useState<MealItem[]>(() =>
    estimate ? estimate.items.map((item) => toMealItem(item, false)) : [],
  );
  const [confidence, setConfidence] = useState<Confidence | null>(estimate?.confidence ?? null);
  const [suggestions, setSuggestions] = useState<string[]>(estimate?.likelyHiddenIngredients ?? []);
  const [mealType, setMealType] = useState<MealType>(mealTypeForTime());
  const [editing, setEditing] = useState<MealItem | null>(null);
  const [hiddenOpen, setHiddenOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const runEstimate = useCallback(async () => {
    if (!base64) {
      setPhase({ kind: 'error', error: new VisionError('malformed', 'No photo.') });
      return;
    }
    const controller = new AbortController();
    abortRef.current = controller;
    setPhase({ kind: 'analyzing' });
    try {
      const result = await estimateMeal(base64, lang, controller.signal);
      setMealName(result.mealName);
      setWeightG(result.estimatedWeightG);
      setItems(result.items.map((item) => toMealItem(item, false)));
      setConfidence(result.confidence);
      setSuggestions(result.likelyHiddenIngredients);
      setPhase({ kind: 'review' });
    } catch (error) {
      if (!(error instanceof VisionError && error.kind === 'cancelled')) {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
      // A malformed estimate is not worth stranding the user on — straight to
      // manual entry with the photo attached.
      if (!(error instanceof VisionError) || error.kind === 'malformed') {
        router.replace('/manual');
        return;
      }
      setPhase({ kind: 'error', error });
    }
  }, [base64, lang, router]);

  useEffect(() => {
    if (!estimate) void runEstimate();
    return () => abortRef.current?.abort();
    // Only on mount — the estimate is a snapshot handed over from capture.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totals = macrosOfItems(items);

  const discard = () => {
    abortRef.current?.abort();
    deletePhoto(photoUri);
    clear();
    closeScreen(router);
  };

  const addSuggestion = (suggestion: string) => {
    const match = matchHiddenIngredient(suggestion);
    if (!match) {
      // An unknown name would land as a 0 kcal item; let the user pick the real one.
      setHiddenOpen(true);
      return;
    }
    setItems((current) => [
      ...current,
      toMealItem(
        {
          name: suggestion,
          quantity: match.quantity,
          unit: match.unit,
          calories: match.kcal,
          proteinG: match.proteinG,
          carbsG: match.carbsG,
          fatG: match.fatG,
        },
        true,
      ),
    ]);
    setSuggestions((current) => current.filter((value) => value !== suggestion));
  };

  const save = async () => {
    if (items.length === 0) return;
    setSaving(true);
    const meal: NewMeal = {
      loggedAt: new Date().toISOString(),
      localDate: localDateString(),
      mealType,
      name: mealName.trim() || tr.review.mealName,
      photoUri,
      source: 'photo',
      confidence,
      items: items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        calories: item.calories,
        proteinG: item.proteinG,
        carbsG: item.carbsG,
        fatG: item.fatG,
        isManualAddition: item.isManualAddition,
      })),
    };
    try {
      await addMeal(meal);
      clear();
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      toast.show({ message: tr.toast.mealSaved, tone: 'success' });
      router.dismissTo('/(tabs)/food');
    } catch {
      setSaving(false);
      toast.show({ message: tr.common.errorGeneric, tone: 'error' });
    }
  };

  if (phase.kind === 'analyzing') {
    return (
      <View style={styles.analyzingRoot}>
        {photoUri ? <Image source={{ uri: photoUri }} style={StyleSheet.absoluteFill} resizeMode="cover" /> : null}
        <View style={styles.analyzing}>
          <ActivityIndicator color={theme.colors.onMedia} size="large" />
          <Text variant="subheading" tone="onMedia">
            {tr.review.analyzing}
          </Text>
          <Button label={tr.common.cancel} variant="onMedia" block={false} onPress={discard} />
        </View>
      </View>
    );
  }

  if (phase.kind === 'error') {
    const copy = copyForError(tr, phase.error);
    return (
      <Screen onBack={discard} backIcon="close">
        {photoUri ? <Image source={{ uri: photoUri }} style={styles.errorPhoto} /> : null}
        <Text variant="title">{copy.title}</Text>
        <Text tone="muted">{copy.detail}</Text>
        {copy.action === 'retry' ? <Button label={tr.common.tryAgain} onPress={() => void runEstimate()} /> : null}
        {copy.action === 'settings' ? (
          <Button
            label={tr.food.addKey}
            onPress={() => {
              discard();
              router.navigate('/(tabs)/profile');
            }}
          />
        ) : null}
        <Button label={tr.review.enterByHand} variant="secondary" onPress={() => router.replace('/manual')} />
        <Button label={tr.review.discard} variant="ghost" onPress={discard} />
      </Screen>
    );
  }

  return (
    <Screen
      onBack={discard}
      backIcon="close"
      footer={
        <Button
          label={tr.review.save}
          icon="check"
          onPress={() => void save()}
          disabled={items.length === 0}
          loading={saving}
        />
      }
    >
      {photoUri ? <Image source={{ uri: photoUri }} style={styles.thumb} /> : null}
      <Field label={tr.review.mealName} value={mealName} onChangeText={setMealName} />

      <Card style={styles.totals}>
        <View>
          <Text variant="overline" tone="muted">
            {tr.review.total}
          </Text>
          <Text variant="display">{roundCalories(totals.calories)}</Text>
        </View>
        <View style={styles.totalsMeta}>
          {weightG ? (
            <Text variant="caption" tone="muted">
              {f(tr.review.plate, { g: Math.round(weightG) })}
            </Text>
          ) : null}
          <Text variant="label" tone="muted">
            P {formatGrams(totals.proteinG)} · C {formatGrams(totals.carbsG)} · F {formatGrams(totals.fatG)}
          </Text>
        </View>
      </Card>

      {confidence === 'low' ? (
        <Card style={styles.nudge}>
          <Text variant="caption" color={theme.colors.warning}>
            {tr.review.lowConfidence}
          </Text>
        </Card>
      ) : null}

      <SectionHeader title={tr.review.items} />
      <Card padded={false} style={styles.list}>
        {items.length === 0 ? (
          <Text tone="muted" style={styles.emptyItems}>
            {tr.review.noItems}
          </Text>
        ) : (
          items.map((item, index) => (
            <View key={item.id}>
              {index > 0 ? <Divider /> : null}
              <ItemRow
                item={item}
                onPress={() => setEditing(item)}
                onRemove={() => setItems((current) => current.filter((candidate) => candidate.id !== item.id))}
              />
            </View>
          ))
        )}
      </Card>

      {suggestions.length > 0 ? (
        <View style={styles.suggestions}>
          <SectionHeader title={tr.review.mightBe} />
          <View style={styles.chips}>
            {suggestions.map((suggestion) => (
              <Pressable
                key={suggestion}
                onPress={() => addSuggestion(suggestion)}
                accessibilityRole="button"
                style={({ pressed }) => [styles.chip, pressed && styles.pressed]}
              >
                <Text variant="label">+ {suggestion}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}

      <Button label={tr.review.addHidden} icon="plus" variant="secondary" onPress={() => setHiddenOpen(true)} />

      <SectionHeader title={tr.manual.meal} />
      <Segmented
        value={mealType}
        onChange={setMealType}
        options={MEAL_TYPES.map((type) => ({ value: type, label: tr.mealType[type] }))}
      />

      <QuantitySheet
        item={editing}
        onClose={() => setEditing(null)}
        onApply={(next) => setItems((current) => current.map((item) => (item.id === next.id ? next : item)))}
      />
      <HiddenIngredientSheet
        visible={hiddenOpen}
        onClose={() => setHiddenOpen(false)}
        onAdd={(item) => setItems((current) => [...current, toMealItem(item, true)])}
      />
    </Screen>
  );
}

const useStyles = makeStyles((t) => ({
  analyzingRoot: { flex: 1, backgroundColor: camera.backdrop },
  analyzing: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.space.base,
    backgroundColor: camera.overlayScrim,
  },
  errorPhoto: { width: '100%', height: 200, borderRadius: t.radius.lg },
  thumb: { width: '100%', height: 190, borderRadius: t.radius.lg },
  totals: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  totalsMeta: { alignItems: 'flex-end', gap: t.space.xs, flexShrink: 1 },
  nudge: { backgroundColor: t.colors.surfaceAlt },
  list: { paddingHorizontal: t.space.base },
  emptyItems: { padding: t.space.base, textAlign: 'center' },
  suggestions: { gap: t.space.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: t.space.sm },
  chip: {
    paddingHorizontal: t.space.md,
    paddingVertical: t.space.sm,
    borderRadius: t.radius.full,
    backgroundColor: t.colors.surface,
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  pressed: { opacity: 0.7 },
}));
