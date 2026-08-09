/**
 * Single source of truth for every user-facing string in the app.
 *
 * A string literal rendered in a component is a bug — import from here instead.
 * One locale, so a typed frozen object beats an i18n library: key lookups are
 * checked at compile time and there is no runtime cost.
 *
 * Copy rules (from the `frontend-design` skill): active voice, name the actual
 * action ("Save expense", not "Submit"), keep the same verb through a flow, and
 * make errors say what broke and how to fix it.
 */
export const strings = {
  app: {
    name: 'Expenso',
  },

  common: {
    cancel: 'Cancel',
    confirm: 'Confirm',
    edit: 'Edit',
    delete: 'Delete',
    save: 'Save',
    retry: 'Try again',
    close: 'Close',
    today: 'Today',
    yesterday: 'Yesterday',
    loading: 'Loading',
  },

  auth: {
    title: 'Expenso',
    subtitle: 'Enter your number and PIN to unlock',
    phoneLabel: 'Phone number',
    phonePlaceholder: '10-digit number',
    pinLabel: 'PIN',
    pinPlaceholder: '4-digit PIN',
    unlock: 'Unlock',
    errors: {
      unknownNumber: 'That number is not set up on this device.',
      wrongPin: 'Wrong PIN. Try again.',
      incompletePhone: 'Enter all 10 digits of your number.',
      incompletePin: 'Enter all 4 digits of your PIN.',
      notConfigured:
        'This build has no device lock configured. Add the values to .env and restart with --clear.',
    },
  },

  tabs: {
    dashboard: 'Dashboard',
    add: 'Add',
    chat: 'Chat',
    settings: 'Settings',
  },

  dashboard: {
    title: 'Dashboard',
    totalSpent: 'Total spent',
    dailyAverage: 'Daily average',
    entries: 'Entries',
    byCategory: 'By category',
    spendOverTime: 'Spend over time',
    recent: 'Recent',
    ranges: {
      d7: '7d',
      d30: '30d',
      d60: '60d',
      d180: '180d',
    },
    rangeLabels: {
      d7: 'Last 7 days',
      d30: 'Last 30 days',
      d60: 'Last 60 days',
      d180: 'Last 180 days',
    },
    empty: {
      title: 'No expenses yet',
      body: 'Add your first expense and it will show up here.',
      action: 'Add an expense',
    },
  },

  addExpense: {
    title: 'Add expense',
    labelLabel: 'What for',
    labelPlaceholder: 'Milk, electricity bill, auto fare…',
    amountLabel: 'Amount',
    amountPlaceholder: '0',
    categoryLabel: 'Category',
    dateLabel: 'Date',
    noteLabel: 'Note',
    notePlaceholder: 'Optional',
    submit: 'Save expense',
    saved: 'Expense saved',
    errors: {
      missingLabel: 'Say what the expense was for.',
      missingAmount: 'Enter an amount greater than zero.',
      invalidAmount: 'That amount is not a valid number.',
    },
  },

  categories: {
    food: 'Food',
    groceries: 'Groceries',
    transport: 'Transport',
    bills: 'Bills',
    shopping: 'Shopping',
    health: 'Health',
    entertainment: 'Entertainment',
    other: 'Other',
  },

  chat: {
    title: 'Chat',
    placeholder: 'Add an expense or ask about your spending',
    send: 'Send',
    thinking: 'Thinking…',
    confirmCard: {
      title: 'Add this expense?',
      confirm: 'Add expense',
      edit: 'Edit first',
      added: 'Added',
    },
    empty: {
      title: 'Ask about your spending',
      body: 'Try "milk 30" to add an expense, or "how much on groceries last month?"',
    },
    errors: {
      noKey: 'Add a Gemini API key in Settings to use chat.',
      invalidKey: 'That Gemini API key was rejected. Check it in Settings.',
      rateLimited: 'Too many requests. Wait a moment and try again.',
      network: 'Could not reach Gemini. Check your connection.',
      unexpected: 'Something went wrong. Try again.',
    },
  },

  settings: {
    title: 'Settings',
    account: 'Account',
    signedInAs: 'Signed in as',
    logout: 'Log out',
    ai: 'AI',
    apiKeyLabel: 'Gemini API key',
    apiKeyPlaceholder: 'Paste your key',
    apiKeyHelp:
      'Stored on this device only. Overrides the key the app was built with.',
    apiKeySourceBundled: 'Using the built-in key',
    apiKeySourceCustom: 'Using your key',
    apiKeyClear: 'Clear key',
    data: 'Data',
    resetData: 'Delete all expenses',
    resetDataConfirm:
      'This permanently deletes every expense on this device. It cannot be undone.',
    about: 'About',
    version: 'Version',
  },
} as const;

export type Strings = typeof strings;
