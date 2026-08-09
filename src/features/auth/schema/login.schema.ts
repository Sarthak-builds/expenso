import type { UiSchema } from '@/components/organisms/schema-form';
import { strings } from '@/lib/strings';

/**
 * The unlock form, as data.
 *
 * Field kinds carry the keyboard configuration, so `phone` gets a number pad,
 * a 10-digit cap and telephone autofill without this file saying any of that.
 */
export const loginSchema: UiSchema = [
  {
    type: 'field',
    kind: 'phone',
    name: 'phone',
    label: strings.auth.phoneLabel,
    placeholder: strings.auth.phonePlaceholder,
    autoFocus: true,
    rules: [
      { kind: 'required', message: strings.auth.errors.incompletePhone },
      { kind: 'digits', length: 10, message: strings.auth.errors.incompletePhone },
    ],
  },
  {
    type: 'field',
    kind: 'pin',
    name: 'pin',
    label: strings.auth.pinLabel,
    placeholder: strings.auth.pinPlaceholder,
    rules: [
      { kind: 'required', message: strings.auth.errors.incompletePin },
      { kind: 'digits', length: 4, message: strings.auth.errors.incompletePin },
    ],
  },
];

export const loginInitialValues = { phone: '', pin: '' };
