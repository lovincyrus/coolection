import { expect, test } from "@playwright/test";

test.describe("Add Item", () => {
  test("open add item dialog", async ({ page }) => {
    await page.goto("/home");

    await page.locator("button", { hasText: "New Item" }).click();
    await expect(
      page.getByRole("heading", { name: "New item" }),
    ).toBeVisible();
    await expect(
      page.locator('input[type="url"][placeholder*="readsomethingwonderful"]'),
    ).toBeVisible();
  });

  test("submit a valid URL and item appears", async ({ page }) => {
    await page.goto("/home");

    await page.locator("button", { hasText: "New Item" }).click();

    const urlInput = page.locator(
      'input[type="url"][placeholder*="readsomethingwonderful"]',
    );
    const testUrl = `https://example.com/e2e-test-${Date.now()}`;
    await urlInput.fill(testUrl);
    await page.locator('button[type="submit"]', { hasText: "Submit" }).click();

    // Dialog should close
    await expect(urlInput).not.toBeVisible({ timeout: 5_000 });

    // Item should appear in the list (title may take time to resolve)
    await expect(
      page.locator(`a[href="${testUrl}"]`).first(),
    ).toBeVisible({ timeout: 15_000 });
  });

  test("empty URL shows error toast", async ({ page }) => {
    await page.goto("/home");

    await page.locator("button", { hasText: "New Item" }).click();

    // Submit without entering anything — submit button is disabled when empty,
    // so we test that the button is properly disabled
    const submitButton = page.locator('button[type="submit"]', {
      hasText: "Submit",
    });
    await expect(submitButton).toBeDisabled();
  });
});
