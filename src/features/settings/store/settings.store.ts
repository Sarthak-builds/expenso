import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { setGeminiKeyOverride } from '@/lib/ai';
import { mmkvSessionStorage } from '@/lib/storage';
import type { ThemeId } from '@/lib/theme';

type SettingsState = {
  /** A key the user pasted in. `null` means "use whatever the build shipped". */
  apiKey: string | null;
  setApiKey: (apiKey: string | null) => void;
  themeId: ThemeId;
  setThemeId: (themeId: ThemeId) => void;
};

/**
 * User settings.
 *
 * The API key is mirrored into `lib/ai` on every change and on rehydration.
 * Pushing it rather than having the AI client read this store is what keeps
 * the dependency one-way — `lib/` never imports a feature.
 */
export const useSettingsStore = create<SettingsState>()(
  persist<SettingsState, [], [], Pick<SettingsState, 'apiKey' | 'themeId'>>(
    (set) => ({
      apiKey: null,
      setApiKey: (apiKey) => {
        const next = apiKey?.trim() ? apiKey.trim() : null;
        setGeminiKeyOverride(next);
        set({ apiKey: next });
      },

      // Geist stays the default — adding themes should change nothing for
      // someone who never opens Settings.
      themeId: 'geist',
      setThemeId: (themeId) => set({ themeId }),
    }),
    {
      name: 'store:settings',
      storage: createJSONStorage(() => mmkvSessionStorage),
      partialize: (state) => ({ apiKey: state.apiKey, themeId: state.themeId }),
      // Rehydration is where a stored key first becomes known. Without this the
      // override stays empty until the user visits Settings, and the app would
      // quietly fall back to the bundled key for the whole session.
      onRehydrateStorage: () => (state) => setGeminiKeyOverride(state?.apiKey),
    }
  )
);

export const useApiKey = () => useSettingsStore((state) => state.apiKey);
export const useSetApiKey = () => useSettingsStore((state) => state.setApiKey);
export const useThemeSetting = () => useSettingsStore((state) => state.themeId);
export const useSetThemeId = () => useSettingsStore((state) => state.setThemeId);
