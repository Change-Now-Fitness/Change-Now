import { test, expect } from "@playwright/test";

test("User can log in and log out", async ({ page }) => {
  const email = process.env.E2E_EMAIL ?? "test@example.com";
  const password = process.env.E2E_PASSWORD ?? "password";

  const loginRespPromise = page.waitForResponse((resp) => {
    const url = resp.url();
    return (
      (url.includes("/auth/login") || url.includes("/api/auth/login")) &&
      resp.request().method() === "POST"
    );
  });

  await page.goto("/");

  await page.getByTestId("email").fill(email);
  await page.getByTestId("password").fill(password);
  await page.getByRole("button", { name: /log in/i }).click();

  const loginResp = await loginRespPromise;
  expect(loginResp.ok(), `login failed: HTTP ${loginResp.status()}`).toBeTruthy();

  // Your app navigates here on successful login:
  await expect(page).toHaveURL(/exerciselibrary/i, { timeout: 30_000 });

  // Now go to profile tab route (matches your file: app/(tabs)/userscreen.tsx)
  await page.goto("/(tabs)/userscreen");

  await expect(page.getByText(/Welcome/i)).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText(/logged in/i)).toBeVisible({ timeout: 30_000 });

  await page.getByRole("button", { name: /log out/i }).click();

  // After logout, app routes back to "/"
  await expect(page).toHaveURL(/\/?$/, { timeout: 30_000 });
  await expect(page.getByRole("button", { name: /log in/i })).toBeVisible({
    timeout: 30_000,
  });
});