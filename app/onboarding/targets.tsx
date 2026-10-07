import { useRouter } from 'expo-router';

import { StepShell } from '@/components/onboarding/StepShell';
import { useDraftProfile } from '@/components/onboarding/useDraftProfile';
import { TargetSummary } from '@/components/TargetSummary';
import { useI18n } from '@/i18n';

export default function TargetsStep() {
  const router = useRouter();
  const { tr } = useI18n();
  const profile = useDraftProfile();

  if (!profile) {
    // A step was skipped by deep link — start over from the name.
    return (
      <StepShell
        step="targets"
        title={tr.common.errorGeneric}
        primaryLabel={tr.common.continue}
        onPrimary={() => router.replace('/onboarding/name')}
      />
    );
  }

  return (
    <StepShell
      step="targets"
      title={tr.onboarding.targets.title}
      detail={tr.onboarding.targets.detail}
      primaryLabel={tr.common.continue}
      onPrimary={() => router.push('/onboarding/permissions')}
    >
      <TargetSummary profile={profile} />
    </StepShell>
  );
}
