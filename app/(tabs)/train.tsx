import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { View } from 'react-native';

import { activityType } from '@/data/activityTypes';
import {
  PROGRAMS,
  SESSIONS_PER_PROGRAM,
  programById,
  workoutForSession,
  type Program,
} from '@/data/programs';
import { sportById } from '@/data/sports';
import { useI18n } from '@/i18n';
import { localDateString, timeOfDay } from '@/logic/dates';
import { totalsFor, useActivityStore } from '@/store/activityStore';
import { useProfileStore } from '@/store/profileStore';
import { completedSessions, nextSessionIndex, useProgramStore } from '@/store/programStore';
import { useSettingsStore } from '@/store/settingsStore';
import { makeStyles, useTheme } from '@/theme/ThemeProvider';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { Icon } from '@/ui/Icon';
import { ListRow } from '@/ui/ListRow';
import { ProgressBar } from '@/ui/ProgressBar';
import { Screen } from '@/ui/Screen';
import { Text } from '@/ui/Text';
import { useToast } from '@/ui/Toast';
import { EmptyState, SectionHeader } from '@/ui/misc';

export default function TrainScreen() {
  const router = useRouter();
  const theme = useTheme();
  const styles = useStyles();
  const toast = useToast();
  const { tr, f, pick, longDate } = useI18n();
  const profile = useProfileStore((state) => state.profile);
  const activeProgramId = useSettingsStore((state) => state.activeProgramId);
  const { week, recent, remove } = useActivityStore();
  const completions = useProgramStore((state) => state.completions);

  useFocusEffect(
    useCallback(() => {
      void useActivityStore.getState().load().catch(() => undefined);
      void useProgramStore.getState().load().catch(() => undefined);
    }, []),
  );

  const weekTotals = useMemo(() => totalsFor(week), [week]);
  const active = activeProgramId ? programById(activeProgramId) : undefined;
  const sport = profile ? sportById(profile.sport) : undefined;
  const today = localDateString();

  const openProgram = (program: Program) =>
    router.push({ pathname: '/program/[id]', params: { id: program.id } });

  const deleteActivity = async (id: string) => {
    try {
      await remove(id);
    } catch {
      toast.show({ message: tr.common.errorGeneric, tone: 'error' });
    }
  };

  return (
    <Screen tabBarSpace title={tr.train.title}>
      <Card style={styles.week}>
        <Text variant="overline" tone="muted">
          {tr.train.thisWeek}
        </Text>
        <View style={styles.weekRow}>
          <Metric icon="timer-outline" color={theme.colors.activity} value={f(tr.train.minutesShort, { n: Math.round(weekTotals.minutes) })} />
          <Metric icon="fire" color={theme.colors.steps} value={f(tr.train.kcalShort, { n: Math.round(weekTotals.kcal) })} />
          <Metric icon="check-decagram-outline" color={theme.colors.primary} value={`${week.length}`} />
        </View>
      </Card>

      {active ? (
        <ActiveProgramCard
          program={active}
          completions={completions}
          onOpen={() => openProgram(active)}
          onContinue={() =>
            router.push({ pathname: '/workout/[programId]', params: { programId: active.id } })
          }
        />
      ) : null}

      <SectionHeader title={tr.train.programs} />
      {PROGRAMS.map((program) => {
        const done = completedSessions(completions, program.id).size;
        const recommended = sport?.programs.includes(program.id) ?? false;
        return (
          <Card key={program.id} onPress={() => openProgram(program)} style={styles.program}>
            <Card gradient={program.gradient} padded={false} style={styles.programIcon}>
              <Icon name={program.icon} size={26} color={theme.colors.onMedia} />
            </Card>
            <View style={styles.flex}>
              <Text variant="subheading">{pick(program.name)}</Text>
              <Text variant="caption" tone="muted" numberOfLines={2}>
                {pick(program.summary)}
              </Text>
              <View style={styles.badges}>
                {program.id === activeProgramId ? (
                  <Badge label={tr.program.active} color={theme.colors.primary} />
                ) : null}
                {recommended && sport ? (
                  <Badge label={f(tr.train.recommended, { sport: pick(sport.name) })} color={theme.colors.steps} />
                ) : null}
                {done > 0 ? (
                  <Badge label={`${done}/${SESSIONS_PER_PROGRAM}`} color={theme.colors.textMuted} />
                ) : null}
              </View>
            </View>
            <Icon name="chevron-right" size={22} color={theme.colors.textFaint} />
          </Card>
        );
      })}

      <SectionHeader
        title={tr.train.recent}
        actionLabel={tr.train.logActivity}
        onAction={() => router.push('/activity/new')}
      />
      <Card padded={false} style={styles.list}>
        {recent.length === 0 ? (
          <EmptyState
            icon="run"
            title={tr.train.empty}
            actionLabel={tr.train.logActivity}
            onAction={() => router.push('/activity/new')}
          />
        ) : (
          recent.map((activity) => {
            const type = activityType(activity.type);
            const program = activity.programId ? programById(activity.programId) : undefined;
            const when = activity.localDate === today ? tr.common.today : longDate(activity.localDate);
            return (
              <ListRow
                key={activity.id}
                icon={program?.icon ?? type.icon}
                accent={theme.colors.activity}
                title={program ? pick(program.name) : pick(type.name)}
                subtitle={`${when}, ${timeOfDay(activity.loggedAt)} · ${f(tr.train.minutesShort, { n: Math.round(activity.durationMin) })}`}
                right={f(tr.train.kcalShort, { n: Math.round(activity.kcal) })}
                onDelete={() => void deleteActivity(activity.id)}
              />
            );
          })
        )}
      </Card>
    </Screen>
  );
}

