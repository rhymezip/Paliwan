import { ActivityIndicator, Pressable, View, type StyleProp, type ViewStyle } from 'react-native';

import type { IconName } from '@/data/icons';
import { makeStyles, useTheme } from '@/theme/ThemeProvider';
import { Icon } from '@/ui/Icon';
import { Text } from '@/ui/Text';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'onMedia' | 'ghostOnMedia';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: 'md' | 'sm';
  icon?: IconName;
  loading?: boolean;
  disabled?: boolean;
  /** Stretch to the container width. Defaults to true for `md`. */
  block?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  disabled = false,
  block,
  style,
}: ButtonProps) {
  const theme = useTheme();
  const styles = useStyles();
  const inactive = disabled || loading;

  const foreground = {
    primary: theme.colors.onPrimary,
    secondary: theme.colors.text,
    ghost: theme.colors.primary,
    danger: theme.colors.danger,
    onMedia: theme.colors.onMedia,
    ghostOnMedia: theme.colors.onMedia,
  }[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: inactive, busy: loading }}
      style={({ pressed }) => [
        styles.base,
        size === 'sm' ? styles.sm : styles.md,
        styles[variant],
        (block ?? size === 'md') && styles.block,
        disabled && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={foreground} />
      ) : (
        <View style={styles.content}>
          {icon ? <Icon name={icon} size={size === 'sm' ? 18 : 20} color={foreground} /> : null}
          <Text variant={size === 'sm' ? 'label' : 'button'} color={foreground} numberOfLines={1}>
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const useStyles = makeStyles((t) => ({
  base: {
    borderRadius: t.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  md: { minHeight: 54, paddingHorizontal: t.space.xl },
  sm: { minHeight: 40, paddingHorizontal: t.space.base },
  block: { alignSelf: 'stretch' },
  primary: { backgroundColor: t.colors.primary },
  secondary: { backgroundColor: t.colors.surfaceAlt },
  ghost: { backgroundColor: 'transparent' },
  danger: { backgroundColor: t.colors.dangerSoft },
  onMedia: { backgroundColor: 'rgba(255, 255, 255, 0.22)' },
  ghostOnMedia: { backgroundColor: 'transparent' },
  disabled: { opacity: 0.4 },
  pressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
  content: { flexDirection: 'row', alignItems: 'center', gap: t.space.sm },
}));
