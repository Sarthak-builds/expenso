import { Text } from '@/components/ui/text';

import type { UiNode } from '../types';

/** Explanatory copy between controls — consent notes, storage caveats. */
function NoteNode({ node }: { node: Extract<UiNode, { type: 'note' }> }) {
  return <Text className="text-copy-14 text-accents-5">{node.text}</Text>;
}

export { NoteNode };
