import { parseAmountToMinor } from '@/lib/format';

import { collectFields, type FormErrors, type FormValues, type Rule, type UiSchema } from './types';

/**
 * Rule evaluation, kept separate from both the state hook and the renderer.
 *
 * Pure `(value, rule) => message | undefined`, so the same rules can be checked
 * on submit, on blur, or in a test without a component in sight.
 */
export function checkRule(value: string, rule: Rule): string | undefined {
  const trimmed = value.trim();

  switch (rule.kind) {
    case 'required':
      return trimmed.length > 0 ? undefined : rule.message;

    case 'digits':
      // Length AND digit-only in one rule: "enter all 10 digits" is the same
      // correction whether the user typed 9 digits or 10 characters of which
      // one was a dash, and two separate errors for that would be pedantic.
      return trimmed.length === rule.length && /^\d+$/.test(trimmed) ? undefined : rule.message;

    case 'amount': {
      const minor = parseAmountToMinor(trimmed);
      return minor !== null && minor > 0 ? undefined : rule.message;
    }

    case 'maxLength':
      return trimmed.length <= rule.length ? undefined : rule.message;
  }
}

/** First failing rule per field. One error at a time is enough to act on. */
export function validateSchema(schema: UiSchema, values: FormValues): FormErrors {
  const errors: FormErrors = {};

  for (const field of collectFields(schema)) {
    if (!field.rules) continue;
    const value = values[field.name] ?? '';
    for (const rule of field.rules) {
      const message = checkRule(value, rule);
      if (message) {
        errors[field.name] = message;
        break;
      }
    }
  }

  return errors;
}

export function hasErrors(errors: FormErrors): boolean {
  return Object.values(errors).some((message) => message !== undefined);
}
