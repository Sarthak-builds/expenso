import * as React from 'react';
import { View } from 'react-native';
import { vars } from 'nativewind';

import { THEME_COLORS, THEME_VARS, type ThemeId } from './themes';

type ThemeContextValue = {
  themeId: ThemeId;
  /** Resolved hex, for `react-native-svg` fills and native chrome. */
  colors: (typeof THEME_COLORS)[ThemeId];
};

const ThemeContext = React.createContext<ThemeContextValue | null>(null);

/**
 * Applies a theme's CSS variables to everything below it.
 *
 * NativeWind's `vars()` puts the variables on a style object; every descendant
 * resolves `rgb(var(--color-x))` against the nearest ancestor that defines
 * them. So one `View` at the root re-themes the entire tree, and switching is
 * a single re-render with no reload and no restart.
 *
 * The provider is the only thing that knows which theme is active — consumers
 * ask for colours, not for an id.
 */
export function ThemeProvider({
  themeId,
  children,
}: {
  themeId: ThemeId;
  children: React.ReactNode;
}) {
  const value = React.useMemo<ThemeContextValue>(
    () => ({ themeId, colors: THEME_COLORS[themeId] }),
    [themeId]
  );

  return (
    <ThemeContext.Provider value={value}>
      {/* `flex-1` matters: without it this collapses to zero height and the
          whole app renders as a blank screen with no error. */}
      <View style={vars(THEME_VARS[themeId])} className="flex-1">
        {children}
      </View>
    </ThemeContext.Provider>
  );
}

/**
 * Theme colours as hex.
 *
 * Only for the places a `className` cannot reach: SVG `fill`/`stroke` props and
 * the native tab bar. Anything that can be a class should be one — reaching for
 * this hook in ordinary layout code means the styling is escaping NativeWind.
 */
export function useThemeColors(): ThemeContextValue['colors'] {
  const context = React.use(ThemeContext);
  // Falling back keeps charts renderable in isolation (and in any future test
  // that mounts one without the provider) rather than throwing.
  return context?.colors ?? THEME_COLORS.geist;
}

export function useThemeId(): ThemeId {
  return React.use(ThemeContext)?.themeId ?? 'geist';
}
