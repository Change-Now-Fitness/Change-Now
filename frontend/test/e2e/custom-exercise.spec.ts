import { test, expect } from "@playwright/test";
import { readE2EEnv } from "./_env";

const apiUrl =
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:4000";

async function cleanupCustomExercise(userId: number, name: string) {
  const listUrl = new URL(`${apiUrl}/exercises`);
  listUrl.searchParams.set("userId", String(userId));
  const res = await fetch(listUrl.toString());
  if (!res.ok) return;

  const exercises = (await res.json()) as Array<any>;
  const match = exercises.find(
    (exercise) =>
      exercise?.isCustom === true &&
      String(exercise?.name).toLowerCase() === name.toLowerCase()
  );
  if (!match) return;

  const deleteUrl = new URL(`${apiUrl}/exercises/${match.id}`);
  deleteUrl.searchParams.set("userId", String(userId));
  await fetch(deleteUrl.toString(), { method: "DELETE" });
}

test("web: user can add a custom exercise", async ({ page }) => {
  const { email, password, userId } = readE2EEnv();
  const exerciseName = "E2E Custom Press";

  await cleanupCustomExercise(userId, exerciseName);

  await page.goto("/");
  await page.getByTestId("email").fill(email);
  await page.getByTestId("password").fill(password);
  await page.getByRole("button", { name: /log in/i }).click();
  await expect(page).toHaveURL(/exerciselibrary/i, { timeout: 30_000 });

  await page.getByLabel(/Add custom exercise/i).click();
  await expect(page.getByText("Add Custom Exercise")).toBeVisible();

  await page.getByPlaceholder(/e\.g\./i).fill(exerciseName);
  await page.getByTestId("custom-exercise-save").click();

  await expect(page.getByText(exerciseName)).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText("Custom")).toBeVisible();
});

