import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { LOGGABLE_ACTIVITY_TYPES, activityType } from '@/data/activityTypes';
import { sportById } from '@/data/sports';
import { useI18n } from '@/i18n';
import { activityKcal } from '@/logic/activity';
import { localDateString } from '@/logic/dates';
import { useActivityStore } from '@/store/activityStore';
import { useProfileStore } from '@/store/profileStore';
import { makeStyles, useTheme } from '@/theme/ThemeProvider';
import type { ActivityTypeId, Intensity } from '@/types';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { Icon } from '@/ui/Icon';
import { Screen } from '@/ui/Screen';
import { Segmented } from '@/ui/Segmented';
import { Stepper } from '@/ui/Stepper';
import { Text } from '@/ui/Text';
import { useToast } from '@/ui/Toast';
import { SectionHeader } from '@/ui/misc';

export default function NewActivityScreen() {
  const router = useRouter();
  const theme = useTheme();
  const styles = useStyles();
  const toast = useToast();
  const { tr, f, pick } = useI18n();
  const profile = useProfileStore((state) => state.profile);
  const add = useActivityStore((state) => state.add);

  const defaultType: ActivityTypeId = profile ? sportById(profile.sport).activity : 'running';
  const [type, setType] = useState<ActivityTypeId>(
    defaultType === 'other' || defaultType === 'training' ? 'running' : defaultType,
  );
  const [minutes, setMinutes] = useState(45);
  const [intensity, setIntensity] = useState<Intensity>('moderate');
  const [saving, setSaving] = useState(false);

  const kcal = activityKcal(activityType(type).met, minutes, intensity, profile?.weightKg ?? 55);

  const save = async () => {
    setSaving(true);
    try {
      await add({
        localDate: localDateString(),
        loggedAt: new Date().toISOString(),
        type,
        durationMin: minutes,
        intensity,
        kcal,
        source: 'manual',
        programId: null,
      });
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      toast.show({ message: tr.toast.activitySaved, tone: 'success' });
      router.back();
    } catch {
      setSaving(false);
      toast.show({ message: tr.common.errorGeneric, tone: 'error' });
    }
  };

  return (
    <Screen
      onBack={() => router.back()}
      backIcon="close"
      title={tr.activity.title}
      footer={<Button label={tr.activity.save} icon="check" loading={saving} onPress={() => void save()} />}
    >
      <SectionHeader title={tr.activity.type} />
      <View style={styles.grid}>
        {LOGGABLE_ACTIVITY_TYPES.map((option) => {
          const selected = option.id === type;
          return (
            <Pressable
              key={option.id}
              onPress={() => setType(option.id)}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              accessibilityLabel={pick(option.name)}
              style={({ pressed }) => [styles.tile, selected && styles.selected, pressed && styles.pressed]}
            >
              <Icon name={option.icon} size={26} color={selected ? theme.colors.activity : theme.colors.textMuted} />
              <Text variant="caption" align="center" numberOfLines={2} tone={selected ? 'default' : 'muted'}>
                {pick(option.name)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <SectionHeader title={tr.activity.duration} />
      <Stepper
        value={minutes}
        min={5}
        max={240}
        step={5}
        format={(value) => f(tr.train.minutesShort, { n: value })}
        onChange={setMinutes}
      />

      <SectionHeader title={tr.activity.intensity} />
      <Segmented
        value={intensity}
        onChange={setIntensity}
        options={[
          { value: 'easy', label: tr.intensity.easy },
          { value: 'moderate', label: tr.intensity.moderate },
          { value: 'hard', label: tr.intensity.hard },
        ]}
      />

      <Card style={styles.estimate}>
        <Icon name="fire" size={28} color={theme.colors.steps} />
        <Text variant="heading">{f(tr.activity.estimate, { kcal })}</Text>
      </Card>
    </Screen>
  );
}

const useStyles = makeStyles((t) => ({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: t.space.sm },
  tile: {
    width: '23%',
    flexGrow: 1,
    minHeight: 82,
    borderRadius: t.radius.md,
    backgroundColor: t.colors.surface,
    borderWidth: 1.5,
    borderColor: t.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.space.xs,
    padding: t.space.xs,
  },
  selected: { borderColor: t.colors.activity },
  pressed: { opacity: 0.8 },
  estimate: { flexDirection: 'row', alignItems: 'center', gap: t.space.md },
}));
