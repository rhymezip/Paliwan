import { View } from 'react-native';

import { useI18n } from '@/i18n';
import { macroTargets } from '@/logic/macros';
import { makeStyles, useTheme } from '@/theme/ThemeProvider';
import type { Profile } from '@/types';
import { Card } from '@/ui/Card';
import { Icon } from '@/ui/Icon';
import { Text } from '@/ui/Text';

/** Energy, macros, water and steps for a profile, with the guidance note. */
export function TargetSummary({ profile }: { profile: Profile }) {
  const theme = useTheme();
  const styles = useStyles();
  const { tr, f } = useI18n();
  const macros = macroTargets(profile.targetCalories, profile.weightKg);
  const perKg = (grams: number) => f(tr.onboarding.targets.perKg, { value: (grams / profile.weightKg).toFixed(1) });

  const macroRows = [
    { label: tr.onboarding.targets.protein, grams: macros.proteinG, color: theme.colors.protein },
    { label: tr.onboarding.targets.carbs, grams: macros.carbsG, color: theme.colors.carbs },
    { label: tr.onboarding.targets.fat, grams: macros.fatG, color: theme.colors.fat },
  ];

  return (
    <View style={styles.root}>
      <Card gradient="hero" style={styles.hero}>
        <Text variant="overline" tone="onMediaMuted">
          {tr.onboarding.targets.energy}
        </Text>
        <Text variant="display" tone="onMedia">
          {profile.targetCalories}
        </Text>
        <Text variant="label" tone="onMediaMuted">
          {tr.common.kcal}
        </Text>
      </Card>

      <Card style={styles.macros}>
        {macroRows.map((row) => (
          <View key={row.label} style={styles.macroRow}>
            <View style={[styles.dot, { backgroundColor: row.color }]} />
            <Text variant="bodyStrong" style={styles.flex}>
              {row.label}
            </Text>
            <Text variant="caption" tone="muted">
              {perKg(row.grams)}
            </Text>
            <Text variant="subheading" style={styles.grams}>
              {row.grams} {tr.common.g}
            </Text>
          </View>
        ))}
      </Card>

      <View style={styles.tiles}>
        <Card style={styles.tile}>
          <Icon name="cup-water" size={24} color={theme.colors.water} />
          <Text variant="number">{profile.waterGoalMl}</Text>
          <Text variant="caption" tone="muted">
            {tr.onboarding.targets.water}, {tr.common.ml}
          </Text>
        </Card>
        <Card style={styles.tile}>
          <Icon name="shoe-print" size={24} color={theme.colors.steps} />
          <Text variant="number">{profile.stepGoal.toLocaleString('en-US').replace(/,/g, ' ')}</Text>
          <Text variant="caption" tone="muted">
            {tr.onboarding.targets.steps}
          </Text>
        </Card>
      </View>

      <Text variant="caption" tone="faint">
        {tr.common.disclaimer}
      </Text>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  root: { gap: t.space.md },
  hero: { alignItems: 'center', gap: t.space.xxs, paddingVertical: t.space.xl },
  macros: { gap: t.space.md },
  macroRow: { flexDirection: 'row', alignItems: 'center', gap: t.space.sm },
  dot: { width: 10, height: 10, borderRadius: 5 },
  flex: { flex: 1 },
  grams: { minWidth: 64, textAlign: 'right' },
  tiles: { flexDirection: 'row', gap: t.space.md },
  tile: { flex: 1, gap: t.space.xs },
}));
