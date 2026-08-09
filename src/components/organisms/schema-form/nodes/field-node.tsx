import type { FieldNode as FieldNodeType } from '../types';
import { DayField } from './day-field';
import { SelectField } from './select-field';
import { TextField } from './text-field';

/**
 * Dispatches a field to its control.
 *
 * Adding a field kind means a new case here and a new member of the `FieldNode`
 * union — and TypeScript will not let you add one without the other, because
 * the union is exhaustive and the default branch is unreachable.
 */
function FieldNode({ node }: { node: FieldNodeType }) {
  switch (node.kind) {
    case 'select':
      return <SelectField node={node} />;
    case 'day':
      return <DayField node={node} />;
    default:
      return <TextField node={node} />;
  }
}

export { FieldNode };
