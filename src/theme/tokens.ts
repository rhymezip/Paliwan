import type { TextStyle } from 'react-native';

/** Spacing scale. Nothing off-scale. */
export const space = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radius = {
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28,
  full: 999,
} as const;

export const layout = {
  gutter: 20,
  minTouch: 44,
  tabBarHeight: 64,
  /** The raised centre button. */
  fabSize: 58,
} as const;

/** Manrope covers Latin (with Turkmen letters) and Cyrillic. */
export const font = {
  regular: 'Manrope_400Regular',
  medium: 'Manrope_500Medium',
  semibold: 'Manrope_600SemiBold',
  bold: 'Manrope_700Bold',
  extrabold: 'Manrope_800ExtraBold',
} as const;

const tabular: TextStyle = { fontVariant: ['tabular-nums'] };

export const type = {
  /** Hero numbers. */
  display: { fontFamily: font.extrabold, fontSize: 44, lineHeight: 50, letterSpacing: -1.2, ...tabular },
  title: { fontFamily: font.extrabold, fontSize: 28, lineHeight: 34, letterSpacing: -0.6 },
  heading: { fontFamily: font.bold, fontSize: 20, lineHeight: 26, letterSpacing: -0.3 },
  subheading: { fontFamily: font.bold, fontSize: 16, lineHeight: 22 },
  body: { fontFamily: font.medium, fontSize: 15, lineHeight: 22 },
  bodyStrong: { fontFamily: font.semibold, fontSize: 15, lineHeight: 22 },
  label: { fontFamily: font.semibold, fontSize: 13, lineHeight: 18 },
  caption: { fontFamily: font.medium, fontSize: 12, lineHeight: 16 },
  overline: {
    fontFamily: font.bold,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.9,
    textTransform: 'uppercase',
  },
  number: { fontFamily: font.extrabold, fontSize: 22, lineHeight: 28, letterSpacing: -0.4, ...tabular },
  button: { fontFamily: font.bold, fontSize: 16, lineHeight: 20 },
} satisfies Record<string, TextStyle>;

export type TypeVariant = keyof typeof type;

export const duration = {
  quick: 180,
  medium: 280,
  slow: 600,
} as const;
