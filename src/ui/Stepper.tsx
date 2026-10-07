import { View } from 'react-native';

import { useI18n } from '@/i18n';
import { makeStyles } from '@/theme/ThemeProvider';
import { IconButton } from '@/ui/IconButton';
import { Text } from '@/ui/Text';

interface StepperProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  /** How the value reads, e.g. `45 min`. */
  format?: (value: number) => string;
}

export function Stepper({ value, onChange, min, max, step, format }: StepperProps) {
  const styles = useStyles();
  const { tr } = useI18n();
  const clamp = (next: number) => Math.min(max, Math.max(min, Math.round(next * 100) / 100));

  return (
    <View style={styles.row} accessibilityRole="adjustable" accessibilityValue={{ text: format?.(value) ?? String(value) }}>
      <IconButton icon="minus" label={tr.common.remove} onPress={() => onChange(clamp(value - step))} disabled={value <= min} />
      <Text variant="number" style={styles.value} numberOfLines={1}>
        {format ? format(value) : value}
      </Text>
      <IconButton icon="plus" label={tr.common.add} onPress={() => onChange(clamp(value + step))} disabled={value >= max} />
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.space.md,
    backgroundColor: t.colors.surfaceAlt,
    borderRadius: t.radius.full,
    padding: t.space.xs,
  },
  value: { flex: 1, textAlign: 'center' },
}));
