import { clearApiKey } from '@/api/keyStore';
import { resetDatabase } from '@/db';
import { deleteAllPhotos } from '@/media/photos';
import { applyWaterReminders } from '@/services/notifications';
import { useActivityStore } from '@/store/activityStore';
import { useCaptureStore } from '@/store/captureStore';
import { useDayStore } from '@/store/dayStore';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useProfileStore } from '@/store/profileStore';
import { useProgramStore } from '@/store/programStore';
import { DEFAULT_REMINDERS, useSettingsStore } from '@/store/settingsStore';
import { useWaterStore } from '@/store/waterStore';

/**
 * "Delete all data": every table, every meal photo, the API key and the
 * scheduled reminders. Irreversible. The stores go back to first-launch state.
 */
export async function wipeEverything(): Promise<void> {
  const { language } = useSettingsStore.getState();
  await applyWaterReminders(DEFAULT_REMINDERS, language).catch(() => undefined);
  await resetDatabase();
  deleteAllPhotos();
  await clearApiKey().catch(() => undefined);

  useProfileStore.getState().clear();
  useSettingsStore.getState().reset();
  useOnboardingStore.getState().reset();
  useCaptureStore.getState().clear();
  useWaterStore.setState({ logs: [], totalMl: 0 });
  useActivityStore.setState({ week: [], recent: [], streak: 0 });
  useProgramStore.setState({ completions: [] });
  useDayStore.setState({ meals: [], loggedDates: [], target: null, pendingUndo: null });
}
