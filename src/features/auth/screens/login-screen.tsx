import * as React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SchemaForm, useSchemaForm } from '@/components/organisms/schema-form';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { strings } from '@/lib/strings';
import { motion } from '@/lib/theme';

import { loginInitialValues, loginSchema } from '../schema/login.schema';
import { attemptUnlock } from '../services/pin';
import { useSignIn } from '../store/auth.store';
import type { UnlockFailure } from '../model/types';

const FAILURE_MESSAGES: Record<UnlockFailure, string> = {
  'unknown-number': strings.auth.errors.unknownNumber,
  'wrong-pin': strings.auth.errors.wrongPin,
  'not-configured': strings.auth.errors.notConfigured,
};

const SHAKE_DISTANCE = 10;
const SHAKE_CYCLES = 3;

export function LoginScreen() {
  const insets = useSafeAreaInsets();
  const signIn = useSignIn();
  const form = useSchemaForm({ schema: loginSchema, initialValues: loginInitialValues });

  const [submitting, setSubmitting] = React.useState(false);
  const [failure, setFailure] = React.useState<UnlockFailure | null>(null);

  // Progress through the shake, 0 at rest. The offset is derived from it — a
  // damped sine — so the same value could drive opacity or a tint later
  // without redefining the animation.
  const shake = useSharedValue(0);

  const shakeStyle = useAnimatedStyle(() => {
    const progress = shake.get();
    return {
      transform: [
        {
          translateX:
            Math.sin(progress * Math.PI * SHAKE_CYCLES) * SHAKE_DISTANCE * (1 - progress),
        },
      ],
    };
  });

  const handleSubmit = React.useCallback(async () => {
    const values = form.submit();
    if (!values) return;

    setSubmitting(true);
    setFailure(null);
    try {
      const result = await attemptUnlock(values.phone ?? '', values.pin ?? '');
      if (result.ok) {
        signIn(result.session);
        return;
      }
      setFailure(result.reason);
      shake.set(0);
      shake.set(withTiming(1, { duration: motion.slow }));
    } finally {
      setSubmitting(false);
    }
  }, [form, shake, signIn]);

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.select({ ios: 'padding', default: undefined })}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          paddingTop: insets.top + 24,
          paddingBottom: insets.bottom + 24,
        }}
        contentContainerClassName="gap-8 px-6">
        <Animated.View entering={FadeIn.duration(motion.slow)} className="gap-2">
          <Text className="font-bold text-heading-40 text-foreground">
            {strings.auth.title}
          </Text>
          <Text className="text-copy-16 text-accents-5">{strings.auth.subtitle}</Text>
        </Animated.View>

        <Animated.View style={shakeStyle} className="gap-6">
          <SchemaForm
            schema={loginSchema}
            values={form.values}
            errors={form.errors}
            setValue={form.setValue}
          />

          {failure ? (
            <Animated.View entering={FadeIn.duration(motion.fast)}>
              <View className="rounded-lg border border-red/20 bg-red/5 px-4 py-3">
                <Text className="text-copy-14 text-red">{FAILURE_MESSAGES[failure]}</Text>
              </View>
            </Animated.View>
          ) : null}

          <Button size="lg" disabled={submitting} onPress={handleSubmit}>
            <Text>{submitting ? strings.common.loading : strings.auth.unlock}</Text>
          </Button>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
