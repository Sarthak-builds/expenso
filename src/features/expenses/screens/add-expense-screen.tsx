import * as React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { Check } from 'lucide-react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/molecules';
import { SchemaForm, useSchemaForm } from '@/components/organisms/schema-form';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { parseAmountToMinor } from '@/lib/format';
import { strings } from '@/lib/strings';
import { motion } from '@/lib/theme';

import { addExpense } from '../data/expense.repository';
import { addExpenseInitialValues, addExpenseSchema } from '../schema/add-expense.schema';
import { isCategoryId } from '../model/types';
import { formatMinorForInput, isDayKey } from '@/lib/format';

const CONFIRMATION_MS = 1800;

/**
 * Values handed over from a chat suggestion the user chose to edit.
 * Every field is optional and untrusted — they arrive as route params, which
 * are strings from outside this screen's control.
 */
export type AddExpenseSeed = {
  label?: string;
  amountMinor?: string;
  categoryId?: string;
  day?: string;
};

function applySeed(seed: AddExpenseSeed | undefined) {
  const values = addExpenseInitialValues();
  if (!seed) return values;

  const amountMinor = Number(seed.amountMinor);
  return {
    ...values,
    ...(seed.label ? { label: seed.label } : {}),
    ...(Number.isFinite(amountMinor) && amountMinor > 0
      ? { amount: formatMinorForInput(amountMinor) }
      : {}),
    ...(isCategoryId(seed.categoryId) ? { categoryId: seed.categoryId } : {}),
    ...(seed.day && isDayKey(seed.day) ? { day: seed.day } : {}),
  };
}

/**
 * Add an expense.
 *
 * Saving resets the form and stays put rather than navigating away. This screen
 * is used several times in a row — three groceries and an auto fare in one
 * sitting — and bouncing to the dashboard after each would cost a tab tap to
 * get back. The confirmation is what tells the user it worked.
 */
export function AddExpenseScreen({ seed }: { seed?: AddExpenseSeed }) {
  const insets = useSafeAreaInsets();
  const [initialValues, setInitialValues] = React.useState(() => applySeed(seed));
  const form = useSchemaForm({ schema: addExpenseSchema, initialValues });
  const [saved, setSaved] = React.useState(false);

  // A second suggestion arriving while this tab is already mounted must
  // replace the draft; the lazy initializer above only runs on first mount.
  const seedKey = `${seed?.label ?? ''}|${seed?.amountMinor ?? ''}|${seed?.day ?? ''}`;
  const lastSeedKey = React.useRef(seedKey);
  React.useEffect(() => {
    if (lastSeedKey.current === seedKey || !seed?.label) return;
    lastSeedKey.current = seedKey;
    const next = applySeed(seed);
    setInitialValues(next);
    form.reset(next);
  }, [form, seed, seedKey]);

  React.useEffect(() => {
    if (!saved) return;
    const timer = setTimeout(() => setSaved(false), CONFIRMATION_MS);
    return () => clearTimeout(timer);
  }, [saved]);

  const handleSubmit = React.useCallback(() => {
    const values = form.submit();
    if (!values) return;

    // The schema guarantees shape; these two guards cover the values it cannot
    // express. `amount` passed the rule, so the parse is a formality — but a
    // formality that keeps a NaN out of a stored record.
    const amountMinor = parseAmountToMinor(values.amount ?? '');
    const categoryId = values.categoryId;
    if (amountMinor === null || !isCategoryId(categoryId)) return;

    const note = (values.note ?? '').trim();
    addExpense({
      label: (values.label ?? '').trim(),
      amountMinor,
      categoryId,
      day: values.day ?? '',
      source: 'manual',
      ...(note ? { note } : {}),
    });

    // A fresh `day` matters: the form may have been open across midnight.
    const next = addExpenseInitialValues();
    setInitialValues(next);
    form.reset(next);
    setSaved(true);
  }, [form]);

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.select({ ios: 'padding', default: undefined })}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 40 }}
        contentContainerClassName="gap-6 px-4">
        <ScreenHeader title={strings.addExpense.title} />

        <SchemaForm
          schema={addExpenseSchema}
          values={form.values}
          errors={form.errors}
          setValue={form.setValue}
        />

        <View className="gap-3">
          <Button size="lg" onPress={handleSubmit}>
            <Text>{strings.addExpense.submit}</Text>
          </Button>

          {saved ? (
            <Animated.View
              entering={FadeIn.duration(motion.fast)}
              exiting={FadeOut.duration(motion.base)}
              className="flex-row items-center justify-center gap-2">
              <Icon as={Check} size={14} className="text-blue" />
              <Text className="text-copy-14 text-blue">{strings.addExpense.saved}</Text>
            </Animated.View>
          ) : null}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
