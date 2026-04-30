# ChangeNow 1.0 Source Distribution And Developer Handoff Guide

## Overview

This source distribution contains the code, configuration templates, documentation, and tests needed for a developer or course evaluator to build and continue the ChangeNow 1.0 release from source.

The package includes:

- `frontend/`: Expo React Native app, Expo web target, Jest tests, and Playwright end-to-end tests.
- `backend/`: Express REST API server, runtime configuration validation, Dockerfile, and deployment support files.
- `docs/`: source build instructions, testing procedures, deployment/admin runbooks, and release support notes.
- `assets/`: shared project image assets.

Primary source repository:

- `https://github.com/Change-Now-Fitness/Change-Now`

## Required Tools And Build Assumptions

Required tools:

- Node.js `20.x`
- npm `10.x`
- Git
- Expo CLI through `npx expo`
- Java JDK for Android Gradle builds. Android Studio's bundled JDK is acceptable.
- Android Studio emulator, Expo Go, or a web browser for frontend testing
- Local environment variable support through `.env` files

Backend runtime assumptions:

- The backend runs on `http://localhost:4000` for local source builds.
- Production-like source testing can use `https://api.changenow.fit` if local database credentials are unavailable.
- The backend requires a reachable PostgreSQL database, currently Supabase-hosted.
- Backend secrets are not committed. Copy `backend/.env.example` to `backend/.env` and provide real values.

Frontend runtime assumptions:

- Copy `frontend/.env.example` to `frontend/.env`.
- Set `EXPO_PUBLIC_API_URL=http://localhost:4000` for local full-stack source testing.
- Set `EXPO_PUBLIC_API_URL=http://10.0.2.2:4000` when running the source app in the Android Studio emulator against the local backend.
- Set `EXPO_PUBLIC_API_URL=https://api.changenow.fit` only when intentionally testing against the hosted backend.
- Restart Expo after changing `EXPO_PUBLIC_API_URL`.

Course staff should receive any hosted service credentials through the approved course submission channel. Do not rely on local untracked `.env` files being present in a fresh source checkout.

## One-Step Local Build

From the repository root:

```powershell
npm run install:all
npm run start
```

Expected result:

- Backend starts at `http://localhost:4000`.
- Expo starts and prints the local web, Android emulator, and Expo Go launch options.

Windows convenience script:

```powershell
.\setup-and-run.bat
```

The script installs backend and frontend dependencies, creates `backend/.env` from `backend/.env.example` if missing, opens the backend in a new terminal, and starts Expo with a cleared cache.

Mac/Linux users should use the manual steps below.

## Manual Backend Build

```bash
cd backend
npm install
npm run validate:env
npm start
```

Useful verification endpoints:

- `GET http://localhost:4000/health`
- `GET http://localhost:4000/api/health`
- `GET http://localhost:4000/ready`
- `GET http://localhost:4000/api/ready`
- `GET http://localhost:4000/api-docs`

`/ready` confirms the backend can reach the configured database.

## Manual Frontend Build

In a second terminal:

```bash
cd frontend
npm install
npm start
```

Expo can launch the app through:

- Web browser
- Android emulator
- Expo Go mobile app

For local full-stack testing, make sure `frontend/.env` contains:

```env
EXPO_PUBLIC_API_URL=http://localhost:4000
```

## Android Emulator Source Startup

The Android emulator can run the source app in either of two ways:

- Hosted backend mode: easiest for graders and demos because the app uses `https://api.changenow.fit` and no local backend needs to be started.
- Local backend mode: best for developers changing backend code because the app uses the backend running on the same computer.

### Option A: Android Emulator With Hosted Backend

Use this path when you only need to run the source frontend in Android Studio and test against the deployed API.

1. Open Android Studio.
2. Open `Device Manager`.
3. Create or select an Android Virtual Device, such as `Pixel 8` with a recent API image.
4. Start the emulator and wait until the Android home screen is fully loaded.
5. In `frontend/.env`, point the app to the hosted API:

```env
EXPO_PUBLIC_API_URL=https://api.changenow.fit
```

6. Install dependencies if needed:

```powershell
npm run install:all
```

7. Build and launch the Android source app:

```powershell
cd frontend
npx expo run:android --no-build-cache
```

If PowerShell blocks `npx.ps1` with `running scripts is disabled on this system`, use the Windows command shim instead:

```powershell
npx.cmd expo run:android --no-build-cache
```

Expected result:

