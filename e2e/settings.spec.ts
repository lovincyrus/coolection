import { expect, test } from "@playwright/test";

test.describe("Settings", () => {
  test("settings page loads", async ({ page }) => {
    await page.goto("/settings");
    await expect(page.locator("text=Settings")).toBeVisible();
  });

  test("API tokens section is visible", async ({ page }) => {
    await page.goto("/settings");
    await expect(page.locator("text=API Tokens")).toBeVisible();
    await expect(
      page.locator("text=Generate tokens to use with the Coolection browser extensions."),
    ).toBeVisible();
  });

  test("GitHub Stars section is visible", async ({ page }) => {
    await page.goto("/settings");
    await expect(page.locator("text=GitHub Stars")).toBeVisible();
  });
});
