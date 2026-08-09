import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { mmkvSessionStorage } from '@/lib/storage';

import { onExpensesChanged } from '../data/changes';
import type { RangeId } from '../model/types';

/**
 * UI state for expenses — and NOT the expenses themselves.
 *
 * The store holds a `revision` counter and the selected window. Everything the
 * dashboard renders is derived from the repository during render, keyed on
 * `[rangeId, revision]`. Putting the expense array in here would pin the whole
 * collection in the JS heap and re-serialise it on every add, which is the
 * exact thing MMKV exists to avoid. See docs/adr/0002-state-management.md
 */
type ExpensesState = {
  /** Manual invalidation signal. Only `notifyExpensesChanged` moves it. */
  revision: number;
  rangeId: RangeId;
  setRange: (rangeId: RangeId) => void;
};

/**
 * `revision` is a session-local invalidation signal, not user data — persisting
 * it would restore a stale count on next launch. Only the window survives.
 */
type PersistedExpensesState = Pick<ExpensesState, 'rangeId'>;

export const useExpensesStore = create<ExpensesState>()(
  persist<ExpensesState, [], [], PersistedExpensesState>(
    (set) => ({
      revision: 0,
      rangeId: 'd30',
      setRange: (rangeId) => set({ rangeId }),
    }),
    {
      name: 'store:expenses-ui',
      storage: createJSONStorage(() => mmkvSessionStorage),
      partialize: (state) => ({ rangeId: state.rangeId }),
    }
  )
);

/**
 * Wired once at module load. The repository fires exactly one change event per
 * committed mutation, so this is one re-render per write — not one per key.
 */
onExpensesChanged(() => {
  useExpensesStore.setState((state) => ({ revision: state.revision + 1 }));
});

/**
 * Zustand v5 dropped default shallow equality: a selector returning a fresh
 * object or array re-renders forever. These select primitives, which is why
 * they are exported as individual hooks rather than one `useExpensesStore()`.
 */
export const useRevision = () => useExpensesStore((state) => state.revision);
export const useRangeId = () => useExpensesStore((state) => state.rangeId);
export const useSetRange = () => useExpensesStore((state) => state.setRange);
