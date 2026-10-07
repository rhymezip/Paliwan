import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { SPORTS } from '@/data/sports';
import { useI18n } from '@/i18n';
import { ADULT_AGE, goalsForAge } from '@/logic/energy';
import { ONBOARDING_LIMITS } from '@/store/onboardingStore';
import { useProfileStore } from '@/store/profileStore';
import { makeStyles, useTheme } from '@/theme/ThemeProvider';
import type { Goal, Sex, SportId, TrainingLoad } from '@/types';
import { Button } from '@/ui/Button';
import { Field } from '@/ui/Field';
import { Icon } from '@/ui/Icon';
import { SectionHeader } from '@/ui/misc';
import { OptionCard } from '@/ui/OptionCard';
import { Screen } from '@/ui/Screen';
import { Segmented } from '@/ui/Segmented';
import { Text } from '@/ui/Text';
import { useToast } from '@/ui/Toast';
import { closeScreen } from '@/ui/navigation';

const LOADS: readonly TrainingLoad[] = ['light', 'moderate', 'high', 'very_high'];

export default function ProfileEditScreen() {
  const router = useRouter();
  const theme = useTheme();
  const styles = useStyles();
  const toast = useToast();
  const { tr, pick } = useI18n();
  const profile = useProfileStore((state) => state.profile);
  const update = useProfileStore((state) => state.update);

  const [name, setName] = useState(profile?.name ?? '');
  const [ageText, setAgeText] = useState(profile ? String(profile.age) : '');
  const [sex, setSex] = useState<Sex>(profile?.sex ?? 'male');
  const [heightText, setHeightText] = useState(profile ? String(profile.heightCm) : '');
  const [weightText, setWeightText] = useState(profile ? String(profile.weightKg) : '');
  const [sport, setSport] = useState<SportId>(profile?.sport ?? 'other');
  const [load, setLoad] = useState<TrainingLoad>(profile?.trainingLoad ?? 'moderate');
  const [goal, setGoal] = useState<Goal>(profile?.goal ?? 'perform');
  const [saving, setSaving] = useState(false);

  if (!profile) return <Screen onBack={() => closeScreen(router)} />;

  const age = Number.parseInt(ageText, 10);
  const height = Number.parseFloat(heightText.replace(',', '.'));
  const weight = Number.parseFloat(weightText.replace(',', '.'));
  const limits = ONBOARDING_LIMITS;
  const valid =
    name.trim().length > 0 &&
    Number.isFinite(age) && age >= limits.age.min && age <= limits.age.max &&
    Number.isFinite(height) && height >= limits.heightCm.min && height <= limits.heightCm.max &&
    Number.isFinite(weight) && weight >= limits.weightKg.min && weight <= limits.weightKg.max;
  const goals = goalsForAge(Number.isFinite(age) ? age : ADULT_AGE);
  const effectiveGoal = goals.includes(goal) ? goal : 'perform';

  const save = async () => {
    if (!valid) return;
    setSaving(true);
    try {
      await update({
        name: name.trim(),
        age,
        sex,
        heightCm: Math.round(height),
        weightKg: Math.round(weight * 10) / 10,
        sport,
        trainingLoad: load,
        goal: effectiveGoal,
      });
      toast.show({ message: tr.toast.profileSaved, tone: 'success' });
      closeScreen(router);
    } catch {
      setSaving(false);
      toast.show({ message: tr.common.errorGeneric, tone: 'error' });
    }
  };

  return (
    <Screen
      onBack={() => closeScreen(router)}
      backIcon="close"
      title={tr.profile.edit}
      footer={<Button label={tr.profile.save} icon="check" disabled={!valid} loading={saving} onPress={() => void save()} />}
    >
      <Field label={tr.onboarding.name.placeholder} value={name} onChangeText={setName} maxLength={limits.nameLength} />
      <View style={styles.row}>
        <View style={styles.flex}>
          <Field label={tr.onboarding.about.age} value={ageText} onChangeText={(text) => setAgeText(text.replace(/[^0-9]/g, ''))} keyboardType="number-pad" numeric maxLength={2} />
        </View>
        <View style={styles.flex}>
          <Field label={tr.onboarding.body.height} value={heightText} onChangeText={setHeightText} keyboardType="decimal-pad" numeric suffix={tr.common.cm} />
        </View>
        <View style={styles.flex}>
          <Field label={tr.onboarding.body.weight} value={weightText} onChangeText={setWeightText} keyboardType="decimal-pad" numeric suffix={tr.common.kg} />
        </View>
      </View>

      <SectionHeader title={tr.onboarding.about.sex} />
      <Segmented
        value={sex}
        onChange={setSex}
        options={[
          { value: 'male', label: tr.sex.male },
          { value: 'female', label: tr.sex.female },
        ]}
      />

      <SectionHeader title={tr.onboarding.sport.title} />
      <View style={styles.chips}>
        {SPORTS.map((option) => {
          const selected = option.id === sport;
          return (
            <Pressable
              key={option.id}
              onPress={() => setSport(option.id)}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              style={[styles.chip, selected && styles.chipSelected]}
            >
              <Icon name={option.icon} size={18} color={selected ? theme.colors.onPrimary : theme.colors.textMuted} />
              <Text variant="label" tone={selected ? 'onPrimary' : 'default'}>
                {pick(option.name)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <SectionHeader title={tr.onboarding.training.title} />
      <Segmented
        value={load}
        onChange={setLoad}
        options={LOADS.map((value) => ({ value, label: tr.load[value].title }))}
      />
      <Text variant="caption" tone="muted">
        {tr.load[load].detail}
      </Text>

      <SectionHeader title={tr.onboarding.training.goalTitle} />
      {goals.map((option) => (
        <OptionCard
          key={option}
          title={tr.goal[option].title}
          detail={tr.goal[option].detail}
          selected={effectiveGoal === option}
          onPress={() => setGoal(option)}
        />
      ))}
    </Screen>
  );
}

const useStyles = makeStyles((t) => ({
  row: { flexDirection: 'row', gap: t.space.sm },
  flex: { flex: 1 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: t.space.sm },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.space.xs,
    paddingHorizontal: t.space.md,
    paddingVertical: t.space.sm,
    borderRadius: t.radius.full,
    backgroundColor: t.colors.surfaceAlt,
  },
  chipSelected: { backgroundColor: t.colors.primary },
}));
