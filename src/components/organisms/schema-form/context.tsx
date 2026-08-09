import * as React from 'react';

import type { FormErrors, FormValues } from './types';

type SchemaFormContextValue = {
  values: FormValues;
  errors: FormErrors;
  setValue: (name: string, value: string) => void;
  /** Fires for `action` nodes and pressable `row` nodes, by node id. */
  onAction?: (id: string) => void;
};

const SchemaFormContext = React.createContext<SchemaFormContextValue | null>(null);

/**
 * The provider is the only thing that knows how form state is managed.
 *
 * Nodes read what they need from context instead of receiving it through
 * however many `section` levels sit above them, so adding a nesting level
 * never means threading four more props through it. Swapping `useSchemaForm`
 * for something else later touches this file and nothing that renders.
 */
function SchemaFormProvider({
  children,
  ...value
}: SchemaFormContextValue & { children: React.ReactNode }) {
  return <SchemaFormContext.Provider value={value}>{children}</SchemaFormContext.Provider>;
}

function useSchemaFormContext(): SchemaFormContextValue {
  // React 19: `use()` supersedes `useContext()`.
  const context = React.use(SchemaFormContext);
  if (!context) {
    throw new Error('Schema form nodes must be rendered inside <SchemaForm>.');
  }
  return context;
}

/** Everything one field needs, and nothing else — keeps re-render scope tight. */
function useField(name: string) {
  const { values, errors, setValue } = useSchemaFormContext();
  return {
    value: values[name] ?? '',
    error: errors[name],
    setValue: React.useCallback((next: string) => setValue(name, next), [name, setValue]),
  };
}

export { SchemaFormProvider, useField, useSchemaFormContext };
export type { SchemaFormContextValue };
