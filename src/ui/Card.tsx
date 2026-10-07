import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';

import type { GradientName } from '@/theme/palette';
import { makeStyles, useTheme } from '@/theme/ThemeProvider';

interface CardProps {
  children: ReactNode;
  padded?: boolean;
  /** Fills the card with a two-stop gradient instead of the surface colour. */
  gradient?: GradientName;
  onPress?: () => void;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

export function Card({ children, padded = true, gradient, onPress, accessibilityLabel, style }: CardProps) {
  const theme = useTheme();
  const styles = useStyles();

  const body = gradient ? (
    <LinearGradient
      colors={theme.gradients[gradient]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.base, padded && styles.padded, style]}
    >
      {children}
    </LinearGradient>
  ) : (
    <View style={[styles.base, styles.surface, padded && styles.padded, style]}>{children}</View>
  );

  if (!onPress) return body;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => pressed && styles.pressed}
    >
      {body}
    </Pressable>
  );
}

const useStyles = makeStyles((t) => ({
  base: { borderRadius: t.radius.lg, overflow: 'hidden' },
  surface: {
    backgroundColor: t.colors.surface,
    borderWidth: t.dark ? 1 : 0,
    borderColor: t.colors.border,
    ...t.shadow,
    overflow: 'visible',
  },
  padded: { padding: t.space.base },
  pressed: { opacity: 0.88, transform: [{ scale: 0.99 }] },
}));
