import { Pressable, View } from 'react-native';

import { useI18n } from '@/i18n';
import { isFuture, localDateString, weekOf } from '@/logic/dates';
import { makeStyles } from '@/theme/ThemeProvider';
import { Text } from '@/ui/Text';

interface DateStripProps {
  selectedDate: string;
  loggedDates: readonly string[];
  onSelect: (localDate: string) => void;
}

/** The current week, Monday first. Dots mark days with meals; future days are disabled. */
export function DateStrip({ selectedDate, loggedDates, onSelect }: DateStripProps) {
  const styles = useStyles();
  const { weekdayShort } = useI18n();
  const today = localDateString();
  const logged = new Set(loggedDates);

  return (
    <View style={styles.row}>
      {weekOf(today).map((date) => {
        const selected = date === selectedDate;
        const future = isFuture(date);
        return (
          <Pressable
            key={date}
            disabled={future}
            onPress={() => onSelect(date)}
            accessibilityRole="button"
            accessibilityState={{ selected, disabled: future }}
            style={[styles.day, selected && styles.selected, future && styles.future]}
          >
            <Text variant="caption" tone={selected ? 'onPrimary' : 'muted'}>
              {weekdayShort(date)}
            </Text>
            <Text variant="subheading" tone={selected ? 'onPrimary' : 'default'}>
              {Number(date.slice(8))}
            </Text>
            <View style={[styles.dot, logged.has(date) && (selected ? styles.dotSelected : styles.dotOn)]} />
          </Pressable>
        );
      })}
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  row: { flexDirection: 'row', gap: t.space.xs },
  day: {
    flex: 1,
    alignItems: 'center',
    gap: t.space.xxs,
    paddingVertical: t.space.sm,
    borderRadius: t.radius.md,
  },
  selected: { backgroundColor: t.colors.primary },
  future: { opacity: 0.35 },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: 'transparent' },
  dotOn: { backgroundColor: t.colors.primary },
  dotSelected: { backgroundColor: t.colors.onPrimary },
}));
