import * as React from 'react';

import type { FormErrors, FormValues, UiSchema } from './types';
import { hasErrors, validateSchema } from './validate';

type UseSchemaFormOptions = {
  schema: UiSchema;
  initialValues: FormValues;
};

export type SchemaFormApi = {
  values: FormValues;
  errors: FormErrors;
  setValue: (name: string, value: string) => void;
  /** Validates everything and returns the values only if all rules pass. */
  submit: () => FormValues | null;
  reset: (values?: FormValues) => void;
};

/**
 * Form state for a schema.
 *
 * Errors appear on submit, not on keystroke. Validating as the user types
 * means telling them their phone number is too short while they are still
 * typing it — the field is *incomplete*, not wrong. Once a field has an error
 * it re-validates on every change, so the message clears the moment it is
 * fixed rather than waiting for another submit.
 */
export function useSchemaForm({ schema, initialValues }: UseSchemaFormOptions): SchemaFormApi {
  const [values, setValues] = React.useState<FormValues>(initialValues);
  const [errors, setErrors] = React.useState<FormErrors>({});

  const setValue = React.useCallback(
    (name: string, value: string) => {
      setValues((current) => {
        const next = { ...current, [name]: value };
        setErrors((currentErrors) =>
          currentErrors[name] === undefined
            ? currentErrors
            : { ...currentErrors, [name]: validateSchema(schema, next)[name] }
        );
        return next;
      });
    },
    [schema]
  );

  const submit = React.useCallback(() => {
    const found = validateSchema(schema, values);
    setErrors(found);
    return hasErrors(found) ? null : values;
  }, [schema, values]);

  const reset = React.useCallback(
    (next?: FormValues) => {
      setValues(next ?? initialValues);
      setErrors({});
    },
    [initialValues]
  );

  return { values, errors, setValue, submit, reset };
}
