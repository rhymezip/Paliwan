import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/manrope';
import { ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { seedFromEnvironment } from '@/api/keyStore';
import { openDatabase } from '@/db';
import { I18nProvider } from '@/i18n';
import { configureNotifications } from '@/services/notifications';
import { useProfileStore } from '@/store/profileStore';
import { useSettingsStore } from '@/store/settingsStore';
import { navigationTheme } from '@/theme/navigationTheme';
import { ThemeProvider, useTheme } from '@/theme/ThemeProvider';
import { ToastProvider } from '@/ui/Toast';

// The splash stays up until fonts and storage are ready, so the first frame is
// never system-font text on a blank background.
void SplashScreen.preventAutoHideAsync();

/** Storage must never leave the app stuck on the splash (the web preview has none). */
const STARTUP_TIMEOUT_MS = 4000;

async function startUp(): Promise<void> {
  await openDatabase();
  await seedFromEnvironment();
  await useSettingsStore.getState().load();
  await useProfileStore.getState().load();
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });
  const [dataReady, setDataReady] = useState(false);
  const language = useSettingsStore((state) => state.language);
  const themePreference = useSettingsStore((state) => state.theme);

  useEffect(() => {
    configureNotifications();
    let active = true;
    void (async () => {
      try {
        await Promise.race([
          startUp(),
          new Promise<void>((_, reject) =>
            setTimeout(() => reject(new Error('storage timeout')), STARTUP_TIMEOUT_MS),
          ),
        ]);
      } catch (error) {
        console.warn('Startup: on-device storage is unavailable.', error);
      }
      if (!useSettingsStore.getState().loaded) useSettingsStore.setState({ loaded: true });
      if (active) setDataReady(true);
    })();
    return () => {
      active = false;
    };
  }, []);

  const ready = (fontsLoaded || fontError !== null) && dataReady;

  useEffect(() => {
    if (ready) void SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider preference={themePreference}>
          <I18nProvider language={language}>
            <ThemedStack />
          </I18nProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function ThemedStack() {
  const theme = useTheme();
  const navTheme = useMemo(() => navigationTheme(theme), [theme]);
  const fromBottom = { animation: 'slide_from_bottom' } as const;

  return (
    <NavigationThemeProvider value={navTheme}>
      <ToastProvider>
        <StatusBar style={theme.dark ? 'light' : 'dark'} />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: theme.colors.background },
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
          <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
          <Stack.Screen name="water" options={fromBottom} />
          <Stack.Screen name="steps" options={fromBottom} />
          <Stack.Screen name="activity/new" options={fromBottom} />
          <Stack.Screen name="food/library" options={fromBottom} />
          <Stack.Screen name="manual" options={fromBottom} />
          <Stack.Screen name="profile-edit" options={fromBottom} />
          <Stack.Screen name="program/[id]" />
          <Stack.Screen name="review" />
          <Stack.Screen
            name="workout/[programId]"
            options={{ presentation: 'fullScreenModal', gestureEnabled: false }}
          />
          <Stack.Screen name="capture" options={{ presentation: 'fullScreenModal', animation: 'fade' }} />
        </Stack>
      </ToastProvider>
    </NavigationThemeProvider>
  );
}
