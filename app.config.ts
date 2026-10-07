import type { ExpoConfig } from 'expo/config';

// JSON, not TypeScript: Node before 22.18 cannot load a `.ts` file from here.
import brandMeta from './src/constants/brandMeta.json';

/**
 * A build-time Gemini key, read from `.env` (see `.env.example`).
 *
 * This exists so a developer running the project locally does not have to retype
 * their key on every fresh install. It is a convenience, not the storage mechanism:
 * anything in `extra` is compiled into the JS bundle and is readable by anyone who
 * has the build. The app copies it into the device Keychain (`expo-secure-store`)
 * on launch and reads it from there.
 *
 * Leave it unset when you publish. Users add their own key in Profile.
 */
const geminiDevApiKey = process.env.PALIWAN_GEMINI_API_KEY ?? null;

const cameraPermission = `${brandMeta.name} uses the camera to photograph your meals so it can estimate their calories.`;
const photosPermission = `${brandMeta.name} reads photos you pick so it can estimate the calories of a meal.`;
const motionPermission = `${brandMeta.name} counts your steps to show your daily activity.`;

const config: ExpoConfig = {
  name: brandMeta.name,
  slug: 'paliwan',
  scheme: 'paliwan',
  version: '2.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  ios: {
    supportsTablet: false,
    bundleIdentifier: 'com.authrain.paliwan',
    infoPlist: {
      NSCameraUsageDescription: cameraPermission,
      NSPhotoLibraryUsageDescription: photosPermission,
      NSMotionUsageDescription: motionPermission,
    },
  },
  android: {
    package: 'com.authrain.paliwan',
    adaptiveIcon: {
      backgroundColor: '#F2F6F1',
      foregroundImage: './assets/android-icon-foreground.png',
      monochromeImage: './assets/android-icon-monochrome.png',
    },
    permissions: ['android.permission.CAMERA', 'android.permission.ACTIVITY_RECOGNITION'],
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
        dark: { backgroundColor: brandMeta.colors.night },
      },
    ],
    [
      'expo-camera',
      {
        cameraPermission,
        microphonePermission: false,
        recordAudioAndroid: false,
      },
    ],
    ['expo-image-picker', { photosPermission }],
    ['expo-sensors', { motionPermission }],
    ['expo-notifications', { color: brandMeta.colors.green }],
  ],
  extra: { geminiDevApiKey },
};

export default config;
