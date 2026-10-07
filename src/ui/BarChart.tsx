import { View } from 'react-native';

import { makeStyles, useTheme } from '@/theme/ThemeProvider';
import { Text } from '@/ui/Text';

export interface Bar {
  label: string;
  value: number;
  highlight?: boolean;
}

interface BarChartProps {
  bars: readonly Bar[];
  color: string;
  /** Draws a dashed goal line. */
  goal?: number;
  height?: number;
}

/** A small weekly bar chart. Bars over the goal stay full-colour. */
export function BarChart({ bars, color, goal, height = 140 }: BarChartProps) {
  const theme = useTheme();
  const styles = useStyles();
  const max = Math.max(goal ?? 0, ...bars.map((bar) => bar.value), 1);

  return (
    <View style={styles.root}>
      <View style={[styles.plot, { height }]}>
        {goal ? (
          <View style={[styles.goal, { bottom: (goal / max) * height, borderColor: theme.colors.textFaint }]} />
        ) : null}
        {bars.map((bar) => (
          <View key={bar.label} style={styles.column}>
            <View
              style={[
                styles.bar,
                {
                  height: Math.max(4, (bar.value / max) * height),
                  backgroundColor: color,
                  opacity: bar.highlight ? 1 : 0.45,
                },
              ]}
            />
          </View>
        ))}
      </View>
      <View style={styles.labels}>
        {bars.map((bar) => (
          <Text
            key={bar.label}
            variant="caption"
            tone={bar.highlight ? 'default' : 'faint'}
            style={styles.label}
            numberOfLines={1}
          >
            {bar.label}
          </Text>
        ))}
      </View>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  root: { gap: t.space.sm },
  plot: { flexDirection: 'row', alignItems: 'flex-end', gap: t.space.sm },
  column: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: '100%' },
  bar: { width: '70%', borderRadius: t.radius.sm },
  goal: { position: 'absolute', left: 0, right: 0, borderTopWidth: 1, borderStyle: 'dashed' },
  labels: { flexDirection: 'row', gap: t.space.sm },
  label: { flex: 1, textAlign: 'center' },
}));
