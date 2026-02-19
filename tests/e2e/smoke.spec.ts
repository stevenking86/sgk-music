import { expect, test } from "@playwright/test";

test("home page renders", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: "Songs This Week" })).toBeVisible();

  const emptyState = page.getByText("No published posts yet.");
  if (await emptyState.isVisible()) {
    await expect(emptyState).toBeVisible();
    return;
  }

  await expect(page.locator(".post-card").first()).toBeVisible();
});
