import type { ExpoConfig } from 'expo/config';

import { brandMeta } from './src/constants/brandMeta';

/**
 * A build-time Gemini key, read from `.env` (see `.env.example`).
 *
 * This exists so a developer running the project locally does not have to retype
 * their key on every fresh install. It is a convenience, not the storage mechanism:
 * anything in `extra` is compiled into the JS bundle and is readable by anyone who
 * has the build. The app treats it as a one-time seed — on first launch it is copied
 * into the device Keychain (`expo-secure-store`) and read from there afterwards.
 *
 * Leave it unset when you publish. Users add their own key in Settings.
 */
const geminiDevApiKey = process.env.SNAP_DEV_GEMINI_API_KEY ?? null;

const config: ExpoConfig = {
  name: brandMeta.name,
  slug: 'paliwan',
  scheme: 'paliwan',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  ios: {
    supportsTablet: false,
    bundleIdentifier: 'com.authrain.paliwan',
    infoPlist: {
      NSCameraUsageDescription:
        `${brandMeta.name} uses the camera to photograph your meals so it can estimate their calories.`,
      NSPhotoLibraryUsageDescription:
        `${brandMeta.name} reads photos you pick so it can estimate the calories of a meal.`,
    },
  },
  android: {
    package: 'com.authrain.paliwan',
    adaptiveIcon: {
      backgroundColor: '#F2F6F1',
      foregroundImage: './assets/android-icon-foreground.png',
      monochromeImage: './assets/android-icon-monochrome.png',
    },
    permissions: ['android.permission.CAMERA'],
  },
  plugins: [
    'expo-router',
    'expo-sqlite',
    'expo-secure-store',
    'expo-font',
    [
      'expo-splash-screen',
      {
        image: './assets/splash-icon.png',
        resizeMode: 'contain',
        backgroundColor: '#F2F6F1',
      },
    ],
    [
      'expo-camera',
      {
        cameraPermission:
          `${brandMeta.name} uses the camera to photograph your meals so it can estimate their calories.`,
      },
    ],
    [
      'expo-image-picker',
      {
        photosPermission:
          `${brandMeta.name} reads photos you pick so it can estimate the calories of a meal.`,
      },
    ],
  ],
  extra: { geminiDevApiKey },
};

export default config;
