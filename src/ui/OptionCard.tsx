import { Pressable, View } from 'react-native';

import type { IconName } from '@/data/icons';
import { makeStyles, useTheme } from '@/theme/ThemeProvider';
import { Icon } from '@/ui/Icon';
import { Text } from '@/ui/Text';

interface OptionCardProps {
  title: string;
  detail?: string;
  icon?: IconName;
  /** Tint for the icon bubble; the primary colour by default. */
  accent?: string;
  selected: boolean;
  onPress: () => void;
}

/** A large, selectable row — the onboarding and settings choice. */
export function OptionCard({ title, detail, icon, accent, selected, onPress }: OptionCardProps) {
  const theme = useTheme();
  const styles = useStyles();
  const tint = accent ?? theme.colors.primary;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={detail ? `${title}. ${detail}` : title}
      style={({ pressed }) => [styles.card, selected && styles.selected, pressed && styles.pressed]}
    >
      {icon ? (
        <View style={[styles.bubble, { backgroundColor: selected ? tint : theme.colors.surfaceAlt }]}>
          <Icon name={icon} size={22} color={selected ? theme.colors.onPrimary : tint} />
        </View>
      ) : null}
      <View style={styles.text}>
        <Text variant="subheading">{title}</Text>
        {detail ? (
          <Text variant="caption" tone="muted">
            {detail}
          </Text>
        ) : null}
      </View>
      <View style={[styles.radio, selected && { borderColor: tint, backgroundColor: tint }]}>
        {selected ? <Icon name="check" size={14} color={theme.colors.onPrimary} /> : null}
      </View>
    </Pressable>
  );
}

const useStyles = makeStyles((t) => ({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.space.md,
    padding: t.space.base,
    borderRadius: t.radius.lg,
    backgroundColor: t.colors.surface,
    borderWidth: 1.5,
    borderColor: t.colors.border,
  },
  selected: { borderColor: t.colors.primary, backgroundColor: t.colors.primarySoft },
  pressed: { opacity: 0.85 },
  bubble: {
    width: 42,
    height: 42,
    borderRadius: t.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { flex: 1, gap: t.space.xxs },
  radio: {
    width: 24,
    height: 24,
    borderRadius: t.radius.full,
    borderWidth: 2,
    borderColor: t.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
}));
