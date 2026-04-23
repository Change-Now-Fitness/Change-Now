# ChangeNow Binary Release Notes

This binary package is intended for course staff to install and evaluate the Android application without the Google Play Store.

## Package Contents

- `android/ChangeNow-1.0-release.apk`
- `server/ChangeNow-backend-server.zip`
- `RELEASE_NOTES.md`
- `PRODUCT_DOCUMENTATION.md`
- `COURSE_STAFF_ACCESS.md`

## What This Binary Is

- The Android APK is a standalone release build.
- It does not require Expo Go, Metro, or `adb reverse`.
- It is configured to call the hosted backend at `https://api.changenow.fit`.
- The backend server package is still included separately so an administrator can install and inspect the server application if needed.

## Required Software

Install these before running the package:

- Android Studio
- Android SDK Platform Tools
- Node.js `20.x`
- npm `10.x`

## Install And Run

The commands below assume Windows PowerShell.

### 1. Verify the hosted backend is reachable

Check these in a browser:

- `https://api.changenow.fit/health`
- `https://api.changenow.fit/ready`

### 2. Create and boot an Android emulator

In Android Studio:

1. Open `Device Manager`.
2. Create a device such as `Pixel 8`.
3. Choose a recent Android image such as `API 35`.
4. Start the emulator and wait for it to fully boot.

### 3. Install the Android APK

Open a new PowerShell window and run:

```powershell
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" install -r .\android\ChangeNow-1.0-release.apk
```

Expected result:

- PowerShell prints `Success`.
- The app appears on the emulator as `Change-Now`.

### 4. Launch and evaluate the app

Open `Change-Now` on the emulator and use the hosted backend at `https://api.changenow.fit`.

### 5. Optional server package install

If the evaluator wants to install the backend package separately:

1. Unzip `server/ChangeNow-backend-server.zip`.
2. Review the included `.env` or provide the correct hosted env values.
3. Run:

```powershell
npm install
npm run validate:env
npm start
```

## Working Commands / Features

The following user-facing commands are working in the current binary when the backend and database are configured correctly:

- Create account
- Log in
- Log out
- Load exercise library
- Select an exercise
- Create custom exercise
- Add workout set
- Delete workout set
- Load history data for an exercise

## Product Documentation

For a concise overview of the product architecture, main user flows, and major components, see:

- `PRODUCT_DOCUMENTATION.md`

## Recommended Demo Flow

1. Confirm the hosted backend health endpoint works.
2. Start the Android emulator.
3. Install the APK.
4. Create a new account.
5. Log in.
6. Open the exercise library.
7. Choose an exercise such as Bench Press.
8. Add a set such as `100 lbs` and `5 reps`.
9. Verify the set appears in the UI.
10. Delete the set and confirm it disappears.

## Known Issues And Release Limitations

### Tracked product issues

- Graph and history clarity still need polish. See [Issue #59](https://github.com/Change-Now-Fitness/Change-Now/issues/59): `Historical data for workout sets`.
- The selected exercise screen still has a visible reload after adding a set. See [Issue #86](https://github.com/Change-Now-Fitness/Change-Now/issues/86): `Adding sets causes a visible reload in selected exercise screen after update. Makes UI slightly clunky`.
- Duplicate custom exercise naming rules still need tightening. See [Issue #69](https://github.com/Change-Now-Fitness/Change-Now/issues/69): `Same custom exercise name with different tags`.
- Some set-entry UI labels and cues can still be confusing to new users. See [Issue #70](https://github.com/Change-Now-Fitness/Change-Now/issues/70): `Confusing UI`.

### Release limitations

- This APK depends on `https://api.changenow.fit` being up and correctly configured.
- The release APK is signed with the default debug keystore for course distribution. It is installable, but it is not suitable for Google Play submission.
- Offline behavior is limited. Some previously loaded data may remain visible, but actions that require the API will fail without network or hosted backend access.
- The included backend server package still needs correct env values if it is installed separately.
- The packaged `.env` contains course-use credentials for grading convenience and should be rotated after grading is complete.
