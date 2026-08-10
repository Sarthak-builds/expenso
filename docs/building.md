# Building Expenso

Expo Go does not work here — MMKV Nitro, native tabs and the `expo-font` config
plugin all need native code. **A dev build is required** before `pnpm start`
will attach to anything.

Builds are run by you, not by an agent. Everything below is a command you type.

---

## The trap: `.env` does not reach a cloud build

`.env` is gitignored, and EAS Build uploads your project **from git**. A cloud
build therefore sees none of the four `EXPO_PUBLIC_*` values, and Babel inlines
`undefined` in their place.

The app fails closed rather than silently: `isDeviceLockConfigured` is false, so
the login screen reports that the build has no device lock configured and
nobody can get in. That is the designed behaviour (ADR 0004), but it looks like
a bug if you are not expecting it.

**Fix — register the values with EAS once:**

```bash
pnpm exec eas env:create --name EXPO_PUBLIC_GEMINI_API_KEY --value "<key>" --visibility plaintext --environment production --environment preview --environment development
pnpm exec eas env:create --name EXPO_PUBLIC_USER_A_PHONE  --value "<10 digits>"  --visibility plaintext --environment production --environment preview --environment development
pnpm exec eas env:create --name EXPO_PUBLIC_USER_B_PHONE  --value "<10 digits>"  --visibility plaintext --environment production --environment preview --environment development
pnpm exec eas env:create --name EXPO_PUBLIC_PIN_HASH      --value "<sha256 hex>"  --visibility plaintext --environment production --environment preview --environment development
```

`--visibility plaintext` is deliberate and correct. Marking these `secret`
would imply a protection that does not exist: every `EXPO_PUBLIC_*` value is
inlined into the JavaScript bundle and is readable in any distributed build.
Calling them secrets in the dashboard would be the lie ADR 0004 exists to
prevent. Restrict the Gemini key in AI Studio instead — bind it to the app's
Android signature and give it a low quota.

Generate the PIN hash:

```bash
node -e "console.log(require('crypto').createHash('sha256').update('1234').digest('hex'))"
```

---

## First-time setup

```bash
pnpm exec eas login          # an Expo account; free tier is enough
pnpm exec eas init           # writes extra.eas.projectId into app.config.ts
```

Then register the env values as above.

Signing keys: let EAS generate and store the Android keystore on first build —
say yes when prompted. **Back it up** (`pnpm exec eas credentials`) once it exists.
Losing it means you can never update the app on Play under the same identity.

---

## Builds

| Goal | Command | Output |
|---|---|---|
| Dev build to develop against | `pnpm exec eas build --profile development --platform android` | APK |
| Share a testable build | `pnpm exec eas build --profile preview --platform android` | APK |
| Play Store upload | `pnpm exec eas build --profile production --platform android` | AAB |

Install the APK on the device, then `pnpm start:staging` and scan the QR.

`development` and `preview` build the `staging` variant, which installs as
*Expenso (staging)* under `com.sarthak.expenso.staging` — so it sits alongside a
production install rather than replacing it.

---

## Building locally instead

Needs JDK 17 and the Android SDK on your machine.

```bash
pnpm prebuild:staging          # generates android/ — regenerate, never hand-edit
cd android && ./gradlew assembleRelease     # APK
cd android && ./gradlew bundleRelease       # AAB
```

Local Gradle release builds need a keystore you manage yourself, in
`android/gradle.properties`. EAS is less work unless you have a reason.

`android/` is generated output and is gitignored. Re-run `prebuild` after any
change to `app.config.ts` or to a config plugin.

---

## After any dependency bump

Re-run the bundle check ADR 0005 mandates — this NativeWind + Tailwind + RN
pairing is not covered by anyone else's CI:

```bash
pnpm typecheck
pnpm exec expo export --platform android
```

Editing `.env` does not hot-reload; it is a build-time Babel transform.
Restart with `pnpm start --clear`.
