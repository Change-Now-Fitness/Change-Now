import { test, expect } from "@playwright/test";

test("User can log in and log out", async ({ page }) => {
  await page.goto("/");
  await page.getByTestId("email").fill("test@example.com");
  await page.getByTestId("password").fill("password");
  await page.getByRole("button", { name: /log in/i }).click();
  await page.goto("/userscreen");
  await expect(page.getByText(/Welcome/i)).toBeVisible({timeout: 15000});
  await expect(page.getByText(/logged in/i)).toBeVisible({timeout: 15000});
  await page.getByRole("button", { name: /log out/i }).click();
  await expect(page.getByText(/log in/i)).toBeVisible({timeout: 15000});
  await page.goto("/userscreen");
  await expect(page.getByText(/log in/i)).toBeVisible({timeout: 15000});
});