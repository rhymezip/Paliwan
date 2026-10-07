import { Pressable, type StyleProp, type ViewStyle } from 'react-native';

import type { IconName } from '@/data/icons';
import { makeStyles, useTheme } from '@/theme/ThemeProvider';
import { Icon } from '@/ui/Icon';

interface IconButtonProps {
  icon: IconName;
  label: string;
  onPress: () => void;
  variant?: 'surface' | 'plain' | 'primary' | 'onMedia';
  size?: number;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function IconButton({
  icon,
  label,
  onPress,
  variant = 'surface',
  size = 44,
  disabled = false,
  style,
}: IconButtonProps) {
  const theme = useTheme();
  const styles = useStyles();
  const color = {
    surface: theme.colors.text,
    plain: theme.colors.text,
    primary: theme.colors.onPrimary,
    onMedia: theme.colors.onMedia,
  }[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={6}
      style={({ pressed }) => [
        styles.base,
        { width: size, height: size },
        styles[variant],
        disabled && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}
    >
      <Icon name={icon} size={Math.round(size * 0.48)} color={color} />
    </Pressable>
  );
}

const useStyles = makeStyles((t) => ({
  base: { borderRadius: t.radius.full, alignItems: 'center', justifyContent: 'center' },
  surface: { backgroundColor: t.colors.surfaceAlt },
  plain: { backgroundColor: 'transparent' },
  primary: { backgroundColor: t.colors.primary },
  onMedia: { backgroundColor: 'rgba(255, 255, 255, 0.2)' },
  disabled: { opacity: 0.35 },
  pressed: { opacity: 0.7 },
}));
