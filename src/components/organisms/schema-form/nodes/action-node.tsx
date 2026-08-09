import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

import { useSchemaFormContext } from '../context';
import type { UiNode } from '../types';

/** A button declared by the schema. Handling stays with the screen. */
function ActionNode({ node }: { node: Extract<UiNode, { type: 'action' }> }) {
  const { onAction } = useSchemaFormContext();

  return (
    <Button
      variant={node.destructive ? 'destructive' : (node.variant ?? 'default')}
      onPress={() => onAction?.(node.id)}>
      <Text>{node.label}</Text>
    </Button>
  );
}

export { ActionNode };
