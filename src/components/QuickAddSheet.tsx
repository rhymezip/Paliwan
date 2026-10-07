import * as Haptics from 'expo-haptics';
import { useRouter, type Href } from 'expo-router';
import { Pressable, View } from 'react-native';

import type { IconName } from '@/data/icons';
import { useI18n } from '@/i18n';
import { useSettingsStore } from '@/store/settingsStore';
import { useWaterStore } from '@/store/waterStore';
import { makeStyles, useTheme } from '@/theme/ThemeProvider';
import { Icon } from '@/ui/Icon';
import { Sheet } from '@/ui/Sheet';
import { Text } from '@/ui/Text';
import { useToast } from '@/ui/Toast';

const QUICK_WATER_ML = 250;
const SHEET_CLOSE_MS = 350;

export function QuickAddSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const router = useRouter();
  const theme = useTheme();
  const styles = useStyles();
  const { tr, f } = useI18n();
  const toast = useToast();
  const addWater = useWaterStore((state) => state.add);
  const activeProgramId = useSettingsStore((state) => state.activeProgramId);

  // Navigate once the sheet has gone: iOS will not present a full-screen
  // screen (camera, workout) while another modal is still animating out.
  const go = (href: Href) => {
    onClose();
    setTimeout(() => router.push(href), SHEET_CLOSE_MS);
  };

  const drink = async () => {
    onClose();
    try {
      await addWater(QUICK_WATER_ML);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      toast.show({ message: f(tr.toast.waterAdded, { ml: QUICK_WATER_ML }), tone: 'success' });
    } catch {
      toast.show({ message: tr.common.errorGeneric, tone: 'error' });
    }
  };

  const actions: { label: string; detail?: string; icon: IconName; color: string; onPress: () => void }[] = [
    { label: tr.quickAdd.water, detail: `+${QUICK_WATER_ML} ${tr.common.ml}`, icon: 'cup-water', color: theme.colors.water, onPress: () => void drink() },
    { label: tr.quickAdd.activity, icon: 'run', color: theme.colors.activity, onPress: () => go('/activity/new') },
    {
      label: tr.quickAdd.workout,
      icon: 'dumbbell',
      color: theme.colors.steps,
      onPress: () =>
        go(activeProgramId ? { pathname: '/workout/[programId]', params: { programId: activeProgramId } } : '/(tabs)/train'),
    },
    { label: tr.quickAdd.photo, icon: 'camera-outline', color: theme.colors.food, onPress: () => go('/capture') },
    { label: tr.quickAdd.foodList, icon: 'format-list-bulleted', color: theme.colors.carbs, onPress: () => go('/food/library') },
  ];

  return (
    <Sheet visible={visible} onClose={onClose} title={tr.quickAdd.title}>
      <View style={styles.grid}>
        {actions.map((action) => (
          <Pressable
            key={action.label}
            onPress={action.onPress}
            accessibilityRole="button"
            accessibilityLabel={action.label}
            style={({ pressed }) => [styles.tile, pressed && styles.pressed]}
          >
            <View style={[styles.bubble, { backgroundColor: action.color }]}>
              <Icon name={action.icon} size={24} color={theme.colors.onMedia} />
            </View>
            <Text variant="label" numberOfLines={2}>
              {action.label}
            </Text>
            {action.detail ? (
              <Text variant="caption" tone="muted">
                {action.detail}
              </Text>
            ) : null}
          </Pressable>
        ))}
      </View>
    </Sheet>
  );
}

const useStyles = makeStyles((t) => ({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: t.space.md },
  tile: {
    width: '47%',
    flexGrow: 1,
    padding: t.space.base,
    borderRadius: t.radius.lg,
    backgroundColor: t.colors.surface,
    borderWidth: 1,
    borderColor: t.colors.border,
    gap: t.space.sm,
  },
  pressed: { opacity: 0.8 },
  bubble: {
    width: 44,
    height: 44,
    borderRadius: t.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
}));
