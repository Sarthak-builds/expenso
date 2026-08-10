import { useSession, useSignOut } from '@/features/auth';
import { clearAllExpenses, refreshExpenses, useExpenseCount } from '@/features/expenses';
import { SettingsScreen } from '@/features/settings';

/**
 * Settings, auth and expenses are siblings that must not import each other.
 * The route is where the three are allowed to meet.
 */
export default function SettingsRoute() {
  const session = useSession();
  const signOut = useSignOut();
  const expenseCount = useExpenseCount();

  return (
    <SettingsScreen
      phone={session?.phone ?? '—'}
      expenseCount={expenseCount}
      onLogOut={signOut}
      onResetData={clearAllExpenses}
      onRefresh={refreshExpenses}
    />
  );
}
