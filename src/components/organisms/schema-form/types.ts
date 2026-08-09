/**
 * The UI description language.
 *
 * Screens declare *what* they contain as data; this package decides how it
 * renders. Login, Add expense and Settings are three schemas over one renderer
 * rather than three hand-built layouts, so label placement, error styling,
 * spacing and keyboard behaviour cannot drift apart between them.
 *
 * Two constraints keep it honest:
 *
 * 1. **Every value is a string.** Form state is `Record<string, string>` — the
 *    exact shape JSON gives you. Parsing to paise or a `DayKey` happens at the
 *    feature boundary on submit, never inside the renderer.
 * 2. **No domain types.** A node knows about `options` and `rules`, never about
 *    `CategoryId` or `Expense`. That is what lets this live in `components/`.
 */

/** Form state. Flat and stringly-typed on purpose — see above. */
export type FormValues = Record<string, string>;

export type FormErrors = Record<string, string | undefined>;

/**
 * A validation rule. Messages are passed in rather than derived, because every
 * user-facing string in this app comes from `lib/strings`.
 */
export type Rule =
  | { kind: 'required'; message: string }
  | { kind: 'digits'; length: number; message: string }
  | { kind: 'amount'; message: string }
  | { kind: 'maxLength'; length: number; message: string };

export type SelectOption = {
  value: string;
  label: string;
  /** Accent for the option's icon when unselected. Carries a series colour. */
  color?: string;
  /** Resolved by the schema's author; the renderer just draws it. */
  icon?: import('lucide-react-native').LucideIcon;
};

type FieldBase = {
  type: 'field';
  name: string;
  label: string;
  placeholder?: string;
  hint?: string;
  rules?: readonly Rule[];
  /** Focuses this field when the form mounts. At most one per schema. */
  autoFocus?: boolean;
};

export type FieldNode =
  | (FieldBase & { kind: 'text' })
  | (FieldBase & { kind: 'note' })
  | (FieldBase & { kind: 'phone' })
  | (FieldBase & { kind: 'pin' })
  | (FieldBase & { kind: 'amount' })
  | (FieldBase & { kind: 'select'; options: readonly SelectOption[] })
  /** Renders the last `days` days as chips. See the ADR on why not a calendar. */
  | (FieldBase & { kind: 'day'; days?: number });

export type UiNode =
  | { type: 'section'; id: string; title?: string; children: readonly UiNode[] }
  | FieldNode
  /** A read-only line of key/value, optionally pressable. Settings uses these. */
  | {
      type: 'row';
      id: string;
      label: string;
      description?: string;
      value?: string;
      actionId?: string;
      destructive?: boolean;
    }
  | { type: 'action'; id: string; label: string; variant?: 'default' | 'outline'; destructive?: boolean }
  | { type: 'note'; id: string; text: string };

export type UiSchema = readonly UiNode[];

/** Every field in a schema, flattened out of its sections. */
export function collectFields(schema: UiSchema): FieldNode[] {
  const fields: FieldNode[] = [];
  for (const node of schema) {
    if (node.type === 'field') fields.push(node);
    else if (node.type === 'section') fields.push(...collectFields(node.children));
  }
  return fields;
}
