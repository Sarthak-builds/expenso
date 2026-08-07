import { Text, View } from 'react-native';

/**
 * Phase 1 smoke test — verifies three things that fail SILENTLY when
 * misconfigured, before any real UI is built on top of them:
 *
 *  1. NativeWind classes apply at all (react-native-css-interop on RN 0.86).
 *  2. Geist Sans resolves by PostScript name — if it falls back to the system
 *     font, the weights below will look identical rather than erroring.
 *  3. Geist Mono renders with tabular figures for amounts.
 *
 * Replaced by the real route tree in Phase 7.
 */
export default function SmokeTest() {
  return (
    <View className="flex-1 items-center justify-center gap-4 bg-background px-6">
      <Text className="font-bold text-heading-40 text-foreground">Expenso</Text>

      <Text className="font-sans text-copy-16 text-accents-5">
        Geist Sans Regular 400
      </Text>
      <Text className="font-medium text-copy-16 text-accents-5">
        Geist Sans Medium 500
      </Text>
      <Text className="font-semibold text-copy-16 text-foreground">
        Geist Sans SemiBold 600
      </Text>

      <Text className="font-mono text-heading-24 text-blue">₹1,234.56</Text>

      <View className="rounded-lg border border-accents-2 bg-accents-1 px-4 py-3">
        <Text className="font-mono text-label-12 text-accents-5">
          NativeWind + Geist OK
        </Text>
      </View>
    </View>
  );
}
