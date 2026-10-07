import { forwardRef, useState } from 'react';
import { TextInput, View, type TextInputProps } from 'react-native';

import { makeStyles, useTheme } from '@/theme/ThemeProvider';
import { Text } from '@/ui/Text';

interface FieldProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  suffix?: string;
  error?: string;
  hint?: string;
  /** Large tabular digits for number entry. */
  numeric?: boolean;
}

export const Field = forwardRef<TextInput, FieldProps>(function Field(
  { label, suffix, error, hint, numeric = false, onFocus, onBlur, ...input },
  ref,
) {
  const theme = useTheme();
  const styles = useStyles();
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.root}>
      {label ? (
        <Text variant="label" tone="muted">
          {label}
        </Text>
      ) : null}
      <View style={[styles.box, focused && styles.focused, error ? styles.errored : null]}>
        <TextInput
          ref={ref}
          placeholderTextColor={theme.colors.textFaint}
          selectionColor={theme.colors.primary}
          keyboardAppearance={theme.dark ? 'dark' : 'light'}
          accessibilityLabel={label}
          maxFontSizeMultiplier={1.3}
          {...input}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          style={[styles.input, numeric && styles.numeric]}
        />
        {suffix ? (
          <Text variant="label" tone="muted">
            {suffix}
          </Text>
        ) : null}
      </View>
      {error ? (
        <Text variant="caption" tone="danger">
          {error}
        </Text>
      ) : hint ? (
        <Text variant="caption" tone="faint">
          {hint}
        </Text>
      ) : null}
    </View>
  );
});

const useStyles = makeStyles((t) => ({
  root: { gap: t.space.xs },
  box: {
    minHeight: 54,
    borderRadius: t.radius.md,
    backgroundColor: t.colors.surfaceAlt,
    borderWidth: 1.5,
    borderColor: 'transparent',
    paddingHorizontal: t.space.base,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.space.sm,
  },
  focused: { borderColor: t.colors.primary },
  errored: { borderColor: t.colors.danger },
  input: {
    flex: 1,
    minWidth: 0,
    minHeight: 50,
    color: t.colors.text,
    fontFamily: t.font.semibold,
    fontSize: 17,
    // The box border shows focus; drop the browser's own ring in the web preview.
    outlineWidth: 0,
  },
  numeric: { fontFamily: t.font.bold, fontSize: 20, fontVariant: ['tabular-nums'] },
}));
