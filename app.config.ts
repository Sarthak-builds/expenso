import type { ExpoConfig, ConfigContext } from 'expo/config';

/**
 * This file runs in Node at config time, so plain `process.env.X` works here
 * with no prefix. App runtime code sees ONLY `EXPO_PUBLIC_*` values, and only
 * through `src/lib/env/`. Same syntax, two different mechanisms — see
 * docs/adr/0004-credentials-and-secrets.md
 *
 * `.env.staging` is NOT auto-loaded: Expo's dotenv resolution keys off
 * NODE_ENV, which has no `staging` value. APP_VARIANT is the explicit
 * mechanism. See docs/adr/0009-package-manager-pnpm.md
 */
const variant = process.env.APP_VARIANT ?? 'development';
const isProduction = variant === 'production';

const FONTS = [
  './assets/fonts/Geist_400Regular.ttf',
  './assets/fonts/Geist_500Medium.ttf',
  './assets/fonts/Geist_600SemiBold.ttf',
  './assets/fonts/Geist_700Bold.ttf',
  './assets/fonts/GeistMono_400Regular.ttf',
  './assets/fonts/GeistMono_500Medium.ttf',
];

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: isProduction ? 'Expenso' : `Expenso (${variant})`,
  slug: 'expenso',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  // Required for expo-router deep links and the dev client's expenso:// launch.
  scheme: 'expenso',
  // New architecture is the default and only mode in SDK 57 — the
  // `newArchEnabled` flag no longer exists in the config type.
  ios: {
    supportsTablet: true,
    bundleIdentifier: isProduction ? 'com.sarthak.expenso' : `com.sarthak.expenso.${variant}`,
  },
  android: {
    package: isProduction ? 'com.sarthak.expenso' : `com.sarthak.expenso.${variant}`,
    adaptiveIcon: {
      backgroundColor: '#FFFFFF',
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
  },
  web: { favicon: './assets/favicon.png' },
  plugins: [
    'expo-router',
    // Build-time font embedding. Deliberately NOT useFonts() — no splash hold,
    // no loading state. fontFamily must be the PostScript name, e.g.
    // 'Geist_400Regular'. See docs/adr/0005-design-system.md
    ['expo-font', { fonts: FONTS }],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  // Pins builds to the account that owns the EAS project, so a build does not
  // silently target a different org depending on who is logged in.
  owner: 'sarthakshiroty21',
  extra: {
    variant,
    // Pasted by hand: `eas init` cannot write to a dynamic (TypeScript)
    // config, it only prints the id. Not a secret — it identifies the
    // project, it does not authorise anything. See docs/building.md
    eas: { projectId: '4c5a590c-7c0d-4122-9a45-8a75b0e3395f' },
  },
});
