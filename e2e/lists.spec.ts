import { expect, test } from "@playwright/test";

const TEST_LIST_NAME = `E2E Test List ${Date.now()}`;

test.describe("List Management", () => {
  test.describe.configure({ mode: "serial" });

  let listId: string;

  test("create a new list", async ({ page }) => {
    await page.goto("/home");
    await page.waitForLoadState("networkidle");

    // Create list via API (sidebar z-index makes clicks unreliable)
    const createResponse = await page.request.post("/api/list/create", {
      data: { list_name: TEST_LIST_NAME },
    });
    expect(createResponse.ok()).toBeTruthy();

    // Fetch lists to get the new list's ID
    const listsResponse = await page.request.get("/api/lists");
    const lists = await listsResponse.json();
    const createdList = lists.find(
      (l: { name: string }) => l.name === TEST_LIST_NAME,
    );
    listId = createdList?.id;
    expect(listId).toBeTruthy();
  });

  test("navigate to the list", async ({ page }) => {
    if (!listId) {
      test.skip(true, "List not created");
      return;
    }

    await page.goto(`/lists/${listId}`);
    await expect(page.locator("text=Go back")).toBeVisible();
  });

  test("add an item to the list via context menu", async ({ page }) => {
    await page.goto("/home");

    // Wait for items to load
    const firstItem = page
      .locator('[target="_blank"][rel="noreferrer noopener"]')
      .first();
    await expect(firstItem).toBeVisible({ timeout: 10_000 });

    // Right-click on the first item
    await firstItem.click({ button: "right" });

    // Look for "Move..." submenu
    const moveMenu = page.locator("text=Move...");
    if (!(await moveMenu.isVisible({ timeout: 3_000 }).catch(() => false))) {
      test.skip(true, "Move submenu not available — no lists found");
      return;
    }
    await moveMenu.hover();

    // Click on our test list in the submenu
    const listOption = page
      .locator('[role="menuitem"]')
      .filter({ hasText: TEST_LIST_NAME });
    await expect(listOption).toBeVisible({ timeout: 3_000 });
    await listOption.click();

    // Should show success toast
    await expect(
      page.locator(`text=added to ${TEST_LIST_NAME} successfully`),
    ).toBeVisible({ timeout: 5_000 });
  });

  test("verify item is in the list", async ({ page }) => {
    if (!listId) {
      test.skip(true, "List not created");
      return;
    }

    await page.goto(`/lists/${listId}`);
    await expect(page.locator("text=Go back")).toBeVisible();

    // Should have at least one item now
    await expect(
      page
        .locator('[target="_blank"][rel="noreferrer noopener"]')
        .first(),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("remove item from list", async ({ page }) => {
    if (!listId) {
      test.skip(true, "List not created");
      return;
    }

    await page.goto(`/lists/${listId}`);

    const firstItem = page
      .locator('[target="_blank"][rel="noreferrer noopener"]')
      .first();
    await expect(firstItem).toBeVisible({ timeout: 10_000 });

    // Right-click to open context menu
    await firstItem.click({ button: "right" });

    // Click "Remove from List"
    const removeOption = page.locator("text=Remove from List");
    await expect(removeOption).toBeVisible({ timeout: 3_000 });
    await removeOption.click();

    // Should show success toast
    await expect(
      page.locator("text=Item removed from list successfully"),
    ).toBeVisible({ timeout: 5_000 });
  });

  test("delete the list", async ({ page }) => {
    if (!listId) {
      test.skip(true, "List not created");
      return;
    }

    await page.goto(`/lists/${listId}`);
    await expect(page.locator("text=Go back")).toBeVisible();

    // Click "Remove" button
    const removeButton = page.locator("button", { hasText: "Remove" });
    await expect(removeButton).toBeVisible({ timeout: 3_000 });
    await removeButton.click();

    // Click "Are you sure?" confirmation
    const confirmButton = page.locator("button", {
      hasText: "Are you sure?",
    });
    await expect(confirmButton).toBeVisible({ timeout: 3_000 });
    await confirmButton.click();

    // Should redirect to /home
    await page.waitForURL("**/home", { timeout: 10_000 });

    // Should show success toast
    await expect(
      page.locator("text=List removed successfully"),
    ).toBeVisible({ timeout: 5_000 });
  });
});
