import { QueryClient } from '@tanstack/react-query';

/**
 * React Query exists in this app for exactly one thing: the Gemini call.
 *
 * Local data is read synchronously from MMKV during render — wrapping those
 * reads in `useQuery` would reintroduce an async boundary in front of bytes
 * already in hand, and flash an empty dashboard on every tab switch. See
 * docs/adr/0002-state-management.md
 *
 * So there are no queries here, only mutations. The defaults below exist to
 * make that explicit rather than to tune anything: if a `useQuery` ever appears
 * in this codebase, it is a mistake, and these settings stop it from silently
 * refetching in the background while it is one.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      gcTime: Infinity,
      retry: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    },
    mutations: {
      // One retry, for the case that actually happens: a phone waking up with
      // a half-open socket. Beyond that the user should see the error and
      // decide, not watch a spinner for 30 seconds.
      retry: 1,
      retryDelay: 800,
    },
  },
});
