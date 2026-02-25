import { test, expect } from "@playwright/test";

test.describe("Client Management", () => {
  test("shows clients list page", async ({ page }) => {
    await page.goto("/clients");
    await expect(page.getByRole("heading", { name: "Clients", exact: true }).first()).toBeVisible();
  });

  test("creates a new client", async ({ page }) => {
    await page.goto("/clients/new");
    await page.getByPlaceholder("John").first().fill("E2E");
    await page.getByPlaceholder("Smith").fill("TestClient");
    await page.getByPlaceholder("0412 345 678").fill("0499999999");
    await page.getByRole("button", { name: /save client/i }).click();
    await expect(page).toHaveURL(/\/clients/);
    await expect(page.getByText("E2E TestClient").first()).toBeVisible();
  });

  test("shows validation error when required fields missing", async ({ page }) => {
    await page.goto("/clients/new");
    await page.getByRole("button", { name: /save client/i }).click();
    await expect(page).toHaveURL(/\/clients\/new/);
  });

  test("views client detail page", async ({ page }) => {
    const res = await page.request.post("/api/clients", {
      data: { firstName: "View", lastName: "Me", phone: "0411111111" },
    });
    const client = await res.json();
    await page.goto(`/clients/${client.id}`);
    await expect(page.getByText("View Me").first()).toBeVisible();
  });

  test("edits a client", async ({ page }) => {
    const res = await page.request.post("/api/clients", {
      data: { firstName: "Edit", lastName: "Me", phone: "0422222222" },
    });
    const client = await res.json();
    await page.goto(`/clients/${client.id}/edit`);
    await page.getByPlaceholder("John").first().fill("Edited");
    await page.getByRole("button", { name: /save client/i }).click();
    await expect(page.getByText("Edited Me").first()).toBeVisible();
  });
});
