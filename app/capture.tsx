import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getApiKey } from '@/api/keyStore';
import { brand } from '@/constants/brand';
import type { IconName } from '@/data/icons';
import { useI18n } from '@/i18n';
import { preparePhoto, type SourceImage } from '@/media/photos';
import { useCaptureStore } from '@/store/captureStore';
import { camera } from '@/theme/palette';
import { makeStyles, useTheme } from '@/theme/ThemeProvider';
import { Button } from '@/ui/Button';
import { Icon } from '@/ui/Icon';
import { Text } from '@/ui/Text';
import { useToast } from '@/ui/Toast';
import { closeScreen } from '@/ui/navigation';

type FlashMode = 'off' | 'on' | 'auto';

const FLASH_ICON: Record<FlashMode, IconName> = { off: 'flash-off', on: 'flash', auto: 'flash-auto' };

export default function CaptureScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const styles = useStyles();
  const toast = useToast();
  const { tr, f } = useI18n();
  const cameraRef = useRef<CameraView>(null);

  const [permission, requestPermission] = useCameraPermissions();
  const [flash, setFlash] = useState<FlashMode>('off');
  const [busy, setBusy] = useState(false);
  const setCapture = useCaptureStore((state) => state.set);

  const proceed = async (source: SourceImage) => {
    setBusy(true);
    try {
      const prepared = await preparePhoto(source);
      const hasKey = (await getApiKey()) !== null;
      setCapture({ photoUri: prepared.uri, base64: prepared.base64, estimate: null });
      // No key means straight to manual entry with the photo attached.
      router.replace(hasKey ? '/review' : '/manual');
    } catch {
      setBusy(false);
      toast.show({ message: tr.common.errorGeneric, tone: 'error' });
    }
  };

  const takePhoto = async () => {
    if (!cameraRef.current || busy) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 1 });
      if (photo) await proceed({ uri: photo.uri, width: photo.width, height: photo.height });
    } catch {
      toast.show({ message: tr.common.errorGeneric, tone: 'error' });
    }
  };

  const pickFromLibrary = async () => {
    if (busy) return;
    try {
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1 });
      const asset = result.assets?.[0];
      if (!result.canceled && asset) {
        await proceed({ uri: asset.uri, width: asset.width, height: asset.height });
      }
    } catch {
      toast.show({ message: tr.common.errorGeneric, tone: 'error' });
    }
  };

  if (!permission) return <View style={styles.blank} />;

  if (!permission.granted) {
    return (
      <View style={[styles.blank, styles.permission, { paddingTop: insets.top, paddingBottom: insets.bottom + 16 }]}>
        <Icon name="camera-outline" size={48} color={theme.colors.onMedia} />
        <Text variant="title" tone="onMedia" align="center">
          {f(tr.capture.needCamera, { app: brand.name })}
        </Text>
        <Text tone="onMediaMuted" align="center">
          {tr.capture.cameraDetail}
        </Text>
        <Button label={tr.capture.allowCamera} onPress={() => void requestPermission()} />
        <Button label={tr.capture.pickLibrary} variant="onMedia" onPress={() => void pickFromLibrary()} />
        <Button label={tr.common.cancel} variant="ghost" onPress={() => closeScreen(router)} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} flash={flash} />

      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <RoundButton icon="close" label={tr.common.cancel} onPress={() => closeScreen(router)} />
        <RoundButton
          icon={FLASH_ICON[flash]}
          label={tr.capture.flash}
          onPress={() => setFlash((current) => (current === 'off' ? 'auto' : current === 'auto' ? 'on' : 'off'))}
        />
      </View>

      {busy ? (
        <View style={styles.busy}>
          <ActivityIndicator color={theme.colors.onMedia} size="large" />
          <Text tone="onMedia">{tr.capture.preparing}</Text>
        </View>
      ) : null}

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 24 }]}>
        <RoundButton icon="image-outline" label={tr.capture.library} onPress={() => void pickFromLibrary()} large />
        <Pressable
          onPress={() => void takePhoto()}
          disabled={busy}
          accessibilityRole="button"
          accessibilityLabel={tr.capture.takePhoto}
          style={({ pressed }) => [styles.shutter, pressed && styles.pressed]}
        >
          <View style={styles.shutterInner} />
        </Pressable>
        <View style={styles.spacer} />
      </View>
    </View>
  );
}

function RoundButton({ icon, label, onPress, large = false }: { icon: IconName; label: string; onPress: () => void; large?: boolean }) {
  const theme = useTheme();
  const styles = useStyles();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.round, large && styles.roundLarge, pressed && styles.pressed]}
    >
      <Icon name={icon} size={large ? 26 : 22} color={theme.colors.onMedia} />
    </Pressable>
  );
}

const useStyles = makeStyles((t) => ({
  root: { flex: 1, backgroundColor: camera.backdrop },
  blank: { flex: 1, backgroundColor: camera.backdrop },
  permission: { justifyContent: 'center', alignItems: 'stretch', paddingHorizontal: t.layout.gutter, gap: t.space.base },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: t.layout.gutter,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: t.layout.gutter,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  round: {
    width: 44,
    height: 44,
    borderRadius: t.radius.full,
    backgroundColor: camera.controlScrim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roundLarge: { width: 56, height: 56 },
  shutter: {
    width: 78,
    height: 78,
    borderRadius: t.radius.full,
    borderWidth: 4,
    borderColor: t.colors.onMedia,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterInner: { width: 62, height: 62, borderRadius: t.radius.full, backgroundColor: t.colors.onMedia },
  spacer: { width: 56 },
  pressed: { opacity: 0.7 },
  busy: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: camera.overlayScrim,
    gap: t.space.md,
  },
}));
