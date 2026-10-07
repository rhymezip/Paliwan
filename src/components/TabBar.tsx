import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { QuickAddSheet } from '@/components/QuickAddSheet';
import type { IconName } from '@/data/icons';
import { useI18n } from '@/i18n';
import { makeStyles, useTheme } from '@/theme/ThemeProvider';
import { Icon } from '@/ui/Icon';
import { Text } from '@/ui/Text';

type TabKey = 'index' | 'train' | 'food' | 'profile';

const ICONS: Record<TabKey, { active: IconName; idle: IconName }> = {
  index: { active: 'home-variant', idle: 'home-variant-outline' },
  train: { active: 'dumbbell', idle: 'dumbbell' },
  food: { active: 'food-apple', idle: 'food-apple-outline' },
  profile: { active: 'account-circle', idle: 'account-circle-outline' },
};

/** Four tabs with a raised quick-add button in the middle. */
export function TabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const styles = useStyles();
  const { tr } = useI18n();
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  const labels: Record<TabKey, string> = {
    index: tr.tabs.home,
    train: tr.tabs.train,
    food: tr.tabs.food,
    profile: tr.tabs.profile,
  };

  const renderTab = (routeIndex: number) => {
    const route = state.routes[routeIndex];
    if (!route) return null;
    const key = route.name as TabKey;
    const focused = state.index === routeIndex;
    const color = focused ? theme.colors.primary : theme.colors.textFaint;
    return (
      <Pressable
        key={route.key}
        accessibilityRole="tab"
        accessibilityState={{ selected: focused }}
        accessibilityLabel={labels[key]}
        onPress={() => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) {
            void Haptics.selectionAsync();
            navigation.navigate(route.name);
          }
        }}
        style={styles.tab}
      >
        <Icon name={focused ? ICONS[key].active : ICONS[key].idle} size={24} color={color} />
        <Text variant="caption" color={color} numberOfLines={1}>
          {labels[key]}
        </Text>
      </Pressable>
    );
  };

  return (
    <>
      <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
        {renderTab(0)}
        {renderTab(1)}
        <View style={styles.fabSlot}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={tr.tabs.add}
            onPress={() => {
              void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setQuickAddOpen(true);
            }}
            style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
          >
            <Icon name="plus" size={30} color={theme.colors.onPrimary} />
          </Pressable>
        </View>
        {renderTab(2)}
        {renderTab(3)}
      </View>
      <QuickAddSheet visible={quickAddOpen} onClose={() => setQuickAddOpen(false)} />
    </>
  );
}

const useStyles = makeStyles((t) => ({
  bar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: t.colors.tabBar,
    borderTopWidth: 1,
    borderTopColor: t.colors.border,
    paddingTop: t.space.sm,
    paddingHorizontal: t.space.sm,
  },
  tab: { flex: 1, alignItems: 'center', gap: t.space.xxs, minHeight: 48, justifyContent: 'center' },
  fabSlot: { flex: 1, alignItems: 'center' },
  fab: {
    width: t.layout.fabSize,
    height: t.layout.fabSize,
    borderRadius: t.radius.full,
    backgroundColor: t.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -28,
    borderWidth: 4,
    borderColor: t.colors.tabBar,
    shadowColor: t.colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  fabPressed: { transform: [{ scale: 0.94 }] },
}));
