import { View } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';

import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils/cn';

import { PressableScale } from './pressable-scale';

type ChipProps = {
  label: string;
  selected?: boolean;
  icon?: LucideIcon;
  /** Tints the icon when selected — used to carry a category's series colour. */
  accentColor?: string;
  onPress?: () => void;
  className?: string;
};

/**
 * A selectable pill.
 *
 * Selection inverts to Geist's solid black fill rather than adding a border or
 * a tint, so the selected chip is unmistakable in a wrapped grid of eight.
 * `min-h-[44px]` meets the touch target minimum without padding the label.
 */
function Chip({ label, selected = false, icon, accentColor, onPress, className }: ChipProps) {
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityState={{ selected }}
      depth="firm"
      onPress={onPress}
      className={className}>
      <View
        className={cn(
          'min-h-[44px] flex-row items-center gap-2 rounded-full border px-4 py-2',
          selected ? 'border-foreground bg-foreground' : 'border-accents-2 bg-background'
        )}
        style={{ borderCurve: 'continuous' }}>
        {icon ? (
          <Icon
            as={icon}
            size={14}
            className={selected ? 'text-background' : 'text-accents-5'}
            {...(!selected && accentColor ? { color: accentColor } : {})}
          />
        ) : accentColor ? (
          // No icon, but a colour to show — render it as a swatch. This is what
          // makes the theme picker legible before you pick: three pills that
          // differ only in wording tell you nothing about what you are choosing.
          <View
            className={cn('h-3 w-3 rounded-full', selected && 'border border-background')}
            style={{ backgroundColor: accentColor }}
          />
        ) : null}
        <Text
          className={cn(
            'text-copy-14',
            selected ? 'font-medium text-background' : 'text-foreground'
          )}>
          {label}
        </Text>
      </View>
    </PressableScale>
  );
}

export { Chip };
export type { ChipProps };
