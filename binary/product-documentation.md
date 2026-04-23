# ChangeNow Product Documentation

## Product Summary

ChangeNow is a workout tracking application with Android/mobile and web clients backed by an Express API and PostgreSQL database.

The product lets a user:

- create an account
- log in and log out
- browse an exercise library
- create custom exercises
- record workout sets
- delete workout sets
- view historical workout data for an exercise

## Major Product Areas

### Client Applications

- Android/mobile client: Expo / React Native
- Web client: Expo web

The client is responsible for authentication, exercise browsing, set entry, and historical workout views.

### Backend API

- Platform: Node.js / Express
- Purpose: auth, exercise data, workout logging, history retrieval
- Public hosted API target: `https://api.changenow.fit`

### Database

- Platform: PostgreSQL (Supabase-hosted)
- Purpose: users, exercises, custom exercises, workout logs, and related app data

The database is not bundled in the binary package, but the packaged backend can connect to it using environment configuration.

### Deployment Model

- Hosted backend runs separately from the Android APK
- Android binary communicates with the hosted backend over HTTPS
- A backend server package is also included so course staff can inspect or run the server application directly if needed

## Main User Flows

### Authentication

1. Create account
2. Log in
3. Stay authenticated across app navigation
4. Log out

### Exercise Browsing

1. Open the exercise library
2. Filter or browse by muscle group
3. Select an exercise
4. Optionally create a custom exercise

### Workout Logging

1. Open an exercise detail screen
2. Enter weight and reps
3. Save a set
4. Delete a set if needed
5. Reopen the exercise and confirm history is still present

## Operational Notes

- The Android binary depends on `https://api.changenow.fit` being online and correctly configured.
- The included backend package uses environment variables for database and JWT configuration.
- The binary package is intended for installation and evaluation, not for Google Play submission.

## Quality And Support Materials

- Release notes: `RELEASE_NOTES.md`
- Course staff access and bug database notes: `COURSE_STAFF_ACCESS.md`
- Bug tracking system: GitHub Issues for `Change-Now-Fitness/Change-Now`

## Known Product Gaps

Known open issues relevant to the current binary are called out directly in `RELEASE_NOTES.md` with GitHub issue numbers so evaluators can trace them to the bug tracker.
