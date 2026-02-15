import { expect, test } from "@playwright/test";

test.describe("Clipboard URL Suggestion", () => {
  test.beforeEach(async ({ context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  });

  test("shows toast when a URL is in the clipboard", async ({ page }) => {
    await page.goto("/home");
    await page.waitForLoadState("networkidle");

    const testUrl = `https://example.com/clipboard-test-${Date.now()}`;
    await page.evaluate((url) => navigator.clipboard.writeText(url), testUrl);

    // Trigger focus event to check clipboard
    await page.evaluate(() => window.dispatchEvent(new Event("focus")));

    // Toast should appear with the URL
    await expect(
      page.locator("text=URL found in clipboard"),
    ).toBeVisible({ timeout: 5_000 });
    await expect(page.locator(`text=${testUrl}`)).toBeVisible();
  });

  test("Save button adds item to coolection", async ({ page }) => {
    await page.goto("/home");
    await page.waitForLoadState("networkidle");

    const testUrl = `https://example.com/clipboard-save-${Date.now()}`;
    await page.evaluate((url) => navigator.clipboard.writeText(url), testUrl);
    await page.evaluate(() => window.dispatchEvent(new Event("focus")));

    // Wait for the toast with our specific URL, then click its Save button
    const toastWithUrl = page.locator('[data-sonner-toast]').filter({ hasText: testUrl });
    await expect(toastWithUrl).toBeVisible({ timeout: 5_000 });
    await toastWithUrl.getByRole("button", { name: "Save" }).click();

    // Should show success toast
    await expect(
      page.locator("text=added successfully"),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("does not show toast for non-URL clipboard content", async ({ page }) => {
    // Write non-URL text before navigating so clipboard is set on page load
    await page.goto("/home");
    await page.waitForLoadState("networkidle");

    // Wait for any lingering toasts from prior tests to clear
    await page.locator('[data-sonner-toast]').waitFor({ state: "hidden", timeout: 10_000 }).catch(() => {});

    await page.evaluate(() => navigator.clipboard.writeText("not a url"));
    await page.evaluate(() => window.dispatchEvent(new Event("focus")));

    // Toast should NOT appear
    await expect(
      page.locator("text=URL found in clipboard"),
    ).not.toBeVisible({ timeout: 3_000 });
  });

  test("does not show duplicate toast for same URL", async ({ page }) => {
    await page.goto("/home");
    await page.waitForLoadState("networkidle");

    const testUrl = `https://example.com/clipboard-dedup-${Date.now()}`;
    await page.evaluate((url) => navigator.clipboard.writeText(url), testUrl);
    await page.evaluate(() => window.dispatchEvent(new Event("focus")));

    await expect(
      page.locator("text=URL found in clipboard"),
    ).toBeVisible({ timeout: 5_000 });

    // Wait for the toast to auto-dismiss (8s duration)
    await expect(
      page.locator("text=URL found in clipboard"),
    ).not.toBeVisible({ timeout: 12_000 });

    // Trigger focus again with same URL — should not show again
    await page.evaluate(() => window.dispatchEvent(new Event("focus")));
    await expect(
      page.locator("text=URL found in clipboard"),
    ).not.toBeVisible({ timeout: 3_000 });
  });
});
