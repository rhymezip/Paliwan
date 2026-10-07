import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';

import { HIDDEN_INGREDIENTS } from '@/data/foods';
import { useI18n } from '@/i18n';
import { formatGrams, formatQuantity, roundCalories, scaleItemQuantity } from '@/logic/scaling';
import { makeStyles, useTheme } from '@/theme/ThemeProvider';
import type { EstimatedItem, MealItem } from '@/types';
import { Button } from '@/ui/Button';
import { IconButton } from '@/ui/IconButton';
import { Sheet } from '@/ui/Sheet';
import { Stepper } from '@/ui/Stepper';
import { Text } from '@/ui/Text';

/** One detected item on the review screen. Tap to edit the quantity. */
export function ItemRow({
  item,
  onPress,
  onRemove,
}: {
  item: MealItem;
  onPress: () => void;
  onRemove: () => void;
}) {
  const styles = useStyles();
  const { tr } = useI18n();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={({ pressed }) => [styles.itemRow, pressed && styles.pressed]}>
      <View style={styles.flex}>
        <Text variant="bodyStrong" numberOfLines={1}>
          {item.name}
        </Text>
        <Text variant="caption" tone="muted">
          {formatQuantity(item.quantity)} {tr.measureUnit[item.unit]} · P {formatGrams(item.proteinG)} · C{' '}
          {formatGrams(item.carbsG)} · F {formatGrams(item.fatG)}
        </Text>
      </View>
      <Text variant="subheading">{roundCalories(item.calories)}</Text>
      <IconButton icon="close" label={tr.review.removeItem} onPress={onRemove} variant="plain" size={34} />
    </Pressable>
  );
}

/** Quantity editor for one item. Calories and macros scale live. */
export function QuantitySheet({
  item,
  onClose,
  onApply,
}: {
  item: MealItem | null;
  onClose: () => void;
  onApply: (item: MealItem) => void;
}) {
  const styles = useStyles();
  const { tr } = useI18n();
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (item) setQuantity(item.quantity);
  }, [item]);

  if (!item) return null;
  const step = item.unit === 'g' || item.unit === 'ml' ? 10 : 0.5;
  const preview = scaleItemQuantity(item, quantity);

  return (
    <Sheet
      visible
      onClose={onClose}
      title={item.name}
      footer={
        <Button
          label={tr.review.apply}
          onPress={() => {
            onApply(preview);
            onClose();
          }}
        />
      }
    >
      <Text variant="label" tone="muted">
        {tr.review.quantity}
      </Text>
      <Stepper
        value={quantity}
        min={step}
        max={step === 10 ? 2000 : 20}
        step={step}
        format={(value) => `${formatQuantity(value)} ${tr.measureUnit[item.unit]}`}
        onChange={setQuantity}
      />
      <View style={styles.preview}>
        <Text variant="title">
          {roundCalories(preview.calories)} {tr.common.kcal}
        </Text>
        <Text variant="caption" tone="muted">
          P {formatGrams(preview.proteinG)} · C {formatGrams(preview.carbsG)} · F {formatGrams(preview.fatG)}
        </Text>
      </View>
    </Sheet>
  );
}

/** The calories a camera cannot see — oils, sugar, sauces — in one tap each. */
export function HiddenIngredientSheet({
  visible,
  onClose,
  onAdd,
}: {
  visible: boolean;
  onClose: () => void;
  onAdd: (item: EstimatedItem) => void;
}) {
  const theme = useTheme();
  const styles = useStyles();
  const { tr, pick } = useI18n();

  return (
    <Sheet visible={visible} onClose={onClose} title={tr.review.hiddenTitle}>
      <View style={styles.grid}>
        {HIDDEN_INGREDIENTS.map((ingredient) => (
          <Pressable
            key={ingredient.id}
            onPress={() => {
              onAdd({
                name: pick(ingredient.name),
                quantity: ingredient.quantity,
                unit: ingredient.unit,
                calories: ingredient.kcal,
                proteinG: ingredient.proteinG,
                carbsG: ingredient.carbsG,
                fatG: ingredient.fatG,
              });
              onClose();
            }}
            accessibilityRole="button"
            style={({ pressed }) => [styles.chip, pressed && styles.pressed]}
          >
            <Text variant="label">{pick(ingredient.name)}</Text>
            <Text variant="caption" color={theme.colors.food}>
              {ingredient.quantity} {tr.measureUnit[ingredient.unit]} · {ingredient.kcal} {tr.common.kcal}
            </Text>
          </Pressable>
        ))}
      </View>
    </Sheet>
  );
}

const useStyles = makeStyles((t) => ({
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: t.space.md, minHeight: 60, paddingVertical: t.space.sm },
  flex: { flex: 1, gap: t.space.xxs },
  pressed: { opacity: 0.7 },
  preview: { alignItems: 'center', gap: t.space.xs, paddingVertical: t.space.base },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: t.space.sm },
  chip: {
    width: '48%',
    flexGrow: 1,
    padding: t.space.md,
    borderRadius: t.radius.md,
    backgroundColor: t.colors.surface,
    borderWidth: 1,
    borderColor: t.colors.border,
    gap: t.space.xxs,
  },
}));
