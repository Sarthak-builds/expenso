import '../global.css';

import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PortalHost } from '@rn-primitives/portal';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useIsUnlocked } from '@/features/auth';
import { migrateIfNeeded } from '@/features/expenses';
import { queryClient } from '@/lib/query';

// Runs before the first render, once per app launch. Cheap unless the stored
// schema version is behind, in which case it rebuilds the derived keys.
migrateIfNeeded();

export default function RootLayout() {
  const isUnlocked = useIsUnlocked();

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <StatusBar style="dark" />

        {/* `Stack.Protected` rather than a `router.replace()` in an effect —
            navigating before the navigator has mounted throws, and that is the
            single most common way an auth gate breaks. See ADR 0006. */}
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
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
