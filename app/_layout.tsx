import '../global.css';

import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PortalHost } from '@rn-primitives/portal';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useIsUnlocked } from '@/features/auth';
import { migrateIfNeeded } from '@/features/expenses';
import { useSettingsStore } from '@/features/settings';
import { queryClient } from '@/lib/query';
import { THEME_COLORS, ThemeProvider } from '@/lib/theme';

// Runs before the first render, once per app launch. Cheap unless the stored
// schema version is behind, in which case it rebuilds the derived keys.
migrateIfNeeded();

export default function RootLayout() {
  const isUnlocked = useIsUnlocked();
  const themeId = useSettingsStore((state) => state.themeId);

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <ThemeProvider themeId={themeId}>
          {/* Follows the theme rather than hard-coded `dark`: all three themes
              are light today, but a dark one would want light status icons and
              this is the line that would otherwise be missed. */}
          <StatusBar style={THEME_COLORS[themeId].scheme === 'dark' ? 'light' : 'dark'} />

          {/* `Stack.Protected` rather than a `router.replace()` in an effect —
              navigating before the navigator has mounted throws, and that is
              the single most common way an auth gate breaks. See ADR 0006. */}
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Protected guard={isUnlocked}>
              <Stack.Screen name="(tabs)" />
            </Stack.Protected>
            <Stack.Protected guard={!isUnlocked}>
              <Stack.Screen name="(auth)/login" />
            </Stack.Protected>
          </Stack>

          {/* Overlay host for the RNR portal-based atoms. */}
          <PortalHost />
        </ThemeProvider>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
