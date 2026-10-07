import { View } from 'react-native';

import { useI18n } from '@/i18n';
import { makeStyles, useTheme } from '@/theme/ThemeProvider';
import type { DailyTarget, Macros } from '@/types';
import { ProgressBar } from '@/ui/ProgressBar';
import { Text } from '@/ui/Text';

/** Protein, carbs and fat eaten against the day's targets. */
export function MacroBars({ consumed, target }: { consumed: Macros; target: DailyTarget }) {
  const theme = useTheme();
  const styles = useStyles();
  const { tr } = useI18n();

  const rows = [
    { label: tr.food.protein, eaten: consumed.proteinG, goal: target.proteinG, color: theme.colors.protein },
    { label: tr.food.carbs, eaten: consumed.carbsG, goal: target.carbsG, color: theme.colors.carbs },
    { label: tr.food.fat, eaten: consumed.fatG, goal: target.fatG, color: theme.colors.fat },
  ];

  return (
    <View style={styles.row}>
      {rows.map((row) => (
        <View key={row.label} style={styles.macro}>
          <Text variant="caption" tone="muted">
            {row.label}
          </Text>
          <ProgressBar progress={row.goal > 0 ? row.eaten / row.goal : 0} color={row.color} height={6} />
          <Text variant="label">
            {Math.round(row.eaten)}
            <Text variant="caption" tone="faint">
              {' '}/ {Math.round(row.goal)} {tr.common.g}
            </Text>
          </Text>
        </View>
      ))}
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  row: { flexDirection: 'row', gap: t.space.md },
  macro: { flex: 1, gap: t.space.xs },
}));
