import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';

import {
  SESSIONS_PER_WEEK,
  WEEKS,
  programById,
  workoutForSession,
  workoutMinutes,
} from '@/data/programs';
import { useI18n } from '@/i18n';
import { completedSessions, nextSessionIndex, useProgramStore } from '@/store/programStore';
import { useSettingsStore } from '@/store/settingsStore';
import { makeStyles, useTheme } from '@/theme/ThemeProvider';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { Icon } from '@/ui/Icon';
import { Screen } from '@/ui/Screen';
import { Text } from '@/ui/Text';
import { confirm, SectionHeader } from '@/ui/misc';

export default function ProgramScreen() {
  const router = useRouter();
  const theme = useTheme();
  const styles = useStyles();
  const { tr, f, pick } = useI18n();
  const { id } = useLocalSearchParams<{ id: string }>();
  const program = programById(id ?? '');
  const completions = useProgramStore((state) => state.completions);
  const activeProgramId = useSettingsStore((state) => state.activeProgramId);
  const setActiveProgram = useSettingsStore((state) => state.setActiveProgram);

  if (!program) return <Screen onBack={() => router.back()} />;

  const done = completedSessions(completions, program.id);
  const next = nextSessionIndex(completions, program.id);
  const isActive = activeProgramId === program.id;

  const startSession = async (sessionIndex: number) => {
    if (!isActive) {
      if (activeProgramId) {
        const ok = await confirm({
          title: tr.program.switchTitle,
          message: tr.program.switchBody,
          confirmLabel: tr.program.switch,
          cancelLabel: tr.common.cancel,
        });
        if (!ok) return;
      }
      await setActiveProgram(program.id);
    }
    router.push({
      pathname: '/workout/[programId]',
      params: { programId: program.id, session: String(sessionIndex) },
    });
  };

  return (
    <Screen
      onBack={() => router.back()}
      footer={
        next !== null ? (
          <Button
            label={isActive ? f(tr.program.startSession, { n: next + 1 }) : tr.program.start}
            icon="play"
            onPress={() => void startSession(next)}
          />
        ) : undefined
      }
    >
      <Card gradient={program.gradient} style={styles.hero}>
        <View style={styles.heroIcon}>
          <Icon name={program.icon} size={34} color={theme.colors.onMedia} />
        </View>
        <Text variant="title" tone="onMedia">
          {pick(program.name)}
        </Text>
        <Text tone="onMediaMuted">{pick(program.summary)}</Text>
        <View style={styles.heroStats}>
          <Text variant="label" tone="onMedia">
            {WEEKS} × {SESSIONS_PER_WEEK}
          </Text>
          <Text variant="label" tone="onMedia">
            {f(tr.program.duration, { n: workoutMinutes(program.workouts[0]) })}
          </Text>
          {isActive ? (
            <Text variant="label" tone="onMedia">
              ● {tr.program.active}
            </Text>
          ) : null}
        </View>
      </Card>

      {Array.from({ length: WEEKS }, (_, week) => (
        <View key={week} style={styles.week}>
          <SectionHeader title={f(tr.program.week, { n: week + 1 })} />
          <Card padded={false} style={styles.sessions}>
            {Array.from({ length: SESSIONS_PER_WEEK }, (_, slot) => {
              const index = week * SESSIONS_PER_WEEK + slot;
              const workout = workoutForSession(program, index);
              const complete = done.has(index);
              const upcoming = index === next;
              return (
                <Pressable
                  key={index}
                  onPress={() => void startSession(index)}
                  accessibilityRole="button"
                  style={({ pressed }) => [styles.session, pressed && styles.pressed]}
                >
                  <View
                    style={[
                      styles.check,
                      complete && { backgroundColor: theme.colors.success, borderColor: theme.colors.success },
                      upcoming && { borderColor: theme.colors.primary },
                    ]}
                  >
                    {complete ? (
                      <Icon name="check" size={16} color={theme.colors.onPrimary} />
                    ) : (
                      <Text variant="caption" tone={upcoming ? 'primary' : 'muted'}>
                        {index + 1}
                      </Text>
                    )}
                  </View>
                  <View style={styles.flex}>
                    <Text variant="bodyStrong">{pick(workout.name)}</Text>
                    <Text variant="caption" tone="muted">
                      {f(tr.program.exercises, { n: workout.blocks.length })} ·{' '}
                      {f(tr.program.duration, { n: workoutMinutes(workout) })}
                    </Text>
                  </View>
                  {complete ? (
                    <Text variant="caption" color={theme.colors.success}>
                      {tr.program.completed}
                    </Text>
                  ) : (
                    <Icon name="play-circle-outline" size={26} color={upcoming ? theme.colors.primary : theme.colors.textFaint} />
                  )}
                </Pressable>
              );
            })}
          </Card>
        </View>
      ))}
    </Screen>
  );
}

const useStyles = makeStyles((t) => ({
  hero: { gap: t.space.sm, paddingVertical: t.space.xl },
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: t.radius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: t.space.sm,
  },
  heroStats: { flexDirection: 'row', flexWrap: 'wrap', gap: t.space.base, marginTop: t.space.sm },
  week: { gap: t.space.sm },
  sessions: { paddingHorizontal: t.space.base },
  session: { flexDirection: 'row', alignItems: 'center', gap: t.space.md, minHeight: 64 },
  pressed: { opacity: 0.7 },
  check: {
    width: 32,
    height: 32,
    borderRadius: t.radius.full,
    borderWidth: 2,
    borderColor: t.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flex: { flex: 1, gap: t.space.xxs },
}));
