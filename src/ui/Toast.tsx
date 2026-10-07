import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Platform, Pressable, View } from 'react-native';
import Animated, { FadeInDown, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { makeStyles, useTheme } from '@/theme/ThemeProvider';
import { Icon } from '@/ui/Icon';
import { Text } from '@/ui/Text';

export interface ToastRequest {
  message: string;
  tone?: 'default' | 'success' | 'error';
  /** Optional single action, e.g. "Undo". */
  actionLabel?: string;
  onAction?: () => void;
  /** Called when the toast leaves without the action being taken. */
  onExpire?: () => void;
  durationMs?: number;
}

interface ToastApi {
  show: (request: ToastRequest) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

const DEFAULT_DURATION = 3_500;

/** Keeps the toast above the tab bar on tab screens. */
const BOTTOM_OFFSET = 96;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastRequest | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const styles = useStyles();

  const clearTimer = () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  };

  const dismiss = useCallback((expired: boolean) => {
    clearTimer();
    setToast((current) => {
      if (current && expired) current.onExpire?.();
      return null;
    });
  }, []);

  const show = useCallback(
    (request: ToastRequest) => {
      // A second toast resolves the first — its action window has passed.
      setToast((current) => {
        current?.onExpire?.();
        return request;
      });
      clearTimer();
      timer.current = setTimeout(() => dismiss(true), request.durationMs ?? DEFAULT_DURATION);
    },
    [dismiss],
  );

  useEffect(() => clearTimer, []);

  const api = useMemo(() => ({ show }), [show]);
  const tone = toast?.tone ?? 'default';

  return (
    <ToastContext.Provider value={api}>
      {children}
      {toast ? (
        <Animated.View
          entering={Platform.OS === 'web' ? undefined : FadeInDown.duration(180)}
          exiting={Platform.OS === 'web' ? undefined : FadeOut.duration(180)}
          pointerEvents="box-none"
          style={[styles.host, { bottom: insets.bottom + BOTTOM_OFFSET }]}
        >
          <View style={styles.toast} accessibilityLiveRegion="polite">
            {tone !== 'default' ? (
              <Icon
                name={tone === 'error' ? 'alert-circle' : 'check-circle'}
                size={20}
                color={tone === 'error' ? theme.colors.danger : theme.colors.success}
              />
            ) : null}
            <Text style={styles.message} numberOfLines={3}>
              {toast.message}
            </Text>
            {toast.actionLabel ? (
              <Pressable
                onPress={() => {
                  clearTimer();
                  const action = toast.onAction;
                  setToast(null);
                  action?.();
                }}
                accessibilityRole="button"
                accessibilityLabel={toast.actionLabel}
                style={styles.action}
              >
                <Text variant="label" tone="primary">
                  {toast.actionLabel}
                </Text>
              </Pressable>
            ) : null}
          </View>
        </Animated.View>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const api = useContext(ToastContext);
  if (!api) throw new Error('useToast used outside ToastProvider.');
  return api;
}

const useStyles = makeStyles((t) => ({
  host: { position: 'absolute', left: t.layout.gutter, right: t.layout.gutter },
  toast: {
    minHeight: 52,
    backgroundColor: t.dark ? t.colors.surfaceAlt : t.colors.text,
    borderRadius: t.radius.lg,
    paddingLeft: t.space.base,
    paddingRight: t.space.sm,
    paddingVertical: t.space.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.space.md,
    ...t.shadow,
  },
  message: { flex: 1, color: t.dark ? t.colors.text : t.colors.background },
  action: { minHeight: 40, paddingHorizontal: t.space.md, justifyContent: 'center' },
}));
