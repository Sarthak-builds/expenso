import { View } from 'react-native';
import { TrendingDown, TrendingUp } from 'lucide-react-native';

import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils/cn';

import { AnimatedValue } from './animated-value';

type HeroStatProps = {
  label: string;
  /** Pre-formatted. Domain code decides exact vs compact. */
  value: string;
  changeRatio?: number | null;
  /** Which direction is good. Spending up is bad, so this defaults to `down`. */
  goodDirection?: 'up' | 'down';
  /** Sits under the value — "Last 30 days", a date range. */
  caption?: string;
  className?: string;
};

const percentFormatter = new Intl.NumberFormat('en-IN', {
  style: 'percent',
  maximumFractionDigits: 0,
  signDisplay: 'exceptZero',
});

/**
 * The one number the screen exists to show.
 *
 * `heading-72` because this is the answer to "how much have I spent" and
 * everything else on the dashboard is a qualifier on it. The previous layout
 * gave the total the same `heading-24` as the daily average and sat it beside
 * a filter of equal weight, so the screen had three things competing and no
 * focal point.
 *
 * Screen readers get one label for the whole block rather than four
 * disconnected fragments — "Total spent, ₹1,234, down 12%" reads as a
 * sentence, where the individual Texts would not.
 */
function HeroStat({
  label,
  value,
  changeRatio = null,
  goodDirection = 'down',
  caption,
  className,
}: HeroStatProps) {
  const hasDelta = changeRatio !== null && Number.isFinite(changeRatio) && changeRatio !== 0;
  const rising = hasDelta && changeRatio > 0;
  const good = hasDelta && (rising ? goodDirection === 'up' : goodDirection === 'down');

  const spoken = [label, value, hasDelta ? percentFormatter.format(changeRatio) : null, caption]
    .filter(Boolean)
    .join(', ');

  return (
    <View
      accessible
      accessibilityLabel={spoken}
      className={cn('gap-1', className)}>
      <Text className="font-medium uppercase tracking-wider text-label-12 text-accents-5">
        {label}
      </Text>

      {/* Mono keeps the digits from reflowing as the value animates. */}
      <AnimatedValue className="text-heading-72 text-foreground" value={value} />

      <View className="flex-row items-center gap-2">
        {hasDelta ? (
          <View className="flex-row items-center gap-1">
            <Icon
              as={rising ? TrendingUp : TrendingDown}
              size={14}
              className={good ? 'text-blue' : 'text-red'}
            />
            <Text className={cn('font-mono text-copy-14', good ? 'text-blue' : 'text-red')}>
              {percentFormatter.format(changeRatio)}
            </Text>
          </View>
        ) : null}
        {caption ? <Text className="text-copy-14 text-accents-5">{caption}</Text> : null}
      </View>
    </View>
  );
}

export { HeroStat };
export type { HeroStatProps };
