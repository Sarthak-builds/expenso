import * as React from 'react';

/** Long enough for the spinner to register as a response, short enough not to
 *  feel like waiting. Below ~300ms it reads as a flicker or a missed gesture. */
const MINIMUM_SPINNER_MS = 400;

/**
 * Props for a `RefreshControl` over a synchronous data source.
 *
 * There is nothing to await here — MMKV reads are synchronous, so by the time
 * the gesture completes the work is already done. Handing `refreshing: false`
 * straight back makes the spinner vanish before it has drawn a frame, and the
 * pull reads as if it did not register.
 *
 * So the spinner is held briefly on purpose. That is not a fake loading state
 * dressing up an instant operation: the refresh really did happen, and this is
 * only acknowledging the gesture.
 */
export function useRefreshControl(onRefresh: () => void) {
  const [refreshing, setRefreshing] = React.useState(false);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );

  const handleRefresh = React.useCallback(() => {
    onRefresh();
    setRefreshing(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setRefreshing(false), MINIMUM_SPINNER_MS);
  }, [onRefresh]);

  return { refreshing, onRefresh: handleRefresh };
}
