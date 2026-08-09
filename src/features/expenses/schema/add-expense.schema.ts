import type { SelectOption, UiSchema } from '@/components/organisms/schema-form';
import { strings } from '@/lib/strings';
import { todayKey } from '@/lib/format';

import { CATEGORY_LIST } from '../model/categories';

/** Built once — the category list is fixed at module load. */
const categoryOptions: SelectOption[] = CATEGORY_LIST.map((category) => ({
  value: category.id,
  label: category.label,
  icon: category.icon,
  color: category.color,
}));

/**
 * The add-expense form, as data.
 *
 * Field order is the order the user thinks in: what it was, how much, which
 * bucket, when. Amount is second rather than first because "Milk" is what the
 * user came to record and the number is the detail.
 */
export const addExpenseSchema: UiSchema = [
  {
    type: 'field',
    kind: 'text',
    name: 'label',
    label: strings.addExpense.labelLabel,
    placeholder: strings.addExpense.labelPlaceholder,
    autoFocus: true,
    rules: [
      { kind: 'required', message: strings.addExpense.errors.missingLabel },
      { kind: 'maxLength', length: 64, message: strings.addExpense.errors.labelTooLong },
    ],
  },
  {
    type: 'field',
    kind: 'amount',
    name: 'amount',
    label: strings.addExpense.amountLabel,
    placeholder: strings.addExpense.amountPlaceholder,
    rules: [
      { kind: 'required', message: strings.addExpense.errors.missingAmount },
      { kind: 'amount', message: strings.addExpense.errors.invalidAmount },
    ],
  },
  {
    type: 'field',
    kind: 'select',
    name: 'categoryId',
    label: strings.addExpense.categoryLabel,
    options: categoryOptions,
    rules: [{ kind: 'required', message: strings.addExpense.errors.missingCategory }],
  },
  {
    type: 'field',
    kind: 'day',
    name: 'day',
    label: strings.addExpense.dateLabel,
  },
  {
    type: 'field',
    kind: 'note',
    name: 'note',
    label: strings.addExpense.noteLabel,
    placeholder: strings.addExpense.notePlaceholder,
    rules: [{ kind: 'maxLength', length: 140, message: strings.addExpense.errors.noteTooLong }],
  },
];

/** Fresh each call — `day` must be today at the moment the form opens. */
export function addExpenseInitialValues() {
  return { label: '', amount: '', categoryId: 'other', day: todayKey(), note: '' };
}
