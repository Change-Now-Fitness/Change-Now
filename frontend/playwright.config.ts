import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./test/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,

  use: {
    // IMPORTANT: when webServer is an array, set baseURL explicitly
    baseURL: "http://localhost:8081",
    trace: "on-first-retry",
  },

  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],

  webServer: [
    {
      name: "backend",
      cwd: "../backend",
      command: "npm start",
      url: "http://localhost:4000/health",
      reuseExistingServer: !process.env.CI,
      timeout: 180_000,
      env: {
        NODE_ENV: "development",
        PORT: "4000",
        PUBLIC_API_URL: "http://localhost:4000",

        // Cookie/CORS settings that work for localhost web + localhost API
        COOKIE_SECURE: "false",
        COOKIE_SAME_SITE: "lax",
        CORS_ALLOWED_ORIGINS: "http://localhost:8081",

      },
    },
    {
      name: "expo-web",
      command: "npx expo start --web --port 8081",
      url: "http://localhost:8081",
      reuseExistingServer: !process.env.CI,
      timeout: 180_000,
      env: {
        EXPO_PUBLIC_API_URL: "http://localhost:4000",
      },
    },
  ],
});