import { Pressable, View } from 'react-native';

import { makeStyles } from '@/theme/ThemeProvider';
import { Text } from '@/ui/Text';

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentedProps<T extends string> {
  options: readonly SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

export function Segmented<T extends string>({ options, value, onChange }: SegmentedProps<T>) {
  const styles = useStyles();
  return (
    <View style={styles.track} accessibilityRole="tablist">
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            style={[styles.segment, selected && styles.selected]}
          >
            <Text variant="label" tone={selected ? 'default' : 'muted'} numberOfLines={2} align="center">
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  track: {
    flexDirection: 'row',
    backgroundColor: t.colors.surfaceAlt,
    borderRadius: t.radius.md,
    padding: t.space.xs,
    gap: t.space.xs,
  },
  segment: {
    flex: 1,
    minHeight: 38,
    borderRadius: t.radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: t.space.xs,
  },
  selected: { backgroundColor: t.colors.surface, ...t.shadow, shadowOpacity: t.dark ? 0 : 0.08 },
}));
