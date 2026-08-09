import { CryptoDigestAlgorithm, digestStringAsync } from 'expo-crypto';

import { allowedPhones, env, isDeviceLockConfigured } from '@/lib/env';

import type { UnlockResult } from '../model/types';

/**
 * Unlock checking.
 *
 * **This is not authentication and must not be described as such.** SHA-256 of
 * a 4-digit PIN has 10,000 candidates and falls instantly, and the hash itself
 * ships inside the bundle. Hashing protects against someone reading MMKV on a
 * rooted device, not against anyone holding the app.
 *
 * It is acceptable only because the data never leaves the device: there is no
 * account to take over and no server to reach. The threat it does address —
 * someone picking up an unlocked phone — it addresses fine. See
 * docs/adr/0004-credentials-and-secrets.md
 */
export async function hashPin(pin: string): Promise<string> {
  const digest = await digestStringAsync(CryptoDigestAlgorithm.SHA256, pin);
  return digest.toLowerCase();
}

export async function attemptUnlock(phone: string, pin: string): Promise<UnlockResult> {
  // A missing `.env` must fail closed. Without this the checks below would
  // compare against an empty list and an undefined hash, and the natural
  // reading of "no configured numbers" would be "let everyone in".
  if (!isDeviceLockConfigured) {
    return { ok: false, reason: 'not-configured' };
  }

  if (!allowedPhones.includes(phone)) {
    return { ok: false, reason: 'unknown-number' };
  }

  const digest = await hashPin(pin);
  if (digest !== env.pinHash) {
    return { ok: false, reason: 'wrong-pin' };
  }

  return { ok: true, session: { phone, unlockedAt: Date.now() } };
}
