import * as React from 'react';
import { Alert, View } from 'react-native';

import { ListRow } from '@/components/molecules';
import { Icon } from '@/components/ui/icon';
import { formatMinor } from '@/lib/format';
import { strings } from '@/lib/strings';

import { categoryMeta } from '../model/categories';
import { removeExpense } from '../data/expense.repository';
import type { CategoryId } from '../model/types';

type ExpenseRowProps = {
  id: string;
  label: string;
  amountMinor: number;
  categoryId: CategoryId;
  note?: string;
};

/**
 * One expense in the transaction list.
 *
 * Primitive props, not an `Expense` object: `memo` compares by reference, and
 * a fresh object per render defeats it even when every field is unchanged.
 * The row also only needs five of the record's eight fields.
 *
 * Deleting goes through a native `Alert` rather than a drawn-in-JS sheet —
 * it is the platform control, it inherits system behaviour, and it costs no
 * dependency. Swipe-to-delete would need `react-native-gesture-handler` and a
 * rebuild for one affordance.
 */
export const ExpenseRow = React.memo(function ExpenseRow({
  id,
  label,
  amountMinor,
  categoryId,
  note,
}: ExpenseRowProps) {
  const meta = categoryMeta(categoryId);

  const handleLongPress = React.useCallback(() => {
    Alert.alert(strings.expenses.deleteTitle, strings.expenses.deleteBody(label), [
      { text: strings.common.cancel, style: 'cancel' },
      {
        text: strings.common.delete,
        style: 'destructive',
        onPress: () => removeExpense(id),
      },
    ]);
  }, [id, label]);

  return (
    <ListRow
      title={label}
      subtitle={note ?? meta.label}
      value={formatMinor(amountMinor)}
      onLongPress={handleLongPress}
      leading={
        <View
          className="h-9 w-9 items-center justify-center rounded-full bg-accents-1"
          style={{ borderCurve: 'continuous' }}>
          <Icon as={meta.icon} size={16} color={meta.color} />
        </View>
      }
    />
  );
});
