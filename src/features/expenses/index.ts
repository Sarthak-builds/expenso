/**
 * The expenses feature's public surface.
 *
 * `features/chat` may import from here — that is the one sanctioned
 * cross-feature edge, and it is one-way. Nothing in expenses imports chat.
 */
export { AddExpenseScreen } from './screens/add-expense-screen';
export type { AddExpenseSeed } from './screens/add-expense-screen';
export { DashboardScreen } from './screens/dashboard-screen';

export { addExpense, clearAllExpenses, countAll, migrateIfNeeded, repair } from './data/expense.repository';
export { buildSpendDigest } from './data/digest';
export { refreshExpenses } from './data/changes';
export { useExpenseCount } from './hooks/useExpenseCount';
export { CATEGORIES, CATEGORY_LIST, categoryMeta } from './model/categories';
export { useRevision } from './store/expenses.store';

export { CATEGORY_IDS, isCategoryId } from './model/types';
export type { CategoryId, DayKey, Expense, ExpenseDraft } from './model/types';
