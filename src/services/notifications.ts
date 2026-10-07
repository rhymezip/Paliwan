import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { translatorFor, type Language } from '@/i18n';
import { reminderTimes } from '@/logic/reminders';

/**
 * Water reminders as local, daily-repeating notifications. No server and no
 * push token: everything is scheduled on the device, so it works in Expo Go and
 * offline. Web has no local notifications; every call is a no-op there.
 */

export const NOTIFICATIONS_SUPPORTED = Platform.OS !== 'web';

const WATER_PREFIX = 'water-';
const ANDROID_CHANNEL = 'reminders';

export type NotificationPermission = 'granted' | 'denied' | 'undetermined' | 'unavailable';

export interface ReminderSettings {
  enabled: boolean;
  startHour: number;
  endHour: number;
  everyHours: number;
}

let configured = false;

/** Shows reminders as banners while the app is open. Call once at startup. */
export function configureNotifications(): void {
  if (!NOTIFICATIONS_SUPPORTED || configured) return;
  configured = true;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export async function notificationPermission(): Promise<NotificationPermission> {
  if (!NOTIFICATIONS_SUPPORTED) return 'unavailable';
  try {
    const status = await Notifications.getPermissionsAsync();
    if (status.granted) return 'granted';
    return status.canAskAgain ? 'undetermined' : 'denied';
  } catch {
    return 'unavailable';
  }
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!NOTIFICATIONS_SUPPORTED) return 'unavailable';
  try {
    const status = await Notifications.requestPermissionsAsync();
    return status.granted ? 'granted' : 'denied';
  } catch {
    return 'unavailable';
  }
}

async function cancelWaterReminders(): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter((request) => request.identifier.startsWith(WATER_PREFIX))
      .map((request) => Notifications.cancelScheduledNotificationAsync(request.identifier)),
  );
}

/**
 * Makes the scheduled reminders match the settings, in the given language.
 * Safe to call repeatedly: it always clears the old set first.
 */
export async function applyWaterReminders(
  settings: ReminderSettings,
  language: Language,
): Promise<void> {
  if (!NOTIFICATIONS_SUPPORTED) return;
  await cancelWaterReminders();
  if (!settings.enabled) return;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL, {
      name: 'Reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const { tr } = translatorFor(language);
  for (const time of reminderTimes(settings.startHour, settings.endHour, settings.everyHours)) {
    await Notifications.scheduleNotificationAsync({
      identifier: `${WATER_PREFIX}${time.hour}-${time.minute}`,
      content: {
        title: tr.water.notificationTitle,
        body: tr.water.notificationBody,
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: time.hour,
        minute: time.minute,
        channelId: ANDROID_CHANNEL,
      },
    });
  }
}
