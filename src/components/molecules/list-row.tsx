import { View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';

import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils/cn';

import { PressableScale } from './pressable-scale';

type ListRowProps = {
  title: string;
  subtitle?: string;
  /** Right-aligned figure. Rendered mono so columns of amounts line up. */
  value?: string;
  /** Leading slot — an icon badge, an avatar, a colour swatch. */
  leading?: React.ReactNode;
  /** Trailing slot. Replaces the chevron entirely when provided. */
  trailing?: React.ReactNode;
  onPress?: () => void;
  /** Secondary action. A row with only this is still pressable for feedback. */
  onLongPress?: () => void;
  destructive?: boolean;
  className?: string;
};

/**
 * One row in a list: leading slot, stacked title/subtitle, value, trailing.
 *
 * Slots rather than booleans — a row with an icon and a row with a swatch are
 * the same component with different children, not two `showIcon` flags.
 *
 * `min-h-[56px]` keeps the row above the 44pt touch target minimum even when
 * there is no subtitle to pad it out.
 */
function ListRow({
  title,
  subtitle,
  value,
  leading,
  trailing,
  onPress,
  onLongPress,
  destructive = false,
  className,
}: ListRowProps) {
  const content = (
    <View
      className={cn(
        'min-h-[56px] flex-row items-center gap-3 rounded-lg px-4 py-3',
        className
      )}
      style={{ borderCurve: 'continuous' }}>
      {leading}

      <View className="flex-1 gap-0.5">
        <Text
          numberOfLines={1}
          className={cn(
            'font-medium text-copy-16',
            destructive ? 'text-red' : 'text-foreground'
          )}>
          {title}
        </Text>
        {subtitle ? (
          <Text numberOfLines={1} className="text-copy-14 text-accents-5">
            {subtitle}
          </Text>
        ) : null}
      </View>

      {value ? (
        <Text className="font-mono-medium text-copy-16 text-foreground">{value}</Text>
      ) : null}

      {trailing ?? (onPress ? <Icon as={ChevronRight} size={16} className="text-accents-3" /> : null)}
    </View>
  );

  if (!onPress && !onLongPress) return content;

  return (
    <PressableScale accessibilityRole="button" onPress={onPress} onLongPress={onLongPress}>
      {content}
    </PressableScale>
  );
}

export { ListRow };
export type { ListRowProps };
