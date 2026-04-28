import { test, expect } from "@playwright/test";
import { readE2EEnv } from "./_env";

test("web: exercise library screen loads after login", async ({ page }) => {
  const { email, password } = readE2EEnv();

  await page.goto("/");
  await page.getByTestId("email").fill(email);
  await page.getByTestId("password").fill(password);
  await page.getByRole("button", { name: /log in/i }).click();

  await expect(page).toHaveURL(/exerciselibrary/i, { timeout: 30_000 });
  await expect(page.getByText("Exercise Library")).toBeVisible({ timeout: 30_000 });
  await expect(page.getByLabel(/Add custom exercise/i)).toBeVisible();
});

