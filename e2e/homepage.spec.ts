import { expect, test } from "@playwright/test";

test.describe("Homepage", () => {
  test("loads without error on fresh navigation", async ({ page }) => {
    await page.goto("/home");
    await expect(page.locator("text=Home")).toBeVisible();
    await expect(page.locator("#search")).toBeVisible();
  });

  test("loads without error on refresh", async ({ page }) => {
    await page.goto("/home");
    await expect(page.locator("#search")).toBeVisible();

    // Wait for items to appear
    await expect(
      page.locator('[target="_blank"][rel="noreferrer noopener"]').first(),
    ).toBeVisible({ timeout: 10_000 });

    // Refresh and verify items still load
    await page.reload();
    await expect(
      page.locator('[target="_blank"][rel="noreferrer noopener"]').first(),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("items are visible (not empty state)", async ({ page }) => {
    await page.goto("/home");
    await expect(
      page.locator('[target="_blank"][rel="noreferrer noopener"]').first(),
    ).toBeVisible({ timeout: 10_000 });

    // Should not show empty state
    await expect(
      page.locator("text=You have no items in your coolection"),
    ).not.toBeVisible();
  });

  test("search filters results and clearing restores items", async ({
    page,
  }) => {
    await page.goto("/home");

    // Wait for items to load
    await expect(
      page.locator('[target="_blank"][rel="noreferrer noopener"]').first(),
    ).toBeVisible({ timeout: 10_000 });

    const initialCount = await page
      .locator('[target="_blank"][rel="noreferrer noopener"]')
      .count();

    // Type a search query
    const searchInput = page.locator("#search");
    await searchInput.fill("test-query-that-matches-nothing-xyz");
    await page.waitForTimeout(500); // debounce

    // Should show "No results" or fewer items
    const afterSearchCount = await page
      .locator('[target="_blank"][rel="noreferrer noopener"]')
      .count();
    expect(afterSearchCount).toBeLessThan(initialCount);

    // Clear search with Escape
    await searchInput.press("Escape");
    await page.waitForTimeout(500);

    // Items should be restored
    await expect(
      page.locator('[target="_blank"][rel="noreferrer noopener"]').first(),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("Load More button fetches next page", async ({ page }) => {
    await page.goto("/home");

    // Wait for initial items
    await expect(
      page.locator('[target="_blank"][rel="noreferrer noopener"]').first(),
    ).toBeVisible({ timeout: 10_000 });

    const loadMoreButton = page.locator("button", { hasText: "Load More" });

    // Only test if Load More is visible (requires enough items)
    if (await loadMoreButton.isVisible()) {
      const beforeCount = await page
        .locator('[target="_blank"][rel="noreferrer noopener"]')
        .count();

      await loadMoreButton.click();
      await page.waitForTimeout(2_000);

      const afterCount = await page
        .locator('[target="_blank"][rel="noreferrer noopener"]')
        .count();
      expect(afterCount).toBeGreaterThan(beforeCount);
    }
  });
});
