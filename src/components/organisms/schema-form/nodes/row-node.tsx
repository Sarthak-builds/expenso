import { ListRow } from '@/components/molecules';

import { useSchemaFormContext } from '../context';
import type { UiNode } from '../types';

/** A settings line: label, optional description and value, optional action. */
function RowNode({ node }: { node: Extract<UiNode, { type: 'row' }> }) {
  const { onAction } = useSchemaFormContext();

  return (
    <ListRow
      title={node.label}
      subtitle={node.description}
      value={node.value}
      destructive={node.destructive}
      // Only rows that declare an `actionId` are pressable — a row showing the
      // app version should not depress under a finger.
      onPress={node.actionId ? () => onAction?.(node.actionId!) : undefined}
    />
  );
}

export { RowNode };
