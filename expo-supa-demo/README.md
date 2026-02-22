# Expo + Supabase Demo (Email Auth + Table Data)

This repository is a minimal demo app built with **Expo React Native** and **Supabase**.

It demonstrates:
- Email/password sign up
- Email/password sign in
- Loading rows from a Supabase table
- Inserting rows into that table for the logged-in user

## 1. What You Need

Install these tools first:
- Node.js 20.19+ (recommended for Expo SDK 54)
- npm 9+
- Expo Go app on your phone (or iOS Simulator / Android Emulator)
- A Supabase account (free tier is fine)

## 2. Clone and Install

```bash
git clone <your-repo-url>
cd expo-supa-demo
npm install
npx expo install --fix
```

Why the extra command:
- `expo install --fix` ensures Expo-managed packages are aligned with Expo SDK 54.

If you previously installed dependencies for an older SDK (for example SDK 52), run this once before reinstalling:

```bash
rm -rf node_modules package-lock.json
npm install
npx expo install --fix
```

## 3. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and create a new project.
2. Wait for the project to finish provisioning.
3. In your Supabase project dashboard, open **Settings -> API**.
4. Copy:
- **Project URL** (this is your Supabase URL)
- **anon public key** (this is your Supabase anon key)

## 4. Add Environment Variables

Copy the example env file:

```bash
cp .env.example .env
```

Open `.env` and set your values:

```env
EXPO_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=YOUR-SUPABASE-ANON-KEY
```

Important:
- Variable names must start with `EXPO_PUBLIC_` so Expo can read them in the app.
- After changing `.env`, restart Expo (`npm run start`) so new values are loaded.

## 5. Set Up the Demo Table in Supabase

In Supabase, go to **SQL Editor** and run this SQL:

```sql
create table if not exists public.demo_items (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) > 0),
  created_at timestamptz not null default now()
);

alter table public.demo_items enable row level security;

create policy "Users can view their own demo items"
on public.demo_items
for select
using (auth.uid() = user_id);

create policy "Users can insert their own demo items"
on public.demo_items
for insert
with check (auth.uid() = user_id);
```

Why this matters:
- `user_id` links each row to a signed-in user.
- Row Level Security (RLS) prevents users from reading/writing other users' data.

## 6. Email Auth Notes (Supabase)

By default, Supabase email sign-up may require email confirmation.

If confirmation is ON:
- After sign-up, open your email and click the confirmation link.
- Then sign in from the app.

If you want a faster demo flow:
1. Go to **Authentication -> Providers -> Email**.
2. Disable email confirmation temporarily.

## 7. Run the App

Start Expo:

```bash
npm run start
```

Then choose one:
- Press `a` for Android emulator
- Press `i` for iOS simulator (macOS)
- Scan QR with Expo Go on your phone

## 8. How to Use the Demo

1. Create an account (or sign in).
2. On the data screen, type a title and press **Add Item**.
3. Press **Refresh** to load latest rows from `demo_items`.
4. Press **Sign Out** to return to auth screen.

## 9. Project Structure

```text
.
├── App.js
├── src
│   ├── components
│   │   ├── AuthForm.js
│   │   └── ItemList.js
│   ├── hooks
│   │   └── useAuthSession.js
│   ├── lib
│   │   └── supabase.js
│   └── screens
│       ├── AuthScreen.js
│       └── DataScreen.js
├── .env.example
└── README.md
```

## 10. Where Key Logic Lives

- `src/lib/supabase.js`
  - Creates Supabase client
  - Reads `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `src/hooks/useAuthSession.js`
  - Tracks current auth session
  - Subscribes to auth state changes
- `src/screens/AuthScreen.js`
  - Handles sign up + sign in actions
- `src/screens/DataScreen.js`
  - Reads/inserts rows in `demo_items`

## 11. Troubleshooting

- "Supabase env vars are missing"
  - Check `.env` exists and variable names are exact.
  - Restart Expo after editing `.env`.

- "Invalid login credentials"
  - Confirm the account exists and password is correct.
  - If you just signed up and email confirmation is ON, confirm email first.

- No rows appear
  - Confirm SQL setup was run successfully.
  - Confirm RLS policies exist on `public.demo_items`.
  - Make sure you are signed in.

- `The required package expo-asset cannot be found`
  - Run `npx expo install --fix`
  - Then restart with `npm run start`

- `Project is incompatible with this version of Expo Go` / SDK mismatch
  - This project targets Expo SDK 54.
  - Reinstall dependencies with:
    - `rm -rf node_modules package-lock.json`
    - `npm install`
    - `npx expo install --fix`
  - Start again with `npm run start -c`

## 12. Demo Scope

This is intentionally small and focused on core integration. It is not production-hardened (no offline handling, no advanced validation, no test suite).
