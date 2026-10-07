import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { Linking, Pressable, StyleSheet, View } from 'react-native';

import { looksLikeApiKey, setApiKey } from '@/api/keyStore';
import { VisionError, verifyApiKey } from '@/api/vision';
import { Button } from '@/components/Button';
import { Field } from '@/components/Field';
import { Body, Caption } from '@/components/Type';
import { color, opacity, space } from '@/constants/theme';
import { brand } from '@/constants/brand';

const GEMINI_CONSOLE_URL = 'https://aistudio.google.com/apikey';

type TestState =
  | { status: 'idle' }
  | { status: 'testing' }
  | { status: 'passed' }
  | { status: 'failed'; message: string };

interface Props {
  /** Called once a key has been stored, whether or not it was tested. */
  onSaved: () => void;
  saveLabel?: string;
}

/**
 * Key entry, shared by onboarding and Settings. The key goes straight to
 * `keyStore` and is never lifted into component state beyond this form.
 */
export function ApiKeyForm({ onSaved, saveLabel = 'Açary sakla' }: Props) {
  const [value, setValue] = useState('');
  const [test, setTest] = useState<TestState>({ status: 'idle' });
  const [helpOpen, setHelpOpen] = useState(false);

  const shaped = looksLikeApiKey(value);

  const runTest = async () => {
    setTest({ status: 'testing' });
    try {
      await setApiKey(value);
      await verifyApiKey();
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTest({ status: 'passed' });
    } catch (error) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      // Surface the underlying cause instead of one blanket message — the kind
      // and the raw error tell network apart from timeout apart from a bad key.
      const kind = error instanceof VisionError ? error.kind : 'unknown';
      const detail =
        error instanceof Error ? error.message : String(error);
      setTest({
        status: 'failed',
        message:
          kind === 'unauthorized'
            ? 'That key was rejected. Check you copied all of it.'
            : kind === 'billing'
              ? 'The key works, but Google AI Studio is limiting this request. Check your project quota or billing.'
              : `Test failed — kind: ${kind}. ${detail}`,
      });
    }
  };

  const save = async () => {
    await setApiKey(value);
    onSaved();
  };

  return (
    <View style={styles.root}>
      <Field
        value={value}
        onChangeText={(next) => {
          setValue(next);
          setTest({ status: 'idle' });
        }}
        label="Gemini API açary"
        placeholder="AIza… or AQ.…"
        secureTextEntry
        autoFocus
        hint={
          shaped || value.length === 0
            ? 'Google Gemini key. Stored securely on this phone; it is only used for your direct photo analysis request.'
            : undefined
        }
        error={
          value.length > 0 && !shaped
            ? 'That doesn’t look like a Google AI Studio key.'
            : undefined
        }
      />

      <Pressable
        onPress={() => setHelpOpen((open) => !open)}
        accessibilityRole="button"
        accessibilityLabel="Açary nireden almaly?"
        accessibilityState={{ expanded: helpOpen }}
        style={({ pressed }) => [
          styles.help,
          pressed && { opacity: opacity.pressed },
        ]}
      >
        <Body>Açary nireden almaly?</Body>
        <Feather
          name={helpOpen ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={color.muted}
        />
      </Pressable>

      {helpOpen ? (
        <View style={styles.helpBody}>
          <Body muted>
            Create a Google AI Studio key, copy it once, and paste it here. {brand.name}
            sends the photo directly to Gemini; there is no {brand.name} server in
            between. Your key stays in secure device storage.
          </Body>
          <Button
            label="Google AI Studio-ny aç"
            variant="secondary"
            onPress={() => void Linking.openURL(GEMINI_CONSOLE_URL)}
          />
        </View>
      ) : null}

      {test.status === 'passed' ? (
          <Caption style={styles.passed}>Açar işleýär.</Caption>
      ) : test.status === 'failed' ? (
        <Caption style={styles.failed}>{test.message}</Caption>
      ) : null}

      <View style={styles.actions}>
        <Button
          label="Açary barla"
          variant="secondary"
          onPress={() => void runTest()}
          disabled={!shaped}
          loading={test.status === 'testing'}
        />
        <Button
          label={saveLabel}
          onPress={() => void save()}
          disabled={!shaped || test.status === 'testing'}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: space.base },
  help: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  helpBody: { gap: space.md },
  actions: { gap: space.sm },
  passed: { color: color.olive },
  failed: { color: color.paprika },
});
