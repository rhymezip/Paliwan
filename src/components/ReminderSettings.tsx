import { Switch, View } from 'react-native';

import { useI18n } from '@/i18n';
import { NOTIFICATIONS_SUPPORTED, requestNotificationPermission } from '@/services/notifications';
import { useSettingsStore } from '@/store/settingsStore';
import { makeStyles, useTheme } from '@/theme/ThemeProvider';
import { Card } from '@/ui/Card';
import { Icon } from '@/ui/Icon';
import { Stepper } from '@/ui/Stepper';
import { Text } from '@/ui/Text';
import { useToast } from '@/ui/Toast';

const pad = (hour: number) => `${hour.toString().padStart(2, '0')}:00`;

/** Water reminders on/off plus the from / to / every window. Shared by Water and Profile. */
export function ReminderSettings() {
  const theme = useTheme();
  const styles = useStyles();
  const { tr, f } = useI18n();
  const toast = useToast();
  const reminders = useSettingsStore((state) => state.reminders);
  const setReminders = useSettingsStore((state) => state.setReminders);

  const save = async (next: typeof reminders, announce = false) => {
    try {
      if (next.enabled && !reminders.enabled) {
        const permission = await requestNotificationPermission();
        if (permission !== 'granted') {
          toast.show({ message: tr.profile.notificationsDenied, tone: 'error' });
          return;
        }
      }
      await setReminders(next);
      if (announce) {
        toast.show({ message: next.enabled ? tr.toast.remindersOn : tr.toast.remindersOff, tone: 'success' });
      }
    } catch {
      toast.show({ message: tr.common.errorGeneric, tone: 'error' });
    }
  };

  return (
    <Card style={styles.card}>
      <View style={styles.row}>
        <View style={styles.bubble}>
          <Icon name="bell-ring-outline" size={20} color={theme.colors.water} />
        </View>
        <View style={styles.flex}>
          <Text variant="bodyStrong">{tr.profile.reminders}</Text>
          <Text variant="caption" tone="muted">
            {!NOTIFICATIONS_SUPPORTED
              ? tr.onboarding.permissions.unavailable
              : reminders.enabled
                ? f(tr.water.remindersOn, {
                    h: reminders.everyHours,
                    from: pad(reminders.startHour),
                    to: pad(reminders.endHour),
                  })
                : tr.water.remindersOff}
          </Text>
        </View>
        <Switch
          value={reminders.enabled}
          disabled={!NOTIFICATIONS_SUPPORTED}
          onValueChange={(enabled) => void save({ ...reminders, enabled }, true)}
          trackColor={{ true: theme.colors.primary, false: theme.colors.border }}
          accessibilityLabel={tr.profile.reminders}
        />
      </View>

      {reminders.enabled ? (
        <View style={styles.window}>
          <WindowRow label={tr.profile.from}>
            <Stepper
              value={reminders.startHour}
              min={5}
              max={Math.min(reminders.endHour, 23)}
              step={1}
              format={pad}
              onChange={(startHour) => void save({ ...reminders, startHour })}
            />
          </WindowRow>
          <WindowRow label={tr.profile.to}>
            <Stepper
              value={reminders.endHour}
              min={Math.max(reminders.startHour, 5)}
              max={23}
              step={1}
              format={pad}
              onChange={(endHour) => void save({ ...reminders, endHour })}
            />
          </WindowRow>
          <WindowRow label={tr.profile.every}>
            <Stepper
              value={reminders.everyHours}
              min={1}
              max={4}
              step={1}
              format={(hours) => f(tr.profile.hours, { n: hours })}
              onChange={(everyHours) => void save({ ...reminders, everyHours })}
            />
          </WindowRow>
        </View>
      ) : null}
    </Card>
  );
}

function WindowRow({ label, children }: { label: string; children: React.ReactNode }) {
  const styles = useStyles();
  return (
    <View style={styles.windowRow}>
      <Text variant="label" tone="muted" style={styles.windowLabel}>
        {label}
      </Text>
      <View style={styles.flex}>{children}</View>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  card: { gap: t.space.base },
  row: { flexDirection: 'row', alignItems: 'center', gap: t.space.md },
  flex: { flex: 1, gap: t.space.xxs },
  bubble: {
    width: 40,
    height: 40,
    borderRadius: t.radius.md,
    backgroundColor: t.colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  window: { gap: t.space.sm },
  windowRow: { flexDirection: 'row', alignItems: 'center', gap: t.space.md },
  windowLabel: { width: 64 },
}));
