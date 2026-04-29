import { test, expect } from "@playwright/test";
import { readE2EEnv } from "./_env";

test("web: user can log in and log out", async ({ page }) => {
  const { email, password } = readE2EEnv();

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

  await expect(page).toHaveURL(/exerciselibrary/i, { timeout: 30_000 });

  await page.goto("/(tabs)/userscreen");
  await expect(page.getByText(/Welcome,/i)).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText(/Logged in/i)).toBeVisible({ timeout: 30_000 });

  await page.getByRole("button", { name: /log out/i }).click();
  await expect(page).toHaveURL(/\/?$/, { timeout: 30_000 });
  await expect(page.getByRole("button", { name: /log in/i })).toBeVisible();
});

