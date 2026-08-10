import { NativeTabs } from 'expo-router/unstable-native-tabs';

import { useThemeColors } from '@/lib/theme';
import { strings } from '@/lib/strings';

/**
 * The bottom bar, using the real platform control.
 *
 * `sf` for iOS and `md` for Android. SF Symbols are free — they are part of the
 * OS. `md` is NOT: it resolves through `expo-symbols`, which bundles a 962KB
 * Material Symbols font (measured with `expo export`, ~15% of the Android
 * bundle). That is the price of correct Material 3 icons without an asset
 * pipeline, and it is worth paying here; the alternative is shipping four PNGs
 * at three densities each, or falling back to the framework's Holo-era
 * drawables. Revisit if bundle size ever becomes a real constraint.
 *
 * Four tabs — `ui-ux-pro-max` puts the ceiling at five. See ADR 0006.
 */
export default function TabsLayout() {
  // The tab bar is native, so its colours are props rather than classes — this
  // is one of the two places `useThemeColors` is the right tool.
  const colors = useThemeColors();

  return (
    <NativeTabs
      backgroundColor={colors.background}
      tintColor={colors.accent}
      iconColor={colors.muted}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Icon sf="chart.bar.fill" md="bar_chart" />
        <NativeTabs.Trigger.Label>{strings.tabs.dashboard}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="add">
        <NativeTabs.Trigger.Icon sf="plus.circle.fill" md="add_circle" />
        <NativeTabs.Trigger.Label>{strings.tabs.add}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="chat">
        <NativeTabs.Trigger.Icon sf="bubble.left.and.bubble.right.fill" md="forum" />
        <NativeTabs.Trigger.Label>{strings.tabs.chat}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="settings">
        <NativeTabs.Trigger.Icon sf="gearshape.fill" md="settings" />
        <NativeTabs.Trigger.Label>{strings.tabs.settings}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
