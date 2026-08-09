import * as React from 'react';
import { Alert, ScrollView } from 'react-native';
import Constants from 'expo-constants';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SchemaForm, useSchemaForm } from '@/components/organisms/schema-form';
import { Text } from '@/components/ui/text';
import { geminiKeySource } from '@/lib/ai';
import { strings } from '@/lib/strings';

import { buildSettingsSchema, type SettingsAction } from '../schema/settings.schema';
import { useApiKey, useSetApiKey } from '../store/settings.store';

type SettingsScreenProps = {
  /** Supplied by the route. Settings does not import auth — see CLAUDE.md. */
  phone: string;
  expenseCount: number;
  onLogOut: () => void;
  onResetData: () => void;
};

/**
 * Settings.
 *
 * Everything domain-owned arrives as a prop. `settings`, `auth` and `expenses`
 * are siblings with no cross-feature imports between them, so the route file
 * is what wires the three together — which is exactly the job a route has.
 *
 * Both destructive actions confirm through a native `Alert`, and both say what
 * will happen rather than asking "are you sure".
 */
export function SettingsScreen({
  phone,
  expenseCount,
  onLogOut,
  onResetData,
}: SettingsScreenProps) {
  const insets = useSafeAreaInsets();
  const apiKey = useApiKey();
  const setApiKey = useSetApiKey();

  const initialValues = React.useMemo(() => ({ apiKey: apiKey ?? '' }), [apiKey]);
  const schema = React.useMemo(
    () =>
      buildSettingsSchema({
        phone,
        keySource: geminiKeySource(),
        hasCustomKey: apiKey !== null,
        expenseCount,
        version: Constants.expoConfig?.version ?? '—',
      }),
    [apiKey, expenseCount, phone]
  );

  const form = useSchemaForm({ schema, initialValues });

  const handleAction = React.useCallback(
    (id: string) => {
      switch (id as SettingsAction) {
        case 'save-key':
          setApiKey(form.values.apiKey ?? '');
          return;

        case 'clear-key':
          setApiKey(null);
          form.reset({ apiKey: '' });
          return;

        case 'reset-data':
          Alert.alert(strings.settings.resetDataTitle, strings.settings.resetDataConfirm, [
            { text: strings.common.cancel, style: 'cancel' },
            { text: strings.common.delete, style: 'destructive', onPress: onResetData },
          ]);
          return;

        case 'log-out':
          Alert.alert(strings.settings.logoutTitle, strings.settings.logoutConfirm, [
            { text: strings.common.cancel, style: 'cancel' },
            { text: strings.settings.logout, style: 'destructive', onPress: onLogOut },
          ]);
      }
    },
    [form, onLogOut, onResetData, setApiKey]
  );

  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 32 }}
      contentContainerClassName="gap-6 px-4">
      <Text className="font-bold text-heading-40 text-foreground">{strings.settings.title}</Text>

      <SchemaForm
        schema={schema}
        values={form.values}
        errors={form.errors}
        setValue={form.setValue}
        onAction={handleAction}
      />
    </ScrollView>
  );
}
