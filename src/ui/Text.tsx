import { Text as NativeText, type TextProps, type TextStyle } from 'react-native';

import type { Colors } from '@/theme/palette';
import { useTheme } from '@/theme/ThemeProvider';
import type { TypeVariant } from '@/theme/tokens';

export type Tone =
  | 'default'
  | 'muted'
  | 'faint'
  | 'primary'
  | 'onPrimary'
  | 'danger'
  | 'onMedia'
  | 'onMediaMuted';

const TONE: Record<Tone, keyof Colors> = {
  default: 'text',
  muted: 'textMuted',
  faint: 'textFaint',
  primary: 'primary',
  onPrimary: 'onPrimary',
  danger: 'danger',
  onMedia: 'onMedia',
  onMediaMuted: 'onMediaMuted',
};

export interface AppTextProps extends TextProps {
  variant?: TypeVariant;
  tone?: Tone;
  /** Overrides `tone` — for domain colours like steps or water. */
  color?: string;
  align?: TextStyle['textAlign'];
}

/** The only text component. Large accessibility sizes are capped at 1.3× so layouts hold. */
export function Text({ variant = 'body', tone = 'default', color, align, style, ...rest }: AppTextProps) {
  const theme = useTheme();
  return (
    <NativeText
      maxFontSizeMultiplier={1.3}
      {...rest}
      style={[
        theme.type[variant],
        { color: color ?? theme.colors[TONE[tone]] },
        align ? { textAlign: align } : null,
        style,
      ]}
    />
  );
}
