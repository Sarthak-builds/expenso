import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { setGeminiKeyOverride } from '@/lib/ai';
import { mmkvSessionStorage } from '@/lib/storage';

type SettingsState = {
  /** A key the user pasted in. `null` means "use whatever the build shipped". */
  apiKey: string | null;
  setApiKey: (apiKey: string | null) => void;
};

/**
 * User settings.
 *
 * The API key is mirrored into `lib/ai` on every change and on rehydration.
 * Pushing it rather than having the AI client read this store is what keeps
 * the dependency one-way — `lib/` never imports a feature.
 */
export const useSettingsStore = create<SettingsState>()(
  persist<SettingsState, [], [], Pick<SettingsState, 'apiKey'>>(
    (set) => ({
      apiKey: null,
      setApiKey: (apiKey) => {
        const next = apiKey?.trim() ? apiKey.trim() : null;
        setGeminiKeyOverride(next);
        set({ apiKey: next });
      },
    }),
    {
      name: 'store:settings',
      storage: createJSONStorage(() => mmkvSessionStorage),
      partialize: (state) => ({ apiKey: state.apiKey }),
      // Rehydration is where a stored key first becomes known. Without this the
      // override stays empty until the user visits Settings, and the app would
      // quietly fall back to the bundled key for the whole session.
      onRehydrateStorage: () => (state) => setGeminiKeyOverride(state?.apiKey),
    }
  )
);

export const useApiKey = () => useSettingsStore((state) => state.apiKey);
export const useSetApiKey = () => useSettingsStore((state) => state.setApiKey);
