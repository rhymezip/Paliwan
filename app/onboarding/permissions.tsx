import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { StepShell } from '@/components/onboarding/StepShell';
import { useDraftProfile } from '@/components/onboarding/useDraftProfile';
import type { IconName } from '@/data/icons';
import { useI18n } from '@/i18n';
import { requestNotificationPermission, notificationPermission } from '@/services/notifications';
import { requestStepPermission, stepPermission } from '@/services/pedometer';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useProfileStore } from '@/store/profileStore';
import { DEFAULT_REMINDERS, useSettingsStore } from '@/store/settingsStore';
import { useStepStore } from '@/store/stepStore';
import { makeStyles, useTheme } from '@/theme/ThemeProvider';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { Icon } from '@/ui/Icon';
import { Text } from '@/ui/Text';
import { useToast } from '@/ui/Toast';

type Status = 'granted' | 'denied' | 'undetermined' | 'unavailable' | 'checking';

export default function PermissionsStep() {
  const router = useRouter();
  const { tr } = useI18n();
  const toast = useToast();
  const profile = useDraftProfile();
  const saveProfile = useProfileStore((state) => state.save);
  const resetDraft = useOnboardingStore((state) => state.reset);
  const setReminders = useSettingsStore((state) => state.setReminders);
  const refreshSteps = useStepStore((state) => state.refresh);

  const [steps, setSteps] = useState<Status>('checking');
  const [water, setWater] = useState<Status>('checking');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void stepPermission().then(setSteps);
    void notificationPermission().then(setWater);
  }, []);

  const allowSteps = async () => {
    const result = await requestStepPermission();
    setSteps(result);
    if (result === 'granted') void refreshSteps();
  };

  const allowWater = async () => {
    const result = await requestNotificationPermission();
    setWater(result);
    if (result !== 'granted') return;
    try {
      await setReminders({ ...DEFAULT_REMINDERS, enabled: true });
    } catch {
      toast.show({ message: tr.common.errorGeneric, tone: 'error' });
    }
  };

  const finish = async () => {
    if (!profile) {
      router.replace('/onboarding/name');
      return;
    }
    setSaving(true);
    try {
      await saveProfile(profile);
      resetDraft();
      router.replace('/(tabs)');
    } catch {
      setSaving(false);
      toast.show({ message: tr.common.errorGeneric, tone: 'error' });
    }
  };

  return (
    <StepShell
      step="permissions"
      title={tr.onboarding.permissions.title}
      detail={tr.onboarding.permissions.detail}
      primaryLabel={tr.onboarding.permissions.finish}
      primaryLoading={saving}
      onPrimary={() => void finish()}
    >
      <PermissionCard
        icon="shoe-print"
        title={tr.onboarding.permissions.stepsTitle}
        detail={tr.onboarding.permissions.stepsDetail}
        status={steps}
        onAllow={() => void allowSteps()}
        accent="steps"
      />
      <PermissionCard
        icon="bell-ring-outline"
        title={tr.onboarding.permissions.waterTitle}
        detail={tr.onboarding.permissions.waterDetail}
        status={water}
        onAllow={() => void allowWater()}
        accent="water"
      />
    </StepShell>
  );
}

function PermissionCard({
  icon,
  title,
  detail,
  status,
  onAllow,
  accent,
}: {
  icon: IconName;
  title: string;
  detail: string;
  status: Status;
  onAllow: () => void;
  accent: 'steps' | 'water';
}) {
  const theme = useTheme();
  const styles = useStyles();
  const { tr } = useI18n();
  const color = theme.colors[accent];

  return (
    <Card style={styles.card}>
      <View style={styles.top}>
        <View style={[styles.bubble, { backgroundColor: color }]}>
          <Icon name={icon} size={24} color={theme.colors.onMedia} />
        </View>
        <View style={styles.text}>
          <Text variant="subheading">{title}</Text>
          <Text variant="caption" tone="muted">
            {detail}
          </Text>
        </View>
      </View>
      {status === 'granted' ? (
        <View style={styles.status}>
          <Icon name="check-circle" size={20} color={theme.colors.success} />
          <Text variant="label" color={theme.colors.success}>
            {tr.onboarding.permissions.allowed}
          </Text>
        </View>
      ) : status === 'denied' ? (
        <Text variant="caption" tone="danger">
          {tr.onboarding.permissions.denied}
        </Text>
      ) : status === 'unavailable' ? (
        <Text variant="caption" tone="faint">
          {tr.onboarding.permissions.unavailable}
        </Text>
      ) : (
        <Button
          label={tr.onboarding.permissions.allow}
          onPress={onAllow}
          size="sm"
          disabled={status === 'checking'}
        />
      )}
    </Card>
  );
}

const useStyles = makeStyles((t) => ({
  card: { gap: t.space.md },
  top: { flexDirection: 'row', gap: t.space.md, alignItems: 'center' },
  bubble: {
    width: 48,
    height: 48,
    borderRadius: t.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { flex: 1, gap: t.space.xxs },
  status: { flexDirection: 'row', alignItems: 'center', gap: t.space.sm },
}));
