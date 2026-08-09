import type { TextInputProps } from 'react-native';

import { FieldShell } from '@/components/molecules';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils/cn';

import { useField } from '../context';
import type { FieldNode } from '../types';

type TextKind = 'text' | 'note' | 'phone' | 'pin' | 'amount';

/**
 * Keyboard configuration per field kind, in one table.
 *
 * This is most of the value of describing forms as data: getting
 * `keyboardType`, `maxLength` and `autoComplete` right is fiddly and easy to
 * forget, and here it is done once for every phone field the app will ever
 * have rather than at each call site.
 */
const INPUT_PROPS: Record<TextKind, TextInputProps> = {
  text: {
    autoCapitalize: 'sentences',
    autoCorrect: true,
  },
  note: {
    autoCapitalize: 'sentences',
    multiline: true,
    numberOfLines: 3,
  },
  phone: {
    keyboardType: 'number-pad',
    autoComplete: 'tel',
    textContentType: 'telephoneNumber',
    maxLength: 10,
  },
  pin: {
    keyboardType: 'number-pad',
    secureTextEntry: true,
    autoComplete: 'off',
    maxLength: 4,
  },
  amount: {
    // `decimal-pad` and not `numeric`: `numeric` puts a full calculator keypad
    // on Android, signs and all, and a negative expense is not a thing.
    keyboardType: 'decimal-pad',
    autoComplete: 'off',
  },
};

/** Digits only for the fields whose rules demand digits, enforced as you type. */
const DIGITS_ONLY: Partial<Record<TextKind, true>> = { phone: true, pin: true };

function TextField({ node }: { node: Extract<FieldNode, { kind: TextKind }> }) {
  const { value, error, setValue } = useField(node.name);
  const kind = node.kind as TextKind;

  const handleChange = (next: string) => {
    setValue(DIGITS_ONLY[kind] ? next.replace(/\D/g, '') : next);
  };

  const Control = kind === 'note' ? Textarea : Input;

  return (
    <FieldShell label={node.label} hint={node.hint} error={error}>
      <Control
        value={value}
        onChangeText={handleChange}
        placeholder={node.placeholder}
        autoFocus={node.autoFocus}
        aria-invalid={error !== undefined}
        className={cn(
          error && 'border-red',
          // Amounts are the figure the user is here to enter — give them the
          // room, and mono so digits do not reflow as they are typed.
          kind === 'amount' && 'h-14 font-mono text-heading-24'
        )}
        {...INPUT_PROPS[kind]}
      />
    </FieldShell>
  );
}

export { TextField };
