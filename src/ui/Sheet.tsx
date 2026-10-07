import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useI18n } from '@/i18n';
import { makeStyles } from '@/theme/ThemeProvider';
import { IconButton } from '@/ui/IconButton';
import { Text } from '@/ui/Text';

interface SheetProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** Pinned below the scrolling content. */
  footer?: ReactNode;
}

/** A bottom sheet. Tapping the scrim or the close button dismisses it. */
export function Sheet({ visible, onClose, title, children, footer }: SheetProps) {
  const insets = useSafeAreaInsets();
  const styles = useStyles();
  const { tr } = useI18n();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.root}>
        <Pressable
          style={styles.scrim}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={tr.common.close}
        />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
            <View style={styles.grabber} />
            <View style={styles.header}>
              <Text variant="heading" style={styles.title}>
                {title}
              </Text>
              <IconButton icon="close" label={tr.common.close} onPress={onClose} size={36} />
            </View>
            <ScrollView
              style={styles.body}
              contentContainerStyle={styles.bodyContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {children}
            </ScrollView>
            {footer ? <View style={styles.footer}>{footer}</View> : null}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const useStyles = makeStyles((t) => ({
  root: { flex: 1, justifyContent: 'flex-end' },
  scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: t.colors.overlay },
  sheet: {
    backgroundColor: t.colors.background,
    borderTopLeftRadius: t.radius.xl,
    borderTopRightRadius: t.radius.xl,
    maxHeight: '90%',
  },
  grabber: {
    alignSelf: 'center',
    width: 40,
    height: 5,
    borderRadius: 3,
    marginTop: t.space.sm,
    backgroundColor: t.colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: t.layout.gutter,
    paddingTop: t.space.md,
    gap: t.space.md,
  },
  title: { flex: 1 },
  body: { paddingHorizontal: t.layout.gutter },
  bodyContent: { paddingVertical: t.space.base, gap: t.space.md },
  footer: { paddingHorizontal: t.layout.gutter, paddingTop: t.space.sm, gap: t.space.sm },
}));