- Expo installs/opens the development app in the emulator.
- The app reaches the hosted backend at `https://api.changenow.fit`.
- Sign up, log in, Exercise Library, custom exercise creation, workout set entry, and history retrieval work while the hosted backend is online.

### Option B: Android Emulator With Local Backend

Use this path when testing local backend changes from source.

1. Open Android Studio.
2. Open `Device Manager`.
3. Create or select an Android Virtual Device, such as `Pixel 8` with a recent API image.
4. Start the emulator and wait until the Android home screen is fully loaded.
5. Start the backend from the repository root or `backend/`:

```powershell
npm run start:backend
```

or:

```powershell
cd backend
npm start
```

6. In `frontend/.env`, point the Android emulator to the host machine backend:

```env
EXPO_PUBLIC_API_URL=http://10.0.2.2:4000
```

`10.0.2.2` is the Android emulator's special address for the host computer. `localhost:4000` works for web testing on the host machine, but not for the Android emulator.

7. Build and launch the Android source app:

```powershell
cd frontend
npx expo run:android --no-build-cache
```

If PowerShell blocks `npx.ps1` with `running scripts is disabled on this system`, use:

```powershell
npx.cmd expo run:android --no-build-cache
```

Expected result:

- Expo installs/opens the development app in the emulator.
- The app can reach the local backend through `http://10.0.2.2:4000`.
- Sign up, log in, Exercise Library, custom exercise creation, workout set entry, and history retrieval work when backend database credentials are valid.

Alternative two-terminal command:

```powershell
cd frontend
npm start -- --clear
```

Then press `a` in the Expo terminal.

Use the two-terminal path only after a matching ChangeNow native development build has already been installed on the emulator. If Expo opens Expo Go or an old installed native shell, use `npx expo run:android --no-build-cache` instead.

## Android Emulator Troubleshooting

### Invalid `JAVA_HOME`

If `npx expo run:android --no-build-cache` fails with:

```text
ERROR: JAVA_HOME is set to an invalid directory
```

Point `JAVA_HOME` at a real JDK folder. On Windows with Android Studio installed, the bundled JDK is commonly:

```text
C:\Program Files\Android\Android Studio\jbr
```

If that bundled JDK fails with `could not open ...\lib\jvm.cfg`, use an installed JDK instead. For example:

```text
C:\Program Files\Java\jdk-21
```

For the current Command Prompt session:

```cmd
set JAVA_HOME=C:\Program Files\Android\Android Studio\jbr
set PATH=%JAVA_HOME%\bin;%PATH%
java -version
npx expo run:android --no-build-cache
```

If using the installed JDK fallback:

```cmd
set JAVA_HOME=C:\Program Files\Java\jdk-21
set PATH=%JAVA_HOME%\bin;%PATH%
java -version
npx expo run:android --no-build-cache
```

To persist the setting for future terminals:

```cmd
setx JAVA_HOME "C:\Program Files\Android\Android Studio\jbr"
```

or, if using the installed JDK fallback:

```cmd
setx JAVA_HOME "C:\Program Files\Java\jdk-21"
```

`setx` does not update the Command Prompt window that is already open. Either close and reopen Command Prompt after `setx`, or run the temporary `set JAVA_HOME=...` command in the current window before running Expo again.

After reopening Command Prompt, run:

```cmd
cd C:\Change-Now\frontend
npx expo run:android --no-build-cache
```

If Android Studio is installed in a different folder, use that installation's `jbr` folder instead. Do not include `\bin` in `JAVA_HOME`; `JAVA_HOME` should point to the JDK root.

### Stale Native Shell

If the emulator shows an error like:

```text
[runtime not ready]: Invariant Violation: TurboModuleRegistry.getEnforcing(...):
'PlatformConstants' could not be found.
```

The JavaScript bundle is running in the wrong or stale native Android shell. Fix it with:

```powershell
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" uninstall com.changenow.app
cd frontend
npx expo run:android --no-build-cache
```

If PowerShell blocks `npx.ps1`, run the same command through `npx.cmd`:

```powershell
npx.cmd expo run:android --no-build-cache
```

Also confirm that:

- You are running commands from `frontend/`, not the repository root, for Android launch commands.
- `frontend/package.json` does not contain a dependency on `"changenow-root": "file:.."`.
- Node.js `20.x` is preferred for the source release. Other Node versions may work, but they are not the documented grading target.

## Build Verification

After a successful source build:

