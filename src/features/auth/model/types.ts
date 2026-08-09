/**
 * The device lock's model.
 *
 * "Session" is the honest word — there is no server, no account and no token.
 * Unlocking records which of the two permitted numbers is using the device so
 * Settings can show it. See docs/adr/0004-credentials-and-secrets.md
 */
export type Session = {
  phone: string;
  unlockedAt: number;
};

/** Why an unlock attempt failed. Maps 1:1 onto a string in `lib/strings`. */
export type UnlockFailure = 'unknown-number' | 'wrong-pin' | 'not-configured';

export type UnlockResult = { ok: true; session: Session } | { ok: false; reason: UnlockFailure };
