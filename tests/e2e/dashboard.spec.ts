import { test, expect } from "@playwright/test";

test.describe("Dashboard", () => {
  test("loads the dashboard page", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL("/dashboard");
    await expect(page.getByRole("heading", { name: /dashboard/i })).toBeVisible();
  });

  test("navigates to clients from dashboard", async ({ page }) => {
    await page.goto("/dashboard");
    await page.getByRole("link", { name: /clients/i }).first().click();
    await expect(page).toHaveURL(/\/clients/);
  });

  test("navigates to bookings from dashboard", async ({ page }) => {
    await page.goto("/dashboard");
    await page.getByRole("link", { name: /bookings/i }).first().click();
    await expect(page).toHaveURL(/\/bookings/);
  });

  test("history page loads", async ({ page }) => {
    await page.goto("/history");
    await expect(page.getByRole("heading", { name: /history/i })).toBeVisible();
  });

  test("settings page loads with services", async ({ page }) => {
    await page.goto("/settings");
    await expect(page.getByRole("heading", { name: /settings/i })).toBeVisible();
  });
});
