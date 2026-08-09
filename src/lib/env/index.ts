/**
 * The ONLY place `process.env` is read at app runtime.
 *
 * Expo's Babel transform substitutes `EXPO_PUBLIC_*` literally at build time,
 * so `process.env[name]` (a computed lookup) does NOT work — the plugin only
 * rewrites static member access. Every read below must stay spelled out.
 *
 * Nothing here is a secret; every value is extractable from a shipped bundle.
 * See docs/adr/0004-credentials-and-secrets.md
 */

/** Trims and normalises a build-time value; `undefined` for blank or unset. */
function read(raw: string | undefined): string | undefined {
  const value = raw?.trim();
  return value ? value : undefined;
}

export const env = {
  geminiApiKey: read(process.env.EXPO_PUBLIC_GEMINI_API_KEY),
  userAPhone: read(process.env.EXPO_PUBLIC_USER_A_PHONE),
  userBPhone: read(process.env.EXPO_PUBLIC_USER_B_PHONE),
  pinHash: read(process.env.EXPO_PUBLIC_PIN_HASH)?.toLowerCase(),
} as const;

/** Phone numbers permitted to unlock this device. Empty if `.env` is missing. */
export const allowedPhones: readonly string[] = [env.userAPhone, env.userBPhone].filter(
  (phone): phone is string => phone !== undefined
);

/**
 * True when the device lock is configured well enough to let anyone in.
 * A missing `.env` must fail closed rather than unlock for every number.
 */
export const isDeviceLockConfigured = allowedPhones.length > 0 && env.pinHash !== undefined;
