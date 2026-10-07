import * as Haptics from 'expo-haptics';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EXERCISES } from '@/data/exercises';
import { programById, workoutForSession, type Program } from '@/data/programs';
import { useI18n } from '@/i18n';
import { activityKcal } from '@/logic/activity';
import { localDateString } from '@/logic/dates';
import { buildWorkoutSteps, stepSeconds, type WorkoutStep } from '@/logic/workoutSteps';
import { useActivityStore } from '@/store/activityStore';
import { useProfileStore } from '@/store/profileStore';
import { nextSessionIndex, useProgramStore } from '@/store/programStore';
import { useSettingsStore } from '@/store/settingsStore';
import { makeStyles, useTheme } from '@/theme/ThemeProvider';
import { Button } from '@/ui/Button';
import { Icon } from '@/ui/Icon';
import { IconButton } from '@/ui/IconButton';
import { ProgressBar } from '@/ui/ProgressBar';
import { ProgressRing } from '@/ui/ProgressRing';
import { Text } from '@/ui/Text';
import { Screen } from '@/ui/Screen';
import { useToast } from '@/ui/Toast';
import { confirm } from '@/ui/misc';

const TICK_MS = 200;
const KEEP_AWAKE_TAG = 'workout';

/** Keeps the screen on during a workout. Best effort: browsers may refuse. */
function useScreenAwake(): void {
  useEffect(() => {
    activateKeepAwakeAsync(KEEP_AWAKE_TAG).catch(() => undefined);
    return () => {
      deactivateKeepAwake(KEEP_AWAKE_TAG).catch(() => undefined);
    };
  }, []);
}

export default function WorkoutScreen() {
  const router = useRouter();
  const { programId, session } = useLocalSearchParams<{ programId: string; session?: string }>();
  const program = programById(programId ?? '');
  const completions = useProgramStore((state) => state.completions);

  if (!program) return <Screen onBack={() => router.back()} />;

  const requested = session !== undefined ? Number.parseInt(session, 10) : Number.NaN;
  const sessionIndex = Number.isFinite(requested)
    ? requested
    : nextSessionIndex(completions, program.id) ?? 0;

  return <Player program={program} sessionIndex={sessionIndex} />;
}

