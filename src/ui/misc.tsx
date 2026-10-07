import { Alert, Platform, Pressable, View } from 'react-native';

import type { IconName } from '@/data/icons';
import { makeStyles, useTheme } from '@/theme/ThemeProvider';
import { Button } from '@/ui/Button';
import { Icon } from '@/ui/Icon';
import { Text } from '@/ui/Text';

/** An overline section title with an optional text action. */
export function SectionHeader({
  title,
  actionLabel,
  onAction,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  const styles = useStyles();
  return (
    <View style={styles.section}>
      <Text variant="overline" tone="muted" style={styles.sectionTitle}>
        {title}
      </Text>
      {actionLabel && onAction ? (
        <Pressable onPress={onAction} accessibilityRole="button" hitSlop={8}>
          <Text variant="label" tone="primary">
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function EmptyState({
  icon,
  title,
  detail,
  actionLabel,
  onAction,
}: {
  icon: IconName;
  title: string;
  detail?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  const theme = useTheme();
  const styles = useStyles();
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <Icon name={icon} size={28} color={theme.colors.primary} />
      </View>
      <Text variant="subheading" align="center">
        {title}
      </Text>
      {detail ? (
        <Text tone="muted" align="center">
          {detail}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <Button label={actionLabel} onPress={onAction} size="sm" variant="secondary" />
      ) : null}
    </View>
  );
}

export function Avatar({ name, size = 44 }: { name: string; size?: number }) {
  const styles = useStyles();
  const initial = name.trim().charAt(0).toUpperCase() || '?';
  return (
    <View style={[styles.avatar, { width: size, height: size }]}>
      <Text variant="subheading" tone="primary" style={{ fontSize: size * 0.42, lineHeight: size * 0.52 }}>
        {initial}
      </Text>
    </View>
  );
}

export function Divider() {
  const styles = useStyles();
  return <View style={styles.divider} />;
}

/** A yes/no question. Alert on phones; `window.confirm` in the web preview. */
export function confirm(options: {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  destructive?: boolean;
}): Promise<boolean> {
  if (Platform.OS === 'web') {
    return Promise.resolve(globalThis.confirm?.(`${options.title}\n\n${options.message}`) ?? false);
  }
  return new Promise((resolve) => {
    Alert.alert(options.title, options.message, [
      { text: options.cancelLabel, style: 'cancel', onPress: () => resolve(false) },
      {
        text: options.confirmLabel,
        style: options.destructive ? 'destructive' : 'default',
        onPress: () => resolve(true),
      },
    ]);
  });
}

const useStyles = makeStyles((t) => ({
  section: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: t.space.sm,
  },
  sectionTitle: { marginLeft: t.space.xxs },
  empty: { alignItems: 'center', gap: t.space.sm, paddingVertical: t.space.lg },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: t.radius.full,
    backgroundColor: t.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: t.space.xs,
  },
  avatar: {
    borderRadius: t.radius.full,
    backgroundColor: t.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: { height: 1, backgroundColor: t.colors.border },
}));
