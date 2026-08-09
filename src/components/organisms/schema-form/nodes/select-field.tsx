import { View } from 'react-native';

import { Chip, FieldShell } from '@/components/molecules';

import { useField } from '../context';
import type { FieldNode } from '../types';

/**
 * A wrapped grid of chips, not a dropdown.
 *
 * The one select in this app has eight options and sits in the middle of an
 * entry flow the user repeats several times a day. A dropdown costs a tap to
 * open, a scroll, and a tap to choose; chips cost one tap and show every option
 * without hiding the rest of the form behind a sheet.
 *
 * This stops being the right control somewhere north of a dozen options.
 */
function SelectField({ node }: { node: Extract<FieldNode, { kind: 'select' }> }) {
  const { value, error, setValue } = useField(node.name);

  return (
    <FieldShell label={node.label} hint={node.hint} error={error}>
      <View className="flex-row flex-wrap gap-2">
        {node.options.map((option) => (
          <Chip
            key={option.value}
            label={option.label}
            icon={option.icon}
            accentColor={option.color}
            selected={option.value === value}
            onPress={() => setValue(option.value)}
          />
        ))}
      </View>
    </FieldShell>
  );
}

export { SelectField };
