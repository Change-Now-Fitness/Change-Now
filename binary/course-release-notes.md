# ChangeNow Binary Release Notes

This binary package is intended for course staff to install and evaluate the Android application without the Google Play Store.

## Package Contents

- `android/ChangeNow-1.0-local-emulator-release.apk`
- `server/ChangeNow-backend-server.zip`
- `RELEASE_NOTES.md`
- `COURSE_STAFF_ACCESS.md`

## What This Binary Is

- The Android APK is a standalone release build.
- It does not require Expo Go, Metro, or `adb reverse`.
- It is configured for the Android emulator to call a backend running on the same machine at `http://10.0.2.2:4000`.
- The backend server package is included separately because the Android app depends on API routes for login, exercise loading, and workout logging.

## Required Software

Install these before running the package:

- Android Studio
- Android SDK Platform Tools
- Node.js `20.x`
- npm `10.x`

## Install And Run

The commands below assume Windows PowerShell.

### 1. Unzip the server package

Unzip `server/ChangeNow-backend-server.zip` somewhere on the grading machine.

### 2. Verify the backend environment file is present

The packaged backend already includes a ready-to-run `.env` file for course evaluation.

In the unzipped backend folder, confirm these files exist:

- `.env`
- `.env.example`

You do not need to create `.env` manually.

If `.env` is missing for any reason, copy `.env.example` to `.env` and contact the team for the prefilled course credentials.

### 3. Install backend dependencies

```powershell
npm install
```

### 4. Validate the backend configuration

```powershell
npm run validate:env
```

Expected result:

- The command exits successfully.
- A local warning about CORS may appear if `CORS_ALLOWED_ORIGINS` is empty. That is acceptable for local emulator grading when `CORS_ALLOW_ALL=true`.

### 5. Start the backend server

```powershell
npm start
```

Expected result:

- The server starts on port `4000`.
- Visiting `http://localhost:4000/health` in a browser returns JSON.

### 6. Create and boot an Android emulator

In Android Studio:

1. Open `Device Manager`.
2. Create a device such as `Pixel 8`.
3. Choose a recent Android image such as `API 35`.
4. Start the emulator and wait for it to fully boot.

### 7. Install the Android APK

Open a new PowerShell window and run:

```powershell
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" install -r .\android\ChangeNow-1.0-local-emulator-release.apk
```

Expected result:

- PowerShell prints `Success`.
- The app appears on the emulator as `Change-Now`.

### 8. Launch and evaluate the app

Open `Change-Now` on the emulator and use the backend running in step 5.

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

## Recommended Demo Flow

1. Start the backend server.
2. Start the Android emulator.
3. Install the APK.
4. Create a new account.
5. Log in.
6. Open the exercise library.
7. Choose an exercise such as Bench Press.
8. Add a set such as `100 lbs` and `5 reps`.
9. Verify the set appears in the UI.
10. Delete the set and confirm it disappears.

## Known Issues

- This APK is configured for the Android emulator only. It points to `10.0.2.2`, which is the emulator alias for the host machine. A physical phone would require a rebuild with a hosted backend URL or the host machine's LAN IP.
- The release APK is signed with the default debug keystore for course distribution. It is installable, but it is not suitable for Google Play submission.
- Offline behavior is limited. Some previously loaded data may remain visible, but actions that require the API will fail without network/database access.
- Graph and history UX still have rough edges. The graph is present, but detailed interaction is limited.
- The production hosted Railway backend is not relied on in this package because it was not stable enough for course submission at packaging time.
- The packaged `.env` contains course-use credentials for grading convenience and should be rotated after grading is complete.
