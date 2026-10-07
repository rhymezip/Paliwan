import { Redirect } from 'expo-router';

import { isOnboarded, useProfileStore } from '@/store/profileStore';
import { useSettingsStore } from '@/store/settingsStore';

/** First launch goes to the language picker; a named profile goes to Home. */
export default function Index() {
  const profile = useProfileStore((state) => state.profile);
  const languageChosen = useSettingsStore((state) => state.languageChosen);

  if (isOnboarded(profile)) return <Redirect href="/(tabs)" />;
  return <Redirect href={languageChosen ? '/onboarding/welcome' : '/onboarding/language'} />;
}
