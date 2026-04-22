Playwright web E2E testing

Default API target:
- `https://api.changenow.fit`

Run steps:
1. Navigate to `Change-Now/frontend`
2. Run `npm install`
3. Run `npx playwright install` if the browser binaries are not already installed
4. Run `npm run test:e2e`

Optional local backend override:
- If you want the web app to hit a local backend instead, set `EXPO_PUBLIC_API_URL=http://localhost:4000` in the same terminal before running `npm run test:e2e`

Playwright environment settings live in:
- `frontend/playwright.config.ts`
