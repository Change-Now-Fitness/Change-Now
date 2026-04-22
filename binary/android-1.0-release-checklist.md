# Android 1.0 Release Checklist

This checklist tracks the minimum work to get ChangeNow into Android testing quickly, then tighten it into a final 1.0 binary release.

## Build Profiles

- `preview` build: internal APK for rapid tester installs.
- `production` build: Android App Bundle for Play Console submission.
- Expo build config lives in `frontend/eas.json`.

## Release Goals

- Installable Android build on real devices.
- Core workout flow works against the live backend.
- Every discovered bug is logged and triaged.
- Release blockers are resolved before the final Android binary is cut.

## Required Configuration

- `frontend/app.json` has a valid Android package name and version code.
- `frontend/assets/images/` contains the icon, splash image, and adaptive icon assets used by Expo config.
- `EXPO_PUBLIC_API_URL` points to `https://api.changenow.fit` or another reachable hosted backend before preview and production builds are cut.
- Backend secrets remain server-side only.

## Rapid Test Build

- Build Android preview APK.
- Install on at least two physical Android devices if possible.
- Verify app launches cleanly from a fresh install.
- Verify sign up works.
- Verify log in works.
- Verify app restart preserves login state.
- Verify exercise library loads.
- Verify custom exercise creation works.
- Verify adding a set works.
- Verify workout history loads.

## Release Blockers

- App does not install.
- App crashes on launch.
- User cannot sign up.
- User cannot log in.
- Exercise library fails to load.
- User cannot save workout data.
- Saved workout data is incorrect or disappears.

## Bug Tracking Rules

- One GitHub issue per bug.
- Include Android version, device model, app build, and exact repro steps.
- Mark severity as blocker, high, medium, or low.
- Attach a screenshot or screen recording whenever possible.
- Link each bug to the test case or flow it breaks.

## Final Android Candidate

- Preview build regressions are triaged.
- All release blockers are closed.
- Known non-blocking bugs are still documented.
- Play Console listing copy, screenshots, support email, and privacy policy are ready.
- Final production build is generated from the `production` EAS profile.
