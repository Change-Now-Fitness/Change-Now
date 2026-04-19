import {defineConfig, devices} from "@playwright/test";

export default defineConfig({
    testDir: "./test/e2e",
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    use: {
        baseURL: "http://localhost:8081",
        trace: "on-first-retry",
    },
    projects: [{ name: "chromium", use: {...devices["Desktop Chrome"]}}],
    webServer: {
        command: "npx expo start --web --port 8081",
        url: "http://localhost:8081",
        reuseExistingServer: !process.env.CI,
        timeout: 180_000,
        env: { 
            CI: "true",
            EXPO_PUBLIC_API_URL: "http://localhost:4000",
         },
    },
});