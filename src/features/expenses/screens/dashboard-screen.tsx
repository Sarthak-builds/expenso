import * as React from 'react';
import { RefreshControl, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Wallet } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState, ScreenHeader, SectionHeader } from '@/components/molecules';
import { useRefreshControl } from '@/lib/hooks/use-refresh-control';
import { strings } from '@/lib/strings';
import { useThemeColors } from '@/lib/theme';

import { refreshExpenses } from '../data/changes';

import { CategoryBreakdown } from '../components/category-breakdown';
import { DayHeader } from '../components/day-header';
import { ExpenseRow } from '../components/expense-row';
import { RangePicker } from '../components/range-picker';
import { SpendSummary } from '../components/spend-summary';
import { SpendTrendChart } from '../components/spend-trend-chart';
import { useExpenseList, type ExpenseListItem } from '../hooks/useExpenseList';
import { useRangeSummary } from '../hooks/useRangeSummary';

/**
 * The dashboard.
 *
 * The `FlashList` is the ROOT element, with all padding in
 * `contentContainerStyle`. On iOS, native tabs apply
 * `contentInsetAdjustmentBehavior` to the first ScrollView at the root of each
 * tab screen — wrapping the list in a padded `View` loses that and the list
 * renders under the translucent tab bar. See docs/adr/0006-navigation.md
 *
 * Everything above the transactions rides in `ListHeaderComponent` rather than
 * sitting beside the list, for the same reason.
 */
export function DashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const summary = useRangeSummary();
  const items = useExpenseList();
  const colors = useThemeColors();
  const refresh = useRefreshControl(refreshExpenses);

  const renderItem = React.useCallback(({ item }: { item: ExpenseListItem }) => {
    if (item.kind === 'header') {
      return <DayHeader day={item.day} total={item.total} />;
    }
    // Spread to primitives here rather than passing the record — see the note
    // in ExpenseRow about why memo cannot help with an object prop.
    return (
      <ExpenseRow
        id={item.expense.id}
        label={item.expense.label}
        amountMinor={item.expense.amountMinor}
        categoryId={item.expense.categoryId}
        note={item.expense.note}
      />
    );
  }, []);

  // Horizontal padding lives on the header and on each row, NOT on the content
  // container — the day headers need a full-bleed background to sit under
  // while scrolling, and rows need it to be the pressable surface's edge.
  const header = (
    <View className="gap-6 px-4 pb-2">
      <ScreenHeader title={strings.dashboard.title}>
        <RangePicker />
      </ScreenHeader>

      <SpendSummary summary={summary} />
      <SpendTrendChart summary={summary} />
      <CategoryBreakdown summary={summary} />

      {items.length > 0 ? <SectionHeader title={strings.dashboard.recent} /> : null}
    </View>
  );

  return (
    <FlashList
      data={items}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      getItemType={getItemType}
      ListHeaderComponent={header}
      ListEmptyComponent={
        <EmptyState
          icon={Wallet}
          title={strings.dashboard.empty.title}
          body={strings.dashboard.empty.body}
          action={{
            label: strings.dashboard.empty.action,
            onPress: () => router.navigate('/add'),
          }}
        />
      }
      contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: 40 }}
      refreshControl={
        <RefreshControl
          {...refresh}
          tintColor={colors.accent}
          colors={[colors.accent]}
          progressBackgroundColor={colors.background}
        />
      }
    />
  );
}

function keyExtractor(item: ExpenseListItem): string {
  return item.key;
}

/** Separate recycling pools — a header must never be reused as a row. */
function getItemType(item: ExpenseListItem): string {
  return item.kind;
}
