import * as React from 'react';
import { View } from 'react-native';

import { SectionHeader } from '@/components/molecules';

import { ActionNode } from './nodes/action-node';
import { FieldNode } from './nodes/field-node';
import { NoteNode } from './nodes/note-node';
import { RowNode } from './nodes/row-node';
import type { UiNode } from './types';

/**
 * Node type → component.
 *
 * The mapped type is what makes this safe: `UiNode` is a discriminated union,
 * so a new member of it is a compile error here until a renderer exists for it.
 * The registry cannot silently fall through to nothing.
 */
type NodeRenderers = {
  [K in UiNode['type']]: React.ComponentType<{ node: Extract<UiNode, { type: K }> }>;
};

/** Recursion lives here rather than in a leaf, so nothing imports upward. */
function SectionNode({ node }: { node: Extract<UiNode, { type: 'section' }> }) {
  return (
    <View className="gap-4">
      {node.title ? <SectionHeader title={node.title} /> : null}
      <View className="gap-4">
        {node.children.map((child) => (
          <RenderNode key={nodeKey(child)} node={child} />
        ))}
      </View>
    </View>
  );
}

const NODE_RENDERERS: NodeRenderers = {
  section: SectionNode,
  field: FieldNode,
  row: RowNode,
  action: ActionNode,
  note: NoteNode,
};

/** Fields key on `name`; everything else carries an explicit `id`. */
export function nodeKey(node: UiNode): string {
  return node.type === 'field' ? `field:${node.name}` : `${node.type}:${node.id}`;
}

function RenderNode({ node }: { node: UiNode }) {
  const Renderer = NODE_RENDERERS[node.type] as React.ComponentType<{ node: UiNode }>;
  return <Renderer node={node} />;
}

export { RenderNode };
