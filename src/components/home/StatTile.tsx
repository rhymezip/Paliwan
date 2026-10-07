import type { ReactNode } from 'react';
import { View } from 'react-native';

import type { IconName } from '@/data/icons';
import { makeStyles, useTheme } from '@/theme/ThemeProvider';
import { Card } from '@/ui/Card';
import { ProgressRing } from '@/ui/ProgressRing';
import { Icon } from '@/ui/Icon';
import { Text } from '@/ui/Text';

interface StatTileProps {
  label: string;
  value: string;
  caption: string;
  icon: IconName;
  color: string;
  /** 0–1 ring progress; omit for no ring. */
  progress?: number;
  onPress?: () => void;
  /** Extra content under the numbers, e.g. a quick-add button. */
  footer?: ReactNode;
}

/** Half-width Home tile: a ring with an icon, a value and a caption. */
export function StatTile({ label, value, caption, icon, color, progress, onPress, footer }: StatTileProps) {
  const theme = useTheme();
  const styles = useStyles();

  return (
    <Card onPress={onPress} accessibilityLabel={label} style={styles.card}>
      <View style={styles.top}>
        {progress !== undefined ? (
          <ProgressRing size={52} stroke={6} progress={progress} color={color}>
            <Icon name={icon} size={20} color={color} />
          </ProgressRing>
        ) : (
          <View style={[styles.bubble, { backgroundColor: theme.colors.surfaceAlt }]}>
            <Icon name={icon} size={22} color={color} />
          </View>
        )}
        <Text variant="overline" tone="muted" style={styles.label} numberOfLines={1}>
          {label}
        </Text>
      </View>
      <View>
        <Text variant="number" numberOfLines={1} adjustsFontSizeToFit>
          {value}
        </Text>
        <Text variant="caption" tone="muted" numberOfLines={1}>
          {caption}
        </Text>
      </View>
      {footer}
    </Card>
  );
}

const useStyles = makeStyles((t) => ({
  card: { flex: 1, gap: t.space.md },
  top: { flexDirection: 'row', alignItems: 'center', gap: t.space.sm },
  label: { flex: 1 },
  bubble: {
    width: 52,
    height: 52,
    borderRadius: t.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
}));
