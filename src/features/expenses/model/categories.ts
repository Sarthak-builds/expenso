import {
  Bus,
  Clapperboard,
  HeartPulse,
  MoreHorizontal,
  ReceiptText,
  ShoppingBag,
  ShoppingBasket,
  Utensils,
  type LucideIcon,
} from 'lucide-react-native';

import { seriesColor } from '@/lib/theme';
import { strings } from '@/lib/strings';

import { CATEGORY_IDS, type CategoryId } from './types';

/**
 * Presentation metadata for each category, in one table.
 *
 * The colour is resolved from the shared series ramp by position rather than
 * named per category, so a category keeps its colour across the breakdown bar,
 * the legend and the transaction list without any of them agreeing on a hex.
 */
export type CategoryMeta = {
  id: CategoryId;
  label: string;
  icon: LucideIcon;
  color: string;
};

const ICONS: Record<CategoryId, LucideIcon> = {
  food: Utensils,
  groceries: ShoppingBasket,
  transport: Bus,
  bills: ReceiptText,
  shopping: ShoppingBag,
  health: HeartPulse,
  entertainment: Clapperboard,
  other: MoreHorizontal,
};

/** Built once at module load — the icon and colour for a category never change. */
export const CATEGORIES: Record<CategoryId, CategoryMeta> = CATEGORY_IDS.reduce(
  (acc, id, index) => {
    acc[id] = {
      id,
      label: strings.categories[id],
      icon: ICONS[id],
      color: seriesColor(index),
    };
    return acc;
  },
  {} as Record<CategoryId, CategoryMeta>
);

/** Stable display order: the declaration order in `CATEGORY_IDS`. */
export const CATEGORY_LIST: readonly CategoryMeta[] = CATEGORY_IDS.map((id) => CATEGORIES[id]);

export function categoryMeta(id: CategoryId): CategoryMeta {
  return CATEGORIES[id];
}
