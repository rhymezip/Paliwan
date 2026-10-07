import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { Linking, Pressable, View } from 'react-native';

import { looksLikeApiKey, setApiKey } from '@/api/keyStore';
import { copyForError, verifyApiKey } from '@/api/vision';
import { useI18n } from '@/i18n';
import { makeStyles, useTheme } from '@/theme/ThemeProvider';
import { Button } from '@/ui/Button';
import { Field } from '@/ui/Field';
import { Icon } from '@/ui/Icon';
import { Text } from '@/ui/Text';

const GEMINI_CONSOLE_URL = 'https://aistudio.google.com/apikey';

type TestState =
  | { status: 'idle' }
  | { status: 'testing' }
  | { status: 'passed' }
  | { status: 'failed'; message: string };

/**
 * Key entry for Profile. The key goes straight to `keyStore` and is never lifted
 * into component state beyond this form.
 */
export function ApiKeyForm({ onSaved }: { onSaved: () => void }) {
  const theme = useTheme();
  const styles = useStyles();
  const { tr } = useI18n();
  const [value, setValue] = useState('');
  const [test, setTest] = useState<TestState>({ status: 'idle' });
  const [helpOpen, setHelpOpen] = useState(false);
  const [saving, setSaving] = useState(false);

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
      const copy = copyForError(tr, error);
      setTest({ status: 'failed', message: `${copy.title}. ${copy.detail}` });
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      await setApiKey(value);
      onSaved();
    } catch {
      setTest({ status: 'failed', message: tr.common.errorGeneric });
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.root}>
      <Field
        label={tr.apiKey.label}
        value={value}
        onChangeText={(next) => {
          setValue(next);
          setTest({ status: 'idle' });
        }}
        placeholder={tr.apiKey.placeholder}
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
        hint={tr.apiKey.help}
        error={value.length > 0 && !shaped ? tr.apiKey.invalidFormat : undefined}
      />

      <Pressable
        onPress={() => setHelpOpen((open) => !open)}
        accessibilityRole="button"
        accessibilityState={{ expanded: helpOpen }}
        style={styles.help}
      >
        <Text variant="label" tone="primary">
          {tr.apiKey.where}
        </Text>
        <Icon name={helpOpen ? 'chevron-up' : 'chevron-down'} size={20} color={theme.colors.primary} />
      </Pressable>
      {helpOpen ? (
        <View style={styles.steps}>
          {tr.apiKey.steps.map((step, index) => (
            <Text key={step} tone="muted">
              {index + 1}. {step}
            </Text>
          ))}
          <Button
            label="aistudio.google.com"
            icon="open-in-new"
            variant="secondary"
            size="sm"
            onPress={() => void Linking.openURL(GEMINI_CONSOLE_URL)}
          />
        </View>
      ) : null}

      {test.status === 'passed' ? (
        <Text variant="label" color={theme.colors.success}>
          {tr.apiKey.valid}
        </Text>
      ) : test.status === 'failed' ? (
        <Text variant="caption" tone="danger">
          {test.message}
        </Text>
      ) : null}

      <View style={styles.actions}>
        <Button
          label={test.status === 'testing' ? tr.apiKey.testing : tr.apiKey.test}
          variant="secondary"
          onPress={() => void runTest()}
          disabled={!shaped}
          loading={test.status === 'testing'}
        />
        <Button
          label={tr.apiKey.saveKey}
          onPress={() => void save()}
          disabled={!shaped || test.status === 'testing'}
          loading={saving}
        />
      </View>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  root: { gap: t.space.md },
  help: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 40 },
  steps: { gap: t.space.sm },
  actions: { gap: t.space.sm },
}));
