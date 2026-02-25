import { test, expect } from "@playwright/test";

test.describe("Booking Flow", () => {
  test("shows bookings list page", async ({ page }) => {
    await page.goto("/bookings");
    await expect(page.getByRole("heading", { name: /bookings/i })).toBeVisible();
  });

  test("creates a new booking via form", async ({ page }) => {
    const svcRes = await page.request.post("/api/services", {
      data: { name: "E2E Detail", priceHatchSedan: 100, priceSuv: 120, price4x4: 140 },
    });
    const service = await svcRes.json();

    const clientRes = await page.request.post("/api/clients", {
      data: {
        firstName: "Booking", lastName: "Test", phone: "0433333333",
        vehicles: [{ make: "Ford", model: "Focus", vehicleType: "hatch_sedan" }],
      },
    });
    const client = await clientRes.json();

    await page.goto("/bookings/new");
    await expect(page.getByRole("heading", { name: /new booking/i })).toBeVisible();

    // The form uses div-based labels (not real <label> elements), so use CSS selectors.
    // Client is the first <select> (required, not disabled)
    await page.locator("select").first().selectOption({ value: client.id });

    // Vehicle is the second <select> - now enabled after client selection
    await page.locator("select").nth(1).selectOption({ value: client.vehicles[0].id });

    // Select the service radio button by its value (the service ID from the API)
    await page.locator(`input[type="radio"][value="${service.id}"]`).first().click();

    // Fill in the required booking date using the date input
    await page.locator('input[type="date"]').fill("2026-04-01");

    // Submit the form
    await page.getByRole("button", { name: /save booking/i }).click();

    // After successful submission the app redirects to the booking detail page.
    // The detail page h1 shows the client's full name.
    await expect(page).toHaveURL(/\/bookings\/[^/]+$/, { timeout: 10000 });
    await expect(page.getByRole("heading", { name: /Booking Test/i })).toBeVisible();
  });

  test("views booking detail", async ({ page }) => {
    const svcRes = await page.request.post("/api/services", {
      data: { name: "View Booking Svc", priceHatchSedan: 100, priceSuv: 120, price4x4: 140 },
    });
    const service = await svcRes.json();
    const clientRes = await page.request.post("/api/clients", {
      data: { firstName: "BookView", lastName: "Client", phone: "0444444444", vehicles: [{ make: "Kia", model: "Rio", vehicleType: "hatch_sedan" }] },
    });
    const client = await clientRes.json();
    const bookingRes = await page.request.post("/api/bookings", {
      data: { clientId: client.id, vehicleId: client.vehicles[0].id, serviceId: service.id, bookingDate: "2026-03-10" },
    });
    const booking = await bookingRes.json();
    await page.goto(`/bookings/${booking.id}`);
    await expect(page.getByText("BookView").first()).toBeVisible();
  });

  test("updates booking status to completed", async ({ page }) => {
    const svcRes = await page.request.post("/api/services", {
      data: { name: "Complete Svc", priceHatchSedan: 100, priceSuv: 120, price4x4: 140 },
    });
    const service = await svcRes.json();
    const clientRes = await page.request.post("/api/clients", {
      data: { firstName: "Complete", lastName: "Me", phone: "0455555555", vehicles: [{ make: "Hyundai", model: "i30", vehicleType: "hatch_sedan" }] },
    });
    const client = await clientRes.json();
    const bookingRes = await page.request.post("/api/bookings", {
      data: { clientId: client.id, vehicleId: client.vehicles[0].id, serviceId: service.id, bookingDate: "2026-03-10" },
    });
    const booking = await bookingRes.json();
    await page.goto(`/bookings/${booking.id}`);
    // Booking starts as "booked" - click Start Job to move to in_progress
    const startBtn = page.getByRole("button", { name: /start job/i });
    await expect(startBtn).toBeVisible();
    await startBtn.click();
    // Now status is in_progress - click Complete
    const completeBtn = page.getByRole("button", { name: /^complete$/i });
    await expect(completeBtn).toBeVisible({ timeout: 5000 });
    await completeBtn.click();
    // Confirm completion dialog appears
    const confirmBtn = page.getByRole("button", { name: /confirm$/i });
    await expect(confirmBtn).toBeVisible({ timeout: 5000 });
    await confirmBtn.click();
    await expect(page.getByText(/completed/i).first()).toBeVisible({ timeout: 5000 });
  });
});
