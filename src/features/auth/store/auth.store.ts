import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { mmkvSessionStorage, sessionStorage } from '@/lib/storage';

import type { Session } from '../model/types';

type AuthState = {
  session: Session | null;
  signIn: (session: Session) => void;
  signOut: () => void;
};

/**
 * Who has this device unlocked.
 *
 * `persist` is correct here — one small object, rewritten whole, and MMKV is
 * synchronous so it rehydrates before first paint. An async store would flash
 * the login screen on every cold start. See docs/adr/0002-state-management.md
 */
export const useAuthStore = create<AuthState>()(
  persist<AuthState, [], [], Pick<AuthState, 'session'>>(
    (set) => ({
      session: null,
      signIn: (session) => set({ session }),
      signOut: () => {
        // Wipes auth, settings and chat in one call. Expenses live in a
        // separate MMKV instance precisely so this cannot reach them —
        // see docs/adr/0001-local-first-storage.md
        sessionStorage.clearAll();
        set({ session: null });
      },
    }),
    {
      name: 'store:auth',
      storage: createJSONStorage(() => mmkvSessionStorage),
      partialize: (state) => ({ session: state.session }),
    }
  )
);

// Primitive selectors — zustand v5 has no default shallow equality, so a
// selector returning a fresh object re-renders forever.
export const useSession = () => useAuthStore((state) => state.session);
export const useIsUnlocked = () => useAuthStore((state) => state.session !== null);
export const useSignIn = () => useAuthStore((state) => state.signIn);
export const useSignOut = () => useAuthStore((state) => state.signOut);