function Player({ program, sessionIndex }: { program: Program; sessionIndex: number }) {
  useScreenAwake();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const styles = useStyles();
  const toast = useToast();
  const { tr, f, pick } = useI18n();
  const profile = useProfileStore((state) => state.profile);
  const addActivity = useActivityStore((state) => state.add);
  const completeSession = useProgramStore((state) => state.complete);
  const setActiveProgram = useSettingsStore((state) => state.setActiveProgram);
  const activeProgramId = useSettingsStore((state) => state.activeProgramId);

  const workout = workoutForSession(program, sessionIndex);
  const steps = useMemo(() => buildWorkoutSteps(workout), [workout]);

  const [index, setIndex] = useState(0);
  const [remaining, setRemaining] = useState<number | null>(steps[0] ? stepSeconds(steps[0]) : null);
  const [paused, setPaused] = useState(false);
  const [finished, setFinished] = useState(false);
  const [saving, setSaving] = useState(false);

  const startedAt = useRef(Date.now());
  const pausedTotal = useRef(0);
  const pausedSince = useRef<number | null>(null);
  const endsAt = useRef<number | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);

  const step: WorkoutStep | undefined = steps[index];

  const goTo = useCallback(
    (next: number) => {
      if (next >= steps.length) {
        setElapsedMs(Date.now() - startedAt.current - pausedTotal.current);
        setFinished(true);
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        return;
      }
      const target = steps[Math.max(0, next)];
      if (!target) return;
      setIndex(Math.max(0, next));
      const seconds = stepSeconds(target);
      setRemaining(seconds);
      endsAt.current = seconds !== null ? Date.now() + seconds * 1000 : null;
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    },
    [steps],
  );

  // Start the first step's clock.
  useEffect(() => {
    const first = steps[0];
    const seconds = first ? stepSeconds(first) : null;
    endsAt.current = seconds !== null ? Date.now() + seconds * 1000 : null;
  }, [steps]);

  // The countdown is computed from an end time, so it stays right even when the
  // JS thread stalls or the phone sleeps for a moment.
  useEffect(() => {
    if (finished || paused || remaining === null) return undefined;
    const timer = setInterval(() => {
      if (endsAt.current === null) return;
      const left = (endsAt.current - Date.now()) / 1000;
      if (left <= 0) {
        goTo(index + 1);
      } else {
        setRemaining(left);
      }
    }, TICK_MS);
    return () => clearInterval(timer);
  }, [finished, paused, remaining === null, index, goTo]);

  const togglePause = () => {
    if (paused) {
      if (pausedSince.current !== null) pausedTotal.current += Date.now() - pausedSince.current;
      pausedSince.current = null;
      if (remaining !== null) endsAt.current = Date.now() + remaining * 1000;
      setPaused(false);
    } else {
      pausedSince.current = Date.now();
      setPaused(true);
    }
  };

  const quit = async () => {
    const ok = await confirm({
      title: tr.workout.quitTitle,
      message: tr.workout.quitBody,
      confirmLabel: tr.workout.quit,
      cancelLabel: tr.common.cancel,
      destructive: true,
    });
    if (ok) router.back();
  };

  const minutes = Math.max(1, Math.round(elapsedMs / 60_000));
  const kcal = activityKcal(program.met, minutes, 'moderate', profile?.weightKg ?? 55);

  const save = async () => {
    setSaving(true);
    try {
      const activity = await addActivity({
        localDate: localDateString(),
        loggedAt: new Date().toISOString(),
        type: 'training',
        durationMin: minutes,
        intensity: 'moderate',
        kcal,
        source: 'workout',
        programId: program.id,
      });
      await completeSession(program.id, sessionIndex, activity.id);
      if (activeProgramId !== program.id) await setActiveProgram(program.id);
      toast.show({ message: tr.toast.workoutSaved, tone: 'success' });
      router.back();
    } catch {
      setSaving(false);
      toast.show({ message: tr.common.errorGeneric, tone: 'error' });
    }
  };

  const background = (
    <LinearGradient colors={theme.gradients[program.gradient]} style={StyleSheet.absoluteFill} />
  );

  if (finished) {
    return (
      <View style={[styles.root, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 16 }]}>
        {background}
        <View style={styles.center}>
          <View style={styles.trophy}>
            <Icon name="trophy" size={56} color={theme.colors.onMedia} />
          </View>
          <Text variant="title" tone="onMedia" align="center">
            {tr.workout.finished}
          </Text>
          <Text variant="heading" tone="onMediaMuted" align="center">
            {pick(workout.name)}
          </Text>
          <Text variant="subheading" tone="onMedia" align="center">
            {f(tr.workout.summary, { minutes, kcal })}
          </Text>
        </View>
        <View style={styles.footer}>
          <Button label={tr.workout.save} icon="check" variant="onMedia" loading={saving} onPress={() => void save()} />
          <Button label={tr.common.close} variant="ghostOnMedia" onPress={() => router.back()} />
        </View>
      </View>
    );
  }

  if (!step) return null;

  const block = step.kind === 'rest' ? step.next : step.block;
  const exercise = EXERCISES[block.exercise];
  const total = stepSeconds(step);
  const upcoming = steps.slice(index + 1).find((candidate) => candidate.kind === 'work');
  const upcomingName =
    upcoming && upcoming.kind === 'work' ? pick(EXERCISES[upcoming.block.exercise].name) : null;

  const heading =
    step.kind === 'ready'
      ? tr.workout.getReady
      : step.kind === 'rest'
        ? tr.workout.rest
        : f(tr.workout.set, { n: step.set, total: step.block.sets });

  return (
    <View style={[styles.root, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 16 }]}>
      {background}

      <View style={styles.top}>
        <IconButton icon="close" label={tr.workout.quit} variant="onMedia" onPress={() => void quit()} />
        <View style={styles.topProgress}>
          <ProgressBar progress={(index + 1) / steps.length} color={theme.colors.onMedia} height={6} />
        </View>
        <Text variant="label" tone="onMedia">
          {index + 1}/{steps.length}
        </Text>
      </View>

      <View style={styles.center}>
        <Text variant="overline" tone="onMediaMuted">
          {heading}
        </Text>
        <Text variant="title" tone="onMedia" align="center">
          {step.kind === 'rest' ? f(tr.workout.next, { name: pick(exercise.name) }) : pick(exercise.name)}
        </Text>

        <ProgressRing
          size={230}
          stroke={14}
          progress={total !== null && remaining !== null ? 1 - remaining / total : 1}
          color={theme.colors.onMedia}
          trackColor="rgba(255, 255, 255, 0.22)"
        >
          {remaining !== null ? (
            <Text variant="display" tone="onMedia" style={styles.bigNumber}>
              {Math.ceil(remaining)}
            </Text>
          ) : (
            <>
              <Text variant="display" tone="onMedia" style={styles.bigNumber}>
                {block.reps ?? 0}
              </Text>
              <Text variant="label" tone="onMediaMuted">
                {tr.workout.repsUnit}
              </Text>
            </>
          )}
          {block.perSide && step.kind === 'work' ? (
            <Text variant="caption" tone="onMediaMuted">
              {tr.workout.perSide}
            </Text>
          ) : null}
        </ProgressRing>

        <View style={styles.cue}>
          <Icon name={exercise.icon} size={22} color={theme.colors.onMedia} />
          <Text tone="onMedia" style={styles.cueText}>
            {pick(exercise.cue)}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        {upcomingName && step.kind !== 'rest' ? (
          <Text variant="label" tone="onMediaMuted" align="center">
            {f(tr.workout.next, { name: upcomingName })}
          </Text>
        ) : null}
        <View style={styles.controls}>
          <IconButton
            icon="skip-previous"
            label={tr.common.back}
            variant="onMedia"
            size={56}
            disabled={index === 0}
            onPress={() => goTo(index - 1)}
          />
          {remaining === null ? (
            <Button label={tr.workout.done} icon="check" variant="onMedia" onPress={() => goTo(index + 1)} style={styles.main} />
          ) : (
            <Button
              label={paused ? tr.workout.resume : tr.workout.pause}
              icon={paused ? 'play' : 'pause'}
              variant="onMedia"
              onPress={togglePause}
              style={styles.main}
            />
          )}
          <IconButton icon="skip-next" label={tr.workout.skip} variant="onMedia" size={56} onPress={() => goTo(index + 1)} />
        </View>
      </View>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  root: { flex: 1, paddingHorizontal: t.layout.gutter },
  top: { flexDirection: 'row', alignItems: 'center', gap: t.space.md },
  topProgress: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: t.space.lg },
  bigNumber: { fontSize: 72, lineHeight: 80 },
  cue: {
    flexDirection: 'row',
    gap: t.space.md,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    borderRadius: t.radius.lg,
    padding: t.space.base,
  },
  cueText: { flex: 1 },
  footer: { gap: t.space.md },
  controls: { flexDirection: 'row', alignItems: 'center', gap: t.space.md },
  main: { flex: 1 },
  trophy: {
    width: 112,
    height: 112,
    borderRadius: t.radius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
}));
