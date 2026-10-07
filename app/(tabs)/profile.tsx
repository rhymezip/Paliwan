import Constants from 'expo-constants';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { View } from 'react-native';

import { clearApiKey, maskedApiKey } from '@/api/keyStore';
import { ApiKeyForm } from '@/components/ApiKeyForm';
import { ReminderSettings } from '@/components/ReminderSettings';
import { TargetSummary } from '@/components/TargetSummary';
import { sportById } from '@/data/sports';
import { LANGUAGES, useI18n } from '@/i18n';
import { exportData } from '@/logic/export';
import { wipeEverything } from '@/logic/wipe';
import { useProfileStore } from '@/store/profileStore';
import { useSettingsStore } from '@/store/settingsStore';
import { makeStyles, useTheme } from '@/theme/ThemeProvider';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { ListRow } from '@/ui/ListRow';
import { Avatar, Divider, SectionHeader, confirm } from '@/ui/misc';
import { Screen } from '@/ui/Screen';
import { Segmented } from '@/ui/Segmented';
import { Sheet } from '@/ui/Sheet';
import { Stepper } from '@/ui/Stepper';
import { Text } from '@/ui/Text';
import { useToast } from '@/ui/Toast';

export default function ProfileScreen() {
  const router = useRouter();
  const theme = useTheme();
  const styles = useStyles();
  const toast = useToast();
  const { tr, f, pick } = useI18n();
  const profile = useProfileStore((state) => state.profile);
  const update = useProfileStore((state) => state.update);
  const { language, theme: themePreference, setLanguage, setTheme } = useSettingsStore();

  const [maskedKey, setMaskedKey] = useState<string | null>(null);
  const [keyOpen, setKeyOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);

  const refreshKey = useCallback(() => {
    void maskedApiKey()
      .then(setMaskedKey)
      .catch(() => setMaskedKey(null));
  }, []);

  useFocusEffect(refreshKey);

  if (!profile) return <Screen tabBarSpace />;

  const sport = sportById(profile.sport);

  const saveGoal = async (patch: { waterGoalMl?: number; stepGoal?: number }) => {
    try {
      await update(patch);
    } catch {
      toast.show({ message: tr.common.errorGeneric, tone: 'error' });
    }
  };

  const removeKey = async () => {
    try {
      await clearApiKey();
      refreshKey();
      toast.show({ message: tr.toast.keyRemoved });
    } catch {
      toast.show({ message: tr.common.errorGeneric, tone: 'error' });
    }
  };

  const exportAll = async () => {
    try {
      await exportData();
    } catch {
      toast.show({ message: tr.common.errorGeneric, tone: 'error' });
    }
  };

  const deleteAll = async () => {
    const ok = await confirm({
      title: tr.profile.deleteTitle,
      message: tr.profile.deleteBody,
      confirmLabel: tr.common.delete,
      cancelLabel: tr.common.cancel,
      destructive: true,
    });
    if (!ok) return;
    try {
      await wipeEverything();
      toast.show({ message: tr.toast.deleted });
      router.replace('/onboarding/language');
    } catch {
      toast.show({ message: tr.common.errorGeneric, tone: 'error' });
    }
  };

  const currentLanguage = LANGUAGES.find((option) => option.code === language);

  return (
    <Screen tabBarSpace title={tr.profile.title}>
      <Card style={styles.identity}>
        <Avatar name={profile.name} size={64} />
        <View style={styles.flex}>
          <Text variant="heading">{profile.name}</Text>
          <Text variant="caption" tone="muted">
            {pick(sport.name)} · {f(tr.profile.age, { n: profile.age })} · {profile.heightCm} {tr.common.cm} ·{' '}
            {profile.weightKg} {tr.common.kg}
          </Text>
        </View>
        <Button label={tr.common.edit} size="sm" variant="secondary" icon="pencil-outline" onPress={() => router.push('/profile-edit')} />
      </Card>

      <SectionHeader title={tr.profile.targets} />
      <TargetSummary profile={profile} />
      <Card style={styles.goals}>
        <Text variant="label" tone="muted">
          {tr.profile.waterGoal}
        </Text>
        <Stepper
          value={profile.waterGoalMl}
          min={1500}
          max={4500}
          step={250}
          format={(value) => `${value} ${tr.common.ml}`}
          onChange={(waterGoalMl) => void saveGoal({ waterGoalMl })}
        />
        <Text variant="label" tone="muted">
          {tr.profile.stepGoal}
        </Text>
        <Stepper
          value={profile.stepGoal}
          min={3000}
          max={25000}
          step={1000}
          format={(value) => value.toLocaleString('en-US').replace(/,/g, ' ')}
          onChange={(stepGoal) => void saveGoal({ stepGoal })}
        />
      </Card>

      <SectionHeader title={tr.profile.preferences} />
      <Card padded={false} style={styles.list}>
        <ListRow
          icon="translate"
          title={tr.profile.language}
          right={currentLanguage?.nativeName}
          chevron
          onPress={() => setLanguageOpen(true)}
        />
      </Card>
      <Card style={styles.themeCard}>
        <Text variant="label" tone="muted">
          {tr.profile.theme}
        </Text>
        <Segmented
          value={themePreference}
          onChange={(value) => void setTheme(value)}
          options={[
            { value: 'system', label: tr.profile.themeSystem },
            { value: 'light', label: tr.profile.themeLight },
            { value: 'dark', label: tr.profile.themeDark },
          ]}
        />
      </Card>
      <ReminderSettings />

      <SectionHeader title={tr.profile.ai} />
      <Card padded={false} style={styles.list}>
        <ListRow
          icon="key-outline"
          accent={theme.colors.carbs}
          title={maskedKey ? f(tr.profile.keySet, { masked: maskedKey }) : tr.profile.keyMissing}
          chevron
          onPress={() => setKeyOpen(true)}
        />
        {maskedKey ? (
          <>
            <Divider />
            <ListRow icon="key-remove" accent={theme.colors.danger} title={tr.apiKey.removeKey} onPress={() => void removeKey()} />
          </>
        ) : null}
      </Card>

      <SectionHeader title={tr.profile.data} />
      <Card padded={false} style={styles.list}>
        <ListRow icon="export-variant" title={tr.profile.export} chevron onPress={() => void exportAll()} />
        <Divider />
        <ListRow icon="delete-outline" accent={theme.colors.danger} title={tr.profile.deleteAll} onPress={() => void deleteAll()} />
      </Card>

      <Text variant="caption" tone="faint" align="center">
        {f(tr.profile.version, { v: Constants.expoConfig?.version ?? '2.0.0' })}
      </Text>

      <Sheet visible={languageOpen} onClose={() => setLanguageOpen(false)} title={tr.profile.language}>
        {LANGUAGES.map((option) => (
          <Card key={option.code} padded={false} style={styles.list}>
            <ListRow
              icon={option.code === language ? 'check-circle' : 'circle-outline'}
              title={option.nativeName}
              subtitle={option.englishName}
              onPress={() => {
                void setLanguage(option.code);
                setLanguageOpen(false);
              }}
            />
          </Card>
        ))}
      </Sheet>

      <Sheet visible={keyOpen} onClose={() => setKeyOpen(false)} title={tr.profile.ai}>
        <ApiKeyForm
          onSaved={() => {
            setKeyOpen(false);
            refreshKey();
            toast.show({ message: tr.toast.keySaved, tone: 'success' });
          }}
        />
      </Sheet>
    </Screen>
  );
}

const useStyles = makeStyles((t) => ({
  identity: { flexDirection: 'row', alignItems: 'center', gap: t.space.md },
  flex: { flex: 1, gap: t.space.xxs },
  goals: { gap: t.space.sm },
  themeCard: { gap: t.space.sm },
  list: { paddingHorizontal: t.space.base },
}));