function ActiveProgramCard({
  program,
  completions,
  onOpen,
  onContinue,
}: {
  program: Program;
  completions: ReturnType<typeof useProgramStore.getState>['completions'];
  onOpen: () => void;
  onContinue: () => void;
}) {
  const theme = useTheme();
  const styles = useStyles();
  const { tr, f, pick } = useI18n();
  const done = completedSessions(completions, program.id).size;
  const next = nextSessionIndex(completions, program.id);

  return (
    <Card gradient={program.gradient} onPress={onOpen} style={styles.active}>
      <Text variant="overline" tone="onMediaMuted">
        {tr.train.yourProgram}
      </Text>
      <Text variant="heading" tone="onMedia">
        {pick(program.name)}
      </Text>
      <Text variant="label" tone="onMediaMuted">
        {next === null
          ? tr.home.programDone
          : f(tr.train.next, { workout: pick(workoutForSession(program, next).name) })}
      </Text>
      <ProgressBar progress={done / SESSIONS_PER_PROGRAM} color={theme.colors.onMedia} height={6} />
      <Text variant="caption" tone="onMediaMuted">
        {f(tr.train.progress, { done, total: SESSIONS_PER_PROGRAM })}
      </Text>
      {next !== null ? (
        <Button label={tr.train.continue} icon="play" variant="onMedia" onPress={onContinue} />
      ) : null}
    </Card>
  );
}

function Metric({ icon, color, value }: { icon: 'timer-outline' | 'fire' | 'check-decagram-outline'; color: string; value: string }) {
  const styles = useStyles();
  return (
    <View style={styles.metric}>
      <Icon name={icon} size={20} color={color} />
      <Text variant="subheading" numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function Badge({ label, color }: { label: string; color: string }) {
  const styles = useStyles();
  return (
    <View style={[styles.badge, { borderColor: color }]}>
      <Text variant="caption" color={color} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  week: { gap: t.space.md },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between', gap: t.space.sm },
  metric: { flexDirection: 'row', alignItems: 'center', gap: t.space.xs, flexShrink: 1 },
  active: { gap: t.space.sm },
  program: { flexDirection: 'row', alignItems: 'center', gap: t.space.md },
  programIcon: { width: 56, height: 56, alignItems: 'center', justifyContent: 'center', borderRadius: t.radius.md },
  flex: { flex: 1, gap: t.space.xxs },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: t.space.xs, marginTop: t.space.xs },
  badge: {
    borderWidth: 1,
    borderRadius: t.radius.full,
    paddingHorizontal: t.space.sm,
    paddingVertical: t.space.xxs,
  },
  list: { paddingHorizontal: t.space.base },
}));
