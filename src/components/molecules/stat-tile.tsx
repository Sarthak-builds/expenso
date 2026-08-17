import { View } from 'react-native';
import { TrendingDown, TrendingUp } from 'lucide-react-native';

import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils/cn';

import { AnimatedValue } from './animated-value';

type StatTileProps = {
  label: string;
  /** Pre-formatted. Domain code decides whether that is compact or exact. */
  value: string;
  /**
   * Signed change against a comparison period, as a ratio (0.12 = +12%).
   * `null` means there is nothing to compare against and no delta renders —
   * a percentage against zero is infinity, and "+∞%" on day two helps nobody.
   */
  changeRatio?: number | null;
  /**
   * Which direction is good. Spending up is bad; a savings figure would set
   * this to `up`. Without it the tile would colour every increase green.
   */
  goodDirection?: 'up' | 'down';
  className?: string;
};

const percentFormatter = new Intl.NumberFormat('en-IN', {
  style: 'percent',
  maximumFractionDigits: 0,
  signDisplay: 'exceptZero',
});

/**
 * One number and its label.
 *
 * The figure is `heading-24` mono against a `label-12` uppercase caption —
 * two sizes, not four, with weight and grayscale carrying the rest of the
 * hierarchy. Tabular mono figures stop the number jittering as it animates.
 */
function StatTile({
  label,
  value,
  changeRatio = null,
  goodDirection = 'down',
  className,
}: StatTileProps) {
  const hasDelta = changeRatio !== null && Number.isFinite(changeRatio) && changeRatio !== 0;
  const rising = hasDelta && changeRatio > 0;
  const good = hasDelta && (rising ? goodDirection === 'up' : goodDirection === 'down');

  // One spoken label for the tile. Four separate Texts read as disconnected
  // fragments; "Daily average, 412 rupees, down 12%" reads as a sentence.
  const spoken = [label, value, hasDelta ? percentFormatter.format(changeRatio) : null]
    .filter(Boolean)
    .join(', ');

  return (
    <View
      accessible
      accessibilityLabel={spoken}
      className={cn(
        'flex-1 gap-1 rounded-lg border border-accents-2 bg-background p-3',
        className
      )}
      style={{ borderCurve: 'continuous' }}>
      <Text className="font-medium uppercase tracking-wider text-label-12 text-accents-5">
        {label}
      </Text>

      <AnimatedValue className="text-heading-24 text-foreground" value={value} />

      {hasDelta ? (
        <View className="flex-row items-center gap-1">
          <Icon
            as={rising ? TrendingUp : TrendingDown}
            size={12}
            className={good ? 'text-blue' : 'text-red'}
          />
          <Text
            className={cn('font-mono text-label-12', good ? 'text-blue' : 'text-red')}>
            {percentFormatter.format(changeRatio)}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

export { StatTile };
export type { StatTileProps };
