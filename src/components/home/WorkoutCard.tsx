import { View } from 'react-native';

import {
  SESSIONS_PER_PROGRAM,
  workoutForSession,
  workoutMinutes,
  type Program,
} from '@/data/programs';
import { useI18n } from '@/i18n';
import { makeStyles, useTheme } from '@/theme/ThemeProvider';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { Icon } from '@/ui/Icon';
import { ProgressBar } from '@/ui/ProgressBar';
import { Text } from '@/ui/Text';

interface WorkoutCardProps {
  program: Program | undefined;
  /** The next session, or null when the program is finished. */
  sessionIndex: number | null;
  completedCount: number;
  onStart: () => void;
  onChoose: () => void;
}

/** "Today's workout" — the next session of the active program, or a nudge to pick one. */
export function WorkoutCard({ program, sessionIndex, completedCount, onStart, onChoose }: WorkoutCardProps) {
  const theme = useTheme();
  const styles = useStyles();
  const { tr, f, pick } = useI18n();

  if (!program || sessionIndex === null) {
    return (
      <Card onPress={onChoose} style={styles.empty}>
        <View style={styles.emptyIcon}>
          <Icon name="dumbbell" size={24} color={theme.colors.primary} />
        </View>
        <View style={styles.flex}>
          <Text variant="subheading">{program ? tr.home.programDone : tr.home.choose}</Text>
          <Text variant="caption" tone="muted">
            {tr.home.chooseDetail}
          </Text>
        </View>
        <Icon name="chevron-right" size={22} color={theme.colors.textFaint} />
      </Card>
    );
  }

  const workout = workoutForSession(program, sessionIndex);

  return (
    <Card gradient={program.gradient} style={styles.card}>
      <View style={styles.header}>
        <View style={styles.flex}>
          <Text variant="overline" tone="onMediaMuted">
            {tr.home.workoutTitle}
          </Text>
          <Text variant="heading" tone="onMedia">
            {pick(workout.name)}
          </Text>
          <Text variant="label" tone="onMediaMuted">
            {pick(program.name)} · {f(tr.program.duration, { n: workoutMinutes(workout) })}
          </Text>
        </View>
        <View style={styles.iconWrap}>
          <Icon name={program.icon} size={28} color={theme.colors.onMedia} />
        </View>
      </View>
      <View style={styles.progress}>
        <Text variant="caption" tone="onMediaMuted">
          {f(tr.home.sessionOf, { n: sessionIndex + 1, total: SESSIONS_PER_PROGRAM })}
        </Text>
        <ProgressBar
          progress={completedCount / SESSIONS_PER_PROGRAM}
          color={theme.colors.onMedia}
          height={6}
        />
      </View>
      <Button label={tr.common.start} icon="play" variant="onMedia" onPress={onStart} />
    </Card>
  );
}

const useStyles = makeStyles((t) => ({
  card: { gap: t.space.base },
  header: { flexDirection: 'row', gap: t.space.md },
  flex: { flex: 1, gap: t.space.xxs },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: t.radius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progress: { gap: t.space.xs },
  empty: { flexDirection: 'row', alignItems: 'center', gap: t.space.md },
  emptyIcon: {
    width: 48,
    height: 48,
    borderRadius: t.radius.md,
    backgroundColor: t.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
}));
