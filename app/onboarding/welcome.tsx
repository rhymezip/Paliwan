import { useRouter } from 'expo-router';
import { Image, View } from 'react-native';

import { StepShell } from '@/components/onboarding/StepShell';
import { brand } from '@/constants/brand';
import type { IconName } from '@/data/icons';
import { useI18n } from '@/i18n';
import { makeStyles, useTheme } from '@/theme/ThemeProvider';
import { Card } from '@/ui/Card';
import { Icon } from '@/ui/Icon';
import { Text } from '@/ui/Text';

const FEATURE_ICONS: readonly IconName[] = ['shoe-print', 'cup-water', 'timer-outline', 'camera-outline'];

export default function Welcome() {
  const router = useRouter();
  const theme = useTheme();
  const styles = useStyles();
  const { tr } = useI18n();
  const colors = [theme.colors.steps, theme.colors.water, theme.colors.activity, theme.colors.food];

  return (
    <StepShell
      step="welcome"
      title={tr.onboarding.welcome.title}
      detail={tr.onboarding.welcome.detail}
      primaryLabel={tr.onboarding.welcome.cta}
      onPrimary={() => router.push('/onboarding/name')}
    >
      <Card gradient="hero" style={styles.hero}>
        <View style={styles.logoWrap}>
          <Image source={brand.logo} style={styles.logo} resizeMode="contain" />
        </View>
        <Text variant="title" tone="onMedia">
          {brand.name}
        </Text>
      </Card>
      <View style={styles.features}>
        {tr.onboarding.welcome.features.map((feature, index) => (
          <View key={feature} style={styles.feature}>
            <View style={[styles.bubble, { backgroundColor: colors[index] }]}>
              <Icon name={FEATURE_ICONS[index] ?? 'check'} size={20} color={theme.colors.onMedia} />
            </View>
            <Text variant="bodyStrong" style={styles.featureText}>
              {feature}
            </Text>
          </View>
        ))}
      </View>
    </StepShell>
  );
}

const useStyles = makeStyles((t) => ({
  hero: { alignItems: 'center', gap: t.space.md, paddingVertical: t.space.xl },
  logoWrap: {
    width: 88,
    height: 88,
    borderRadius: t.radius.xl,
    backgroundColor: t.colors.onMedia,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: { width: 64, height: 64 },
  features: { gap: t.space.md },
  feature: { flexDirection: 'row', alignItems: 'center', gap: t.space.md },
  bubble: {
    width: 40,
    height: 40,
    borderRadius: t.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: { flex: 1 },
}));
