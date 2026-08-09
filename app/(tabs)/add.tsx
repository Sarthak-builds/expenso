import { useLocalSearchParams } from 'expo-router';

import { AddExpenseScreen, type AddExpenseSeed } from '@/features/expenses';

/** Params arrive when the user taps "Edit first" on a chat suggestion. */
export default function AddRoute() {
  const seed = useLocalSearchParams<AddExpenseSeed>();
  return <AddExpenseScreen seed={seed} />;
}
