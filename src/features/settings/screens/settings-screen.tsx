import * as React from 'react';
import { Alert, RefreshControl, ScrollView } from 'react-native';
import Constants from 'expo-constants';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/molecules';
import { SchemaForm, useSchemaForm } from '@/components/organisms/schema-form';
import { geminiKeySource } from '@/lib/ai';
import { useRefreshControl } from '@/lib/hooks/use-refresh-control';
import { strings } from '@/lib/strings';
import { isThemeId, useThemeColors } from '@/lib/theme';

import { buildSettingsSchema, type SettingsAction } from '../schema/settings.schema';
import { useApiKey, useSetApiKey, useSetThemeId, useThemeSetting } from '../store/settings.store';

type SettingsScreenProps = {
  /** Supplied by the route. Settings does not import auth — see CLAUDE.md. */
  phone: string;
  expenseCount: number;
  onLogOut: () => void;
  onResetData: () => void;
  /** Pull-to-refresh. Re-reads the stored expense count. */
  onRefresh: () => void;
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
  onRefresh,
}: SettingsScreenProps) {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const refresh = useRefreshControl(onRefresh);
  const apiKey = useApiKey();
  const setApiKey = useSetApiKey();
  const themeId = useThemeSetting();
  const setThemeId = useSetThemeId();

  const initialValues = React.useMemo(
    () => ({ apiKey: apiKey ?? '', themeId }),
    [apiKey, themeId]
  );
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

  /**
   * Theme applies on tap, not on a Save button.
   *
   * A colour choice you cannot see until you commit it is a guess. Everything
   * else on this screen is text that needs confirming before it takes effect;
   * this one is its own preview, so it commits straight to the store and the
   * whole app repaints under the picker.
   */
  const handleSetValue = React.useCallback(
    (name: string, value: string) => {
      form.setValue(name, value);
      if (name === 'themeId' && isThemeId(value)) setThemeId(value);
    },
    [form, setThemeId]
  );

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
      contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 40 }}
      contentContainerClassName="gap-6 px-4"
      refreshControl={
        <RefreshControl
          {...refresh}
          tintColor={colors.accent}
          colors={[colors.accent]}
          progressBackgroundColor={colors.background}
        />
      }>
      <ScreenHeader title={strings.settings.title} />

      <SchemaForm
        schema={schema}
        values={form.values}
        errors={form.errors}
        setValue={handleSetValue}
        onAction={handleAction}
      />
    </ScrollView>
  );
}
