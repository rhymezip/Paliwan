import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { StyleSheet, useColorScheme } from 'react-native';

import {
  darkColors,
  darkGradients,
  lightColors,
  lightGradients,
  type Colors,
  type GradientName,
} from '@/theme/palette';
import { duration, font, layout, radius, space, type } from '@/theme/tokens';

export type ThemePreference = 'system' | 'light' | 'dark';

export interface Theme {
  dark: boolean;
  colors: Colors;
  gradients: Record<GradientName, readonly [string, string]>;
  space: typeof space;
  radius: typeof radius;
  layout: typeof layout;
  font: typeof font;
  type: typeof type;
  duration: typeof duration;
  /** The one card shadow. Off in dark mode, where borders do the work. */
  shadow: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
}

const shared = { space, radius, layout, font, type, duration };

const LIGHT: Theme = {
  dark: false,
  colors: lightColors,
  gradients: lightGradients,
  ...shared,
  shadow: {
    shadowColor: '#0F1B15',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.07,
    shadowRadius: 16,
    elevation: 3,
  },
};

const DARK: Theme = {
  dark: true,
  colors: darkColors,
  gradients: darkGradients,
  ...shared,
  shadow: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
};

const ThemeContext = createContext<Theme>(LIGHT);

export function resolveDark(preference: ThemePreference, system: string | null | undefined): boolean {
  return preference === 'dark' || (preference === 'system' && system === 'dark');
}

export function ThemeProvider({
  preference,
  children,
}: {
  preference: ThemePreference;
  children: ReactNode;
}) {
  const system = useColorScheme();
  const dark = resolveDark(preference, system);
  const theme = useMemo(() => (dark ? DARK : LIGHT), [dark]);
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  return useContext(ThemeContext);
}

/**
 * Theme-aware styles. The factory runs once per theme (there are two), so this
 * costs no more than a module-level `StyleSheet.create`.
 *
 *   const useStyles = makeStyles((t) => ({ card: { backgroundColor: t.colors.surface } }));
 *   const styles = useStyles();
 */
export function makeStyles<T extends StyleSheet.NamedStyles<T> | StyleSheet.NamedStyles<any>>(
  factory: (theme: Theme) => T & StyleSheet.NamedStyles<any>,
): () => T {
  const cache = new Map<Theme, T>();
  return function useStyles(): T {
    const theme = useTheme();
    let styles = cache.get(theme);
    if (!styles) {
      styles = StyleSheet.create(factory(theme));
      cache.set(theme, styles);
    }
    return styles;
  };
}
