import { NativeTabs } from 'expo-router/unstable-native-tabs';

import { colors } from '@/lib/theme';
import { strings } from '@/lib/strings';

/**
 * The bottom bar, using the real platform control.
 *
 * `sf` for iOS and `md` for Android: both are built into the OS, so the tabs
 * get correct, resolution-independent, accessibility-aware icons with no asset
 * pipeline and no vector-icon font to ship.
 *
 * Four tabs — `ui-ux-pro-max` puts the ceiling at five. See ADR 0006.
 */
export default function TabsLayout() {
  return (
    <NativeTabs
      backgroundColor={colors.background}
      tintColor={colors.foreground}
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
