import { describe, it, expect, beforeEach } from "vitest";
import "../helpers/mockPrisma";
import { resetDb, seedDb, testPrisma } from "../helpers/db";
import { GET, POST } from "@/app/api/services/route";
import { PUT, DELETE } from "@/app/api/services/[id]/route";
import { NextRequest } from "next/server";

function makeRequest(body: object, url = "http://localhost/api/services") {
  return new NextRequest(url, {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

beforeEach(async () => {
  await resetDb();
});

describe("GET /api/services", () => {
  it("returns empty array when no services exist", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual([]);
  });

  it("returns all services ordered by sortOrder", async () => {
    await seedDb();
    const res = await GET();
    const data = await res.json();
    expect(data).toHaveLength(1);
    expect(data[0].name).toBe("Full Detail");
  });
});

describe("POST /api/services", () => {
  it("creates a service with all fields", async () => {
    const req = makeRequest({
      name: "Mini Detail", priceHatchSedan: 80, priceSuv: 100, price4x4: 120,
      isExtra: false, isActive: true, sortOrder: 1,
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.name).toBe("Mini Detail");
    expect(data.priceHatchSedan).toBe(80);
  });

  it("creates a service with only required name field", async () => {
    const req = makeRequest({ name: "Wax" });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.name).toBe("Wax");
    expect(data.priceHatchSedan).toBe(0);
    expect(data.isActive).toBe(true);
  });

  it("returns 400 when name is missing", async () => {
    const req = makeRequest({ priceHatchSedan: 80 });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/required/i);
  });

  it("creates an extra service", async () => {
    const req = makeRequest({ name: "Odour Remove", priceHatchSedan: 30, priceSuv: 30, price4x4: 30, isExtra: true });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.isExtra).toBe(true);
  });
});

describe("PUT /api/services/[id]", () => {
  it("updates a service", async () => {
    const { service } = await seedDb();
    const req = new NextRequest(`http://localhost/api/services/${service.id}`, {
      method: "PUT",
      body: JSON.stringify({ name: "Premium Detail", priceHatchSedan: 200, priceSuv: 230, price4x4: 260, isActive: true }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await PUT(req, { params: { id: service.id } });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.name).toBe("Premium Detail");
    expect(data.priceHatchSedan).toBe(200);
  });

  it("returns 400 when name is missing on update", async () => {
    const { service } = await seedDb();
    const req = new NextRequest(`http://localhost/api/services/${service.id}`, {
      method: "PUT",
      body: JSON.stringify({ priceHatchSedan: 200 }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await PUT(req, { params: { id: service.id } });
    expect(res.status).toBe(400);
  });

  it("can deactivate a service", async () => {
    const { service } = await seedDb();
    const req = new NextRequest(`http://localhost/api/services/${service.id}`, {
      method: "PUT",
      body: JSON.stringify({ name: service.name, priceHatchSedan: service.priceHatchSedan, priceSuv: service.priceSuv, price4x4: service.price4x4, isActive: false }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await PUT(req, { params: { id: service.id } });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.isActive).toBe(false);
  });
});

describe("DELETE /api/services/[id]", () => {
  it("deletes a service with no bookings", async () => {
    const { service } = await seedDb();
    const req = new NextRequest(`http://localhost/api/services/${service.id}`, { method: "DELETE" });
    const res = await DELETE(req, { params: { id: service.id } });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    const found = await testPrisma.service.findUnique({ where: { id: service.id } });
    expect(found).toBeNull();
  });

  it("returns 409 when service has linked bookings", async () => {
    const { service, client, vehicle } = await seedDb();
    await testPrisma.booking.create({
      data: {
        clientId: client.id,
        vehicleId: vehicle.id,
        serviceId: service.id,
        bookingDate: new Date(),
        status: "booked",
      },
    });
    const req = new NextRequest(`http://localhost/api/services/${service.id}`, { method: "DELETE" });
    const res = await DELETE(req, { params: { id: service.id } });
    expect(res.status).toBe(409);
    const data = await res.json();
    expect(data.error).toMatch(/cannot delete/i);
  });
});