- Backend responds at `http://localhost:4000/health`.
- Backend readiness at `http://localhost:4000/ready` succeeds when database credentials are correct.
- Frontend launches through Expo.
- A user can sign up and log in.
- The Exercise Library loads.
- Custom exercises can be created.
- Workout sets can be added and deleted.
- Workout history can be retrieved for an exercise.

This verifies that the source build can reproduce the expected 1.0 behavior when pointed at a working backend and database.

## Test Instructions

### Unit Tests

Run the frontend unit test suite:

```bash
npm test --prefix frontend
```

Major covered areas:

- Exercise Library rendering and custom exercise flow
- Login screen behavior
- Signup validation and success path
- API helpers for adding sets, fetching exercises, current sets, and exercise history

Expected result:

- All Jest tests pass.
- Network calls are mocked, so the unit tests do not require a running backend.

### Integration / System Tests

Automated Playwright end-to-end tests:

```bash
cd frontend
npx playwright install
npm run test:e2e
```

Expected result:

- The configured web flow completes without blocking errors.
- Test artifacts appear under `frontend/test-results` when failures occur.

Manual system test flow:

1. Start the backend and frontend.
2. Sign up with a new account.
3. Log in.
4. Open the Exercise Library.
5. Add a custom exercise.
6. Select an exercise.
7. Add a workout set.
8. Reopen the exercise and verify history.

Expected result:

- The full client to server to database to client workflow completes.
- New exercise and workout data appears correctly in the UI and history view.

Additional testing details:

- `docs/testing/test.md`
- `docs/testing/manual.md`
- `docs/admin/TESTING.md`
- `frontend/test/e2e/howToRunE2E.md`

## Source Documentation

Source and admin runbooks live in:

- `README.md`
- `backend/README.md`
- `docs/admin/BACKEND.md`
- `docs/admin/FRONTEND.md`
- `docs/admin/CI_CD.md`
- `docs/admin/CLOUD_EC2_NGINX.md`
- `docs/admin/RUNETIME_SECRETS.md`
- `docs/admin/TROUBLESHOOTING.md`

## Change Logs And Development History

Development history is available through:

- Git commit history in this repository.
- Pull request history on GitHub.
- `docs/changelog.md`, which summarizes major 1.0 changes and recent release-facing work.

Useful recent source-history command:

```bash
git log --oneline -n 20
```

## Issue Tracking System

The project uses GitHub Issues in `Change-Now-Fitness/Change-Now` for:

- Bugs
- Feature requests
- Integration blockers
- Milestone tasks
- Release issues

Known source-release issues should be tracked with issue numbers in GitHub Issues. See `docs/issue-tracking.md` for issue-report quality expectations.

## Known 1.0 Release Limitations

- Production-like source testing against the hosted API depends on `https://api.changenow.fit` being online.
- Local source builds require valid database credentials in `backend/.env`.
- Graph and history clarity still need polish.
- The selected exercise screen can visibly reload after adding a set.
- Duplicate custom exercise naming rules need tightening.
- Some set-entry labels and cues can be clearer for first-time users.

## Rubric Readiness Rating

Source Release rating: likely strong, with a few documentation-dependent risks.

- Build description: ready. This guide provides start-to-finish source build steps.
- Environment assumptions: ready. Required tools, env files, hosted API, database assumptions, and staff access references are listed.
- Accuracy: ready, assuming `.env` values supplied to graders are valid.
- Simplicity: ready. Root npm scripts and the Windows batch script provide low-friction setup.
- Completeness: mostly ready. Source, lockfiles, env examples, assets, tests, and runbooks are present.
- Built version correctness: ready if backend database credentials and API URL are configured correctly, including `http://10.0.2.2:4000` for Android emulator local-backend testing.
- Unit tests: ready. Jest unit tests cover major frontend components and API helpers.
- Integration/system tests: ready. Playwright and manual full-flow tests are documented.
- Revision tracking: ready. Git history plus `docs/changelog.md` cover release-relevant evolution.
- Issue tracking: ready if GitHub Issues remain current and known release issues stay linked.

Remaining checklist before submission:

- Confirm the submitted package includes this file, `.env.example` files, package lockfiles, `docs/`, `assets/`, and test files.
- Confirm hosted/staff credentials are provided through the approved course channel if graders are expected to use the hosted backend.
- Confirm SRS and SDS 1.0 documents are included wherever the course expects them. They are graded separately from source release but referenced by the rubric.
