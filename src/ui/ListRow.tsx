import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import type { IconName } from '@/data/icons';
import { useI18n } from '@/i18n';
import { makeStyles, useTheme } from '@/theme/ThemeProvider';
import { Icon } from '@/ui/Icon';
import { IconButton } from '@/ui/IconButton';
import { Text } from '@/ui/Text';

interface ListRowProps {
  title: string;
  subtitle?: string;
  icon?: IconName;
  /** Tint for the icon bubble. */
  accent?: string;
  /** Right side: a value string or any node. */
  right?: ReactNode;
  onPress?: () => void;
  /** Shows a trailing delete button. */
  onDelete?: () => void;
  chevron?: boolean;
}

export function ListRow({ title, subtitle, icon, accent, right, onPress, onDelete, chevron = false }: ListRowProps) {
  const theme = useTheme();
  const styles = useStyles();
  const { tr } = useI18n();
  const tint = accent ?? theme.colors.primary;

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      {icon ? (
        <View style={[styles.bubble, { backgroundColor: `${tint}22` }]}>
          <Icon name={icon} size={20} color={tint} />
        </View>
      ) : null}
      <View style={styles.text}>
        <Text variant="bodyStrong" numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="caption" tone="muted" numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {typeof right === 'string' ? (
        <Text variant="label" tone="muted">
          {right}
        </Text>
      ) : (
        right
      )}
      {onDelete ? (
        <IconButton icon="close" label={tr.common.delete} onPress={onDelete} variant="plain" size={34} />
      ) : null}
      {chevron ? <Icon name="chevron-right" size={20} color={theme.colors.textFaint} /> : null}
    </Pressable>
  );
}

const useStyles = makeStyles((t) => ({
  row: {
    minHeight: 60,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.space.md,
    paddingVertical: t.space.sm,
  },
  pressed: { opacity: 0.7 },
  bubble: {
    width: 40,
    height: 40,
    borderRadius: t.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { flex: 1, gap: t.space.xxs },
}));
