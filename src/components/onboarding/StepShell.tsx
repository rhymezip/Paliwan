import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { View } from 'react-native';

import { useI18n } from '@/i18n';
import { ONBOARDING_STEPS, type OnboardingStep } from '@/store/onboardingStore';
import { makeStyles, useTheme } from '@/theme/ThemeProvider';
import { Button } from '@/ui/Button';
import { ProgressBar } from '@/ui/ProgressBar';
import { Screen } from '@/ui/Screen';
import { Text } from '@/ui/Text';

interface StepShellProps {
  step: OnboardingStep;
  title: string;
  detail?: string;
  children?: ReactNode;
  primaryLabel: string;
  onPrimary: () => void;
  primaryDisabled?: boolean;
  primaryLoading?: boolean;
  showBack?: boolean;
}

/** Progress, title and a pinned primary button — the frame of every onboarding step. */
export function StepShell({
  step,
  title,
  detail,
  children,
  primaryLabel,
  onPrimary,
  primaryDisabled = false,
  primaryLoading = false,
  showBack = true,
}: StepShellProps) {
  const router = useRouter();
  const theme = useTheme();
  const styles = useStyles();
  const { tr, f } = useI18n();
  const index = ONBOARDING_STEPS.indexOf(step);
  const total = ONBOARDING_STEPS.length;

  return (
    <Screen
      onBack={showBack && router.canGoBack() ? () => router.back() : undefined}
      right={
        <Text variant="label" tone="muted">
          {f(tr.onboarding.stepOf, { n: index + 1, total })}
        </Text>
      }
      footer={
        <Button
          label={primaryLabel}
          onPress={onPrimary}
          disabled={primaryDisabled}
          loading={primaryLoading}
        />
      }
    >
      <ProgressBar progress={(index + 1) / total} color={theme.colors.primary} height={6} />
      <View style={styles.titles}>
        <Text variant="title">{title}</Text>
        {detail ? <Text tone="muted">{detail}</Text> : null}
      </View>
      {children}
    </Screen>
  );
}

const useStyles = makeStyles((t) => ({
  titles: { gap: t.space.xs, marginTop: t.space.sm, marginBottom: t.space.xs },
}));
