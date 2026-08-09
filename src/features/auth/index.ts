/**
 * The auth feature's public surface.
 *
 * Cross-feature imports go through this barrel. Inside the feature, modules
 * import each other relatively — routing an intra-feature import back through
 * here is how require cycles start.
 */
export { LoginScreen } from './screens/login-screen';
export { useIsUnlocked, useSession, useSignOut } from './store/auth.store';
export type { Session } from './model/types';
