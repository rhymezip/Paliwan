import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useI18n } from '@/i18n';
import { makeStyles } from '@/theme/ThemeProvider';
import { IconButton } from '@/ui/IconButton';
import { Text } from '@/ui/Text';

interface ScreenProps {
  children?: ReactNode;
  /** Scrolls by default; pass false for full-bleed layouts. */
  scroll?: boolean;
  title?: string;
  subtitle?: string;
  /** Shows a back (or close) button in the header row. */
  onBack?: () => void;
  backIcon?: 'arrow-left' | 'close';
  /** Right side of the header row. */
  right?: ReactNode;
  /** Pinned to the bottom, above the safe area. */
  footer?: ReactNode;
  /** Leaves room for the tab bar and its raised button. */
  tabBarSpace?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
}

export function Screen({
  children,
  scroll = true,
  title,
  subtitle,
  onBack,
  backIcon = 'arrow-left',
  right,
  footer,
  tabBarSpace = false,
  contentStyle,
}: ScreenProps) {
  const insets = useSafeAreaInsets();
  const styles = useStyles();
  const { tr } = useI18n();

  const header =
    onBack || right || title ? (
      <View style={styles.header}>
        {onBack || right ? (
          <View style={styles.headerRow}>
            {onBack ? (
              <IconButton icon={backIcon} label={tr.common.back} onPress={onBack} />
            ) : (
              <View />
            )}
            {right ?? null}
          </View>
        ) : null}
        {title ? (
          <View style={styles.titles}>
            <Text variant="title">{title}</Text>
            {subtitle ? <Text tone="muted">{subtitle}</Text> : null}
          </View>
        ) : null}
      </View>
    ) : null;

  const bottomPad = tabBarSpace ? 120 : footer ? 16 : insets.bottom + 24;

  const body = scroll ? (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={[styles.content, { paddingBottom: bottomPad }, contentStyle]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {header}
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.flex, styles.content, { paddingBottom: bottomPad }, contentStyle]}>
      {header}
      {children}
    </View>
  );

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {body}
        {footer ? (
          <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>{footer}</View>
        ) : null}
      </KeyboardAvoidingView>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  root: { flex: 1, backgroundColor: t.colors.background },
  flex: { flex: 1 },
  content: { paddingHorizontal: t.layout.gutter, paddingTop: t.space.sm, gap: t.space.base },
  header: { gap: t.space.base, marginBottom: t.space.xs },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  titles: { gap: t.space.xs },
  footer: {
    paddingHorizontal: t.layout.gutter,
    paddingTop: t.space.md,
    gap: t.space.sm,
    backgroundColor: t.colors.background,
  },
}));
