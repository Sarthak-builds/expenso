import type { SelectOption, UiSchema } from '@/components/organisms/schema-form';
import { strings } from '@/lib/strings';
import { THEME_COLORS, THEME_IDS } from '@/lib/theme';

/**
 * Each theme's chip carries its own accent, so the choice is legible before
 * you make it rather than three identical pills with different words on them.
 */
const themeOptions: SelectOption[] = THEME_IDS.map((id) => ({
  value: id,
  label: strings.settings.themes[id],
  color: THEME_COLORS[id].accent,
}));

/** Action ids the settings screen handles. Kept as a union so a typo is a
 *  compile error rather than a button that silently does nothing. */
export type SettingsAction = 'save-key' | 'clear-key' | 'reset-data' | 'log-out';

const KEY_SOURCE_LABEL = {
  custom: strings.settings.apiKeySourceCustom,
  bundled: strings.settings.apiKeySourceBundled,
  none: strings.settings.apiKeySourceNone,
} as const;

type SettingsSchemaInput = {
  phone: string;
  keySource: keyof typeof KEY_SOURCE_LABEL;
  hasCustomKey: boolean;
  expenseCount: number;
  version: string;
};

/**
 * Settings, as data.
 *
 * A function rather than a constant because three of these sections depend on
 * runtime state — which key is active, how many records exist, who is signed
 * in. The screen still describes *what* it contains and never *how* it draws.
 */
export function buildSettingsSchema({
  phone,
  keySource,
  hasCustomKey,
  expenseCount,
  version,
}: SettingsSchemaInput): UiSchema {
  return [
    {
      type: 'section',
      id: 'account',
      title: strings.settings.account,
      children: [
        { type: 'row', id: 'phone', label: strings.settings.signedInAs, value: phone },
        {
          type: 'action',
          id: 'log-out' satisfies SettingsAction,
          label: strings.settings.logout,
          variant: 'outline',
        },
      ],
    },
    {
      type: 'section',
      id: 'ai',
      title: strings.settings.ai,
      children: [
        {
          type: 'field',
          kind: 'text',
          name: 'apiKey',
          label: strings.settings.apiKeyLabel,
          placeholder: strings.settings.apiKeyPlaceholder,
          hint: strings.settings.apiKeyHelp,
        },
        { type: 'note', id: 'key-source', text: KEY_SOURCE_LABEL[keySource] },
        {
          type: 'action',
          id: 'save-key' satisfies SettingsAction,
          label: strings.settings.apiKeySave,
        },
        // Only offered when there is something to clear — a disabled button
        // the user cannot explain is worse than no button.
        ...(hasCustomKey
          ? ([
              {
                type: 'action',
                id: 'clear-key' satisfies SettingsAction,
                label: strings.settings.apiKeyClear,
                variant: 'outline',
              },
            ] as const)
          : []),
      ],
    },
    {
      type: 'section',
      id: 'appearance',
      title: strings.settings.appearance,
      children: [
        {
          type: 'field',
          kind: 'select',
          name: 'themeId',
          label: strings.settings.theme,
          hint: strings.settings.themeHelp,
          options: themeOptions,
        },
      ],
    },
    {
      type: 'section',
      id: 'data',
      title: strings.settings.data,
      children: [
        {
          type: 'row',
          id: 'count',
          label: strings.settings.storedExpenses,
          value: String(expenseCount),
        },
        {
          type: 'action',
          id: 'reset-data' satisfies SettingsAction,
          label: strings.settings.resetData,
          destructive: true,
        },
      ],
    },
    {
      type: 'section',
      id: 'about',
      title: strings.settings.about,
      children: [{ type: 'row', id: 'version', label: strings.settings.version, value: version }],
    },
  ];
}
