import { Image, View } from 'react-native';

import { useI18n } from '@/i18n';
import { timeOfDay } from '@/logic/dates';
import { macrosOfItems } from '@/logic/scaling';
import { makeStyles, useTheme } from '@/theme/ThemeProvider';
import type { MealWithItems } from '@/types';
import { Icon } from '@/ui/Icon';
import { IconButton } from '@/ui/IconButton';
import { Text } from '@/ui/Text';

export function MealRow({ meal, onDelete }: { meal: MealWithItems; onDelete: () => void }) {
  const theme = useTheme();
  const styles = useStyles();
  const { tr } = useI18n();
  const totals = macrosOfItems(meal.items);

  return (
    <View style={styles.row}>
      {meal.photoUri ? (
        <Image source={{ uri: meal.photoUri }} style={styles.thumb} />
      ) : (
        <View style={[styles.thumb, styles.placeholder]}>
          <Icon
            name={meal.source === 'library' ? 'format-list-bulleted' : 'silverware-fork-knife'}
            size={20}
            color={theme.colors.food}
          />
        </View>
      )}
      <View style={styles.text}>
        <Text variant="bodyStrong" numberOfLines={1}>
          {meal.name}
        </Text>
        <Text variant="caption" tone="muted" numberOfLines={1}>
          {tr.mealType[meal.mealType]} · {timeOfDay(meal.loggedAt)} · P {Math.round(totals.proteinG)} · C{' '}
          {Math.round(totals.carbsG)} · F {Math.round(totals.fatG)}
        </Text>
      </View>
      <Text variant="subheading">{Math.round(totals.calories)}</Text>
      <IconButton icon="close" label={tr.common.delete} onPress={onDelete} variant="plain" size={34} />
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  row: { flexDirection: 'row', alignItems: 'center', gap: t.space.md, minHeight: 64, paddingVertical: t.space.sm },
  thumb: { width: 46, height: 46, borderRadius: t.radius.md },
  placeholder: { backgroundColor: t.colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  text: { flex: 1, gap: t.space.xxs },
}));
