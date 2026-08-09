import { View } from 'react-native';

import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils/cn';

type SectionHeaderProps = {
  title: string;
  /** Optional right-hand slot: a range picker, a "see all" link, a count. */
  children?: React.ReactNode;
  className?: string;
};

/**
 * The label above a block of content.
 *
 * Uppercase `label-12` in `accents-5` rather than a larger heading — Geist's
 * rule is to vary weight and grayscale for hierarchy before adding a font size,
 * and the dashboard already spends its two large sizes on the KPI figures.
 */
function SectionHeader({ title, children, className }: SectionHeaderProps) {
  return (
    <View className={cn('flex-row items-center justify-between gap-3', className)}>
      <Text className="font-medium uppercase tracking-wider text-label-12 text-accents-5">
        {title}
      </Text>
      {children}
    </View>
  );
}

export { SectionHeader };
export type { SectionHeaderProps };
