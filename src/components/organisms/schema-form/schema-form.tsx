import { View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { cn } from '@/lib/utils/cn';
import { motion } from '@/lib/theme';

import { SchemaFormProvider } from './context';
import { RenderNode, nodeKey } from './registry';
import type { FormErrors, FormValues, UiSchema } from './types';

type SchemaFormProps = {
  schema: UiSchema;
  values: FormValues;
  errors: FormErrors;
  setValue: (name: string, value: string) => void;
  onAction?: (id: string) => void;
  className?: string;
};

/**
 * Renders a schema.
 *
 * Controlled: state lives in the screen (via `useSchemaForm`), so a screen can
 * derive from it, seed it from a chat suggestion, or reset it after a save
 * without this component knowing any of that happened.
 *
 * Top-level nodes stagger in. The delay is capped at `staggerLimit` nodes —
 * past that the last field would be waiting on an animation rather than the
 * other way round, and a form the user has to watch assemble is worse than one
 * that is simply there.
 */
function SchemaForm({
  schema,
  values,
  errors,
  setValue,
  onAction,
  className,
}: SchemaFormProps) {
  return (
    <SchemaFormProvider values={values} errors={errors} setValue={setValue} onAction={onAction}>
      <View className={cn('gap-6', className)}>
        {schema.map((node, index) => (
          <Animated.View
            key={nodeKey(node)}
            entering={FadeInDown.duration(motion.base).delay(
              Math.min(index, motion.staggerLimit) * motion.stagger
            )}>
            <RenderNode node={node} />
          </Animated.View>
        ))}
      </View>
    </SchemaFormProvider>
  );
}

export { SchemaForm };
export type { SchemaFormProps };
