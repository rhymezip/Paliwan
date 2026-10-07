import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { hasApiKey } from '@/api/keyStore';
import { ApiKeyForm } from '@/components/ApiKeyForm';
import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { StepShell } from '@/components/StepShell';
import { Caption } from '@/components/Type';
import { space } from '@/constants/theme';
import { useOnboardingStore } from '@/store/onboardingStore';
import { brand } from '@/constants/brand';

export default function ApiKeyStep() {
  const router = useRouter();
  const set = useOnboardingStore((state) => state.set);
  const [existingKey, setExistingKey] = useState<boolean | null>(null);

  useEffect(() => {
    void hasApiKey().then(setExistingKey);
  }, []);

  const advance = (skipped: boolean) => {
    set({ skippedKey: skipped });
    router.push('/onboarding/results');
  };

  if (existingKey === null) {
    return <Screen />;
  }

  // Nothing to ask when a key is already present — a `.env` seed, or a keychain
  // entry that survived a reinstall.
  if (existingKey) {
    return (
      <StepShell
        step="api-key"
        title="Your key is already set."
        detail={`${brand.name} found a key in this phone’s keychain. You can replace or remove it in Settings.`}
        primaryLabel="Continue"
        onPrimary={() => advance(false)}
      />
    );
  }

  return (
    <StepShell
      step="api-key"
      title="Gemini açaryňyzy goşuň."
      detail="Suratdaky nahary analiz etmek üçin Google AI Studio açaryňyz göni Gemini-ä ulanylýar. Açar diňe şu enjamda howpsuz saklanýar."
    >
      <ApiKeyForm onSaved={() => advance(false)} saveLabel="Sakla we dowam et" />

      <View style={styles.skip}>
        <Button
          label="Skip for now"
          variant="ghost"
          onPress={() => advance(true)}
        />
        <Caption muted style={styles.skipDetail}>
          Without a key, {brand.name} works as a manual food diary. Add one in Settings
          whenever you want photo estimates.
        </Caption>
      </View>
    </StepShell>
  );
}

const styles = StyleSheet.create({
  skip: { marginTop: space.sm, gap: space.xs },
  skipDetail: { textAlign: 'center', paddingHorizontal: space.base },
});
