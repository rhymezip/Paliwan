import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { StepShell } from '@/components/onboarding/StepShell';
import { LANGUAGES, useI18n } from '@/i18n';
import { useSettingsStore } from '@/store/settingsStore';
import { makeStyles } from '@/theme/ThemeProvider';
import { OptionCard } from '@/ui/OptionCard';

/** First screen of all: pick the app language. Copy switches as you tap. */
export default function LanguageStep() {
  const router = useRouter();
  const styles = useStyles();
  const { tr } = useI18n();
  const language = useSettingsStore((state) => state.language);
  const setLanguage = useSettingsStore((state) => state.setLanguage);

  return (
    <StepShell
      step="language"
      showBack={false}
      title={tr.onboarding.language.title}
      detail={tr.onboarding.language.detail}
      primaryLabel={tr.common.continue}
      onPrimary={() => {
        void setLanguage(language);
        router.push('/onboarding/welcome');
      }}
    >
      <View style={styles.list}>
        {LANGUAGES.map((option) => (
          <OptionCard
            key={option.code}
            icon="translate"
            title={option.nativeName}
            detail={option.englishName}
            selected={option.code === language}
            onPress={() => void setLanguage(option.code)}
          />
        ))}
      </View>
    </StepShell>
  );
}

const useStyles = makeStyles((t) => ({
  list: { gap: t.space.md },
}));
