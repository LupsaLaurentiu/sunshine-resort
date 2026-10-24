# Sunshine Resort — Android TV test application

The Android TV package reuses `apps/tv`'s React interface, offline resort and
attraction photographs, canonical logo, bundled Montserrat and existing HTTPS
reservation API. The native host loads local assets with AndroidX
`WebViewAssetLoader`; it does not require a separate backend or a database change.

## Build

Requirements: Node 22, dependencies installed in `apps/tv`, JDK 17, Android SDK
platform 35 and Build Tools 35.0.0. Set `JAVA_HOME` and `ANDROID_HOME` for a standard
toolchain installation. Gradle 8.11.1 is pinned by the wrapper with a distribution
SHA-256 checksum; Android Gradle Plugin is 8.9.2 and AndroidX WebKit is 1.12.1.
The build script also recognizes the isolated toolchain under the workspace's
`.tmp/sunshine-android-tools` directory used for the first hardware test.

Configure `VITE_TV_API_URL` in the ignored `.env.reservations.local` as for the LG
reservation build. Only a trusted HTTPS API base is accepted; no device secret or
PMS account is embedded in the APK.

```powershell
cd apps/tv
npm ci
npm test
npm run android:build
```

This runs TypeScript, builds Android web assets into ignored `dist-android`,
prepares the launcher icon/banner from the existing logo and copies the font
license. Gradle then builds and lints the debug APK. The test artifact is:

`apps/tv/artifacts/android/sunshine-resort-0.3.6-android.1-debug.apk`

Application ID: `com.sunshine.resort.tv`. Android version code: 1; version name:
`0.3.6-android.1`. Minimum Android API: 26; target API: 35. This is a signed debug
PoC for supervised hardware testing. WebView debugging is enabled only for debug
builds. Keep the local debug signing key for updates that preserve application
data; do not use it as a production distribution key.

## Install and pair

Enable the Sony developer options and ADB debugging, connect the laptop and TV to
the same local network, then approve the laptop's debugging authorization on TV.
No OEM unlocking, firmware replacement or launcher disabling is required.

```powershell
adb connect <tv-ip>:5555
adb devices
adb -s <tv-ip>:5555 install -r artifacts/android/sunshine-resort-0.3.6-android.1-debug.apk
adb -s <tv-ip>:5555 shell am start -W -n com.sunshine.resort.tv/.MainActivity
```

The first launch generates a separate random device identity in app-local
storage and displays a pairing code. Associate that code with the desired
physical apartment in PMS → Camere. Existing LG identities/pairings are not
copied. Updates with the same application ID and signing key preserve this
identity; uninstalling or clearing application data requires pairing again.

## Native behaviour and privacy

- TV launcher discovery uses `MAIN`, `LAUNCHER` and `LEANBACK_LAUNCHER`, with a
  Sunshine Resort icon and 320×180 banner. Touchscreen hardware is not required.
- Native D-pad arrows go to the shared navigation, OK clicks the focused button,
  Back uses the existing section/exit-dialog logic and Home remains under Android
  control. Confirming exit finishes the native activity.
- The JavaScript bridge exposes only `closeApp`. Top-level navigation is limited
  to the local HTTPS asset origin. File/content access and cleartext network
  traffic are disabled; TLS errors retain WebView's default rejection behaviour.
- Activity pause clears guest personalization, aborts requests and suspends
  polling/animations. The visibility guard also prevents a background refresh if
  WebView has not yet updated `document.hidden`. Resume refreshes authorized data.
- The existing server lease and checkout-expiry rules remain in force. Only the
  revocable device credential is persisted; guest content is held in memory.
- Native Android backup is disabled. No overlay, Accessibility, boot receiver or
  foreground-service permissions are requested by Sunshine itself in this PoC.

## Automatic-start test

Select **Sunshine Resort** in OnStartApps, with launch on device startup enabled.
Return to the Sony Home screen, perform a full restart and leave the remote
untouched. Record whether Sunshine opens automatically, how long it takes, and
whether the room pairing is preserved. Repeat at least three times. Also confirm
that guests can exit Sunshine and open ordinary TV/other applications.

The utility handles automatic launch; Sunshine is an ordinary TV launcher app.
Success on one model/firmware does not certify another Sony or Google TV model.

## Hardware record — 24 October 2026

- Sony XR-50X93J; Android reports `BRAVIA 4K VH2`, API 31 / Android 12.
- User screenshot: security patch 1 May 2026. The device's current WebView reports
  `156.0.8078.47`.
- The user confirmed OnStartApps launches the previously selected test app after
  complete restarts before installing Sunshine.
- The first Android APK was installed successfully. Inspector checks confirmed
  local photographs, Montserrat, native bridge, Romanian Home, 960×540 CSS
  viewport and no document overflow.
- Native ADB key events confirmed D-pad, OK, RO/EN, Back, exit-dialog focus and
  cancellation. Actual exit returned to Sony Home; reopening retained the same
  device identity and PMS pairing, with the authenticated content endpoint
  returning HTTP 200. The user associated this TV with Intimate1.
- With Sunshine selected in OnStartApps, three full restarts opened Sunshine
  automatically without a remote key press (boot counters 139, 140 and 141).
  The room pairing survived and the authenticated content endpoint returned
  HTTP 200 after the final restart. The user confirmed successful operation.
- This records the tested Sony and firmware only; power-loss recovery and
  other models have not been certified by these restart checks.

After testing a borrowed TV, restore the owner's original OnStartApps choice and
revoke the temporary TV in PMS if it will no longer be used for resort tests.
