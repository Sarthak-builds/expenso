type Listener = () => void;

const listeners = new Set<Listener>();

/**
 * Change notification for the expense repository.
 *
 * The repository is pure and synchronous and knows nothing about React. The
 * store needs to bump its `revision` whenever the repository writes, but if the
 * repository imported the store the two modules would form a require cycle.
 *
 * A one-line notifier breaks it: the repository announces, the store listens.
 * See docs/adr/0002-state-management.md
 */
export function onExpensesChanged(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Fired ONCE per committed mutation, as its last step — never per key touched.
 * One `addExpense` writes 3–4 keys; firing per key would render 3–4 times.
 */
export function notifyExpensesChanged(): void {
  for (const listener of listeners) listener();
}

/**
 * Forces every derived view to recompute from storage.
 *
 * Same mechanism as a write, with no write — it is what pull-to-refresh calls.
 * Strictly speaking nothing can go stale in a single-process app with one
 * writer, so this is a manual escape hatch rather than a correctness measure:
 * if a screen ever does look wrong, the user has a way to make it re-read
 * instead of force-quitting.
 */
export function refreshExpenses(): void {
  notifyExpensesChanged();
}
