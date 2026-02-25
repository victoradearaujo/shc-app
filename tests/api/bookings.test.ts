import { describe, it, expect, beforeEach } from "vitest";
import "../helpers/mockPrisma";
import { resetDb, seedDb, testPrisma } from "../helpers/db";
import { GET, POST } from "@/app/api/bookings/route";
import { GET as GETById, PUT, DELETE } from "@/app/api/bookings/[id]/route";
import { NextRequest } from "next/server";

beforeEach(async () => {
  await resetDb();
});

async function createBooking(clientId: string, vehicleId: string, serviceId: string, overrides: object = {}) {
  return testPrisma.booking.create({
    data: {
      clientId, vehicleId, serviceId,
      bookingDate: new Date("2026-03-01"),
      status: "booked",
      ...overrides,
    },
  });
}

describe("GET /api/bookings", () => {
  it("returns empty array when no bookings", async () => {
    const req = new NextRequest("http://localhost/api/bookings");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual([]);
  });

  it("returns bookings with client, vehicle, service relations", async () => {
    const { client, vehicle, service } = await seedDb();
    await createBooking(client.id, vehicle.id, service.id);
    const req = new NextRequest("http://localhost/api/bookings");
    const res = await GET(req);
    const data = await res.json();
    expect(data).toHaveLength(1);
    expect(data[0].client.firstName).toBe("John");
    expect(data[0].vehicle.make).toBe("Toyota");
    expect(data[0].service.name).toBe("Full Detail");
  });

  it("filters bookings by date", async () => {
    const { client, vehicle, service } = await seedDb();
    await createBooking(client.id, vehicle.id, service.id, { bookingDate: new Date("2026-03-01") });
    await createBooking(client.id, vehicle.id, service.id, { bookingDate: new Date("2026-04-01") });
    const req = new NextRequest("http://localhost/api/bookings?date=2026-03-01");
    const res = await GET(req);
    const data = await res.json();
    expect(data).toHaveLength(1);
  });

  it("filters bookings by status", async () => {
    const { client, vehicle, service } = await seedDb();
    await createBooking(client.id, vehicle.id, service.id, { status: "booked" });
    await createBooking(client.id, vehicle.id, service.id, { status: "completed" });
    const req = new NextRequest("http://localhost/api/bookings?status=completed");
    const res = await GET(req);
    const data = await res.json();
    expect(data).toHaveLength(1);
    expect(data[0].status).toBe("completed");
  });

  it("filters bookings by client name search", async () => {
    const { client, vehicle, service } = await seedDb();
    await createBooking(client.id, vehicle.id, service.id);
    const req = new NextRequest("http://localhost/api/bookings?q=John");
    const res = await GET(req);
    const data = await res.json();
    expect(data).toHaveLength(1);
    const noMatch = new NextRequest("http://localhost/api/bookings?q=Nobody");
    const res2 = await GET(noMatch);
    const data2 = await res2.json();
    expect(data2).toHaveLength(0);
  });

  it("filters bookings by date range (from/to)", async () => {
    const { client, vehicle, service } = await seedDb();
    await createBooking(client.id, vehicle.id, service.id, { bookingDate: new Date("2026-03-15") });
    await createBooking(client.id, vehicle.id, service.id, { bookingDate: new Date("2026-05-01") });
    const req = new NextRequest("http://localhost/api/bookings?from=2026-03-01&to=2026-03-31");
    const res = await GET(req);
    const data = await res.json();
    expect(data).toHaveLength(1);
  });
});

describe("POST /api/bookings", () => {
  it("creates a booking with required fields", async () => {
    const { client, vehicle, service } = await seedDb();
    const req = new NextRequest("http://localhost/api/bookings", {
      method: "POST",
      body: JSON.stringify({ clientId: client.id, vehicleId: vehicle.id, serviceId: service.id, bookingDate: "2026-03-01" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.status).toBe("booked");
    expect(data.clientId).toBe(client.id);
  });

  it("creates a booking with optional fields", async () => {
    const { client, vehicle, service } = await seedDb();
    const req = new NextRequest("http://localhost/api/bookings", {
      method: "POST",
      body: JSON.stringify({
        clientId: client.id, vehicleId: vehicle.id, serviceId: service.id,
        bookingDate: "2026-03-01", bookingTime: "09:00",
        estimatedPrice: 150, travelSurcharge: 20, notes: "Test note",
      }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.bookingTime).toBe("09:00");
    expect(data.estimatedPrice).toBe(150);
    expect(data.travelSurcharge).toBe(20);
    expect(data.notes).toBe("Test note");
  });

  it("returns 400 when clientId is missing", async () => {
    const { vehicle, service } = await seedDb();
    const req = new NextRequest("http://localhost/api/bookings", {
      method: "POST",
      body: JSON.stringify({ vehicleId: vehicle.id, serviceId: service.id, bookingDate: "2026-03-01" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 when vehicleId is missing", async () => {
    const { client, service } = await seedDb();
    const req = new NextRequest("http://localhost/api/bookings", {
      method: "POST",
      body: JSON.stringify({ clientId: client.id, serviceId: service.id, bookingDate: "2026-03-01" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 when serviceId is missing", async () => {
    const { client, vehicle } = await seedDb();
    const req = new NextRequest("http://localhost/api/bookings", {
      method: "POST",
      body: JSON.stringify({ clientId: client.id, vehicleId: vehicle.id, bookingDate: "2026-03-01" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 when bookingDate is missing", async () => {
    const { client, vehicle, service } = await seedDb();
    const req = new NextRequest("http://localhost/api/bookings", {
      method: "POST",
      body: JSON.stringify({ clientId: client.id, vehicleId: vehicle.id, serviceId: service.id }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});

describe("GET /api/bookings/[id]", () => {
  it("returns a booking by ID with relations", async () => {
    const { client, vehicle, service } = await seedDb();
    const booking = await createBooking(client.id, vehicle.id, service.id);
    const req = new NextRequest(`http://localhost/api/bookings/${booking.id}`);
    const res = await GETById(req, { params: { id: booking.id } });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.id).toBe(booking.id);
    expect(data.client).toBeDefined();
    expect(data.service).toBeDefined();
  });

  it("returns 404 for non-existent booking", async () => {
    const req = new NextRequest("http://localhost/api/bookings/nonexistent-id");
    const res = await GETById(req, { params: { id: "nonexistent-id" } });
    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data.error).toMatch(/not found/i);
  });
});

describe("PUT /api/bookings/[id]", () => {
  it("updates booking status to in_progress", async () => {
    const { client, vehicle, service } = await seedDb();
    const booking = await createBooking(client.id, vehicle.id, service.id);
    const req = new NextRequest(`http://localhost/api/bookings/${booking.id}`, {
      method: "PUT",
      body: JSON.stringify({ status: "in_progress" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await PUT(req, { params: { id: booking.id } });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.status).toBe("in_progress");
  });

  it("updates booking status to completed with finalPrice", async () => {
    const { client, vehicle, service } = await seedDb();
    const booking = await createBooking(client.id, vehicle.id, service.id);
    const req = new NextRequest(`http://localhost/api/bookings/${booking.id}`, {
      method: "PUT",
      body: JSON.stringify({ status: "completed", finalPrice: 175 }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await PUT(req, { params: { id: booking.id } });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.status).toBe("completed");
    expect(data.finalPrice).toBe(175);
  });

  it("updates booking status to cancelled with reason", async () => {
    const { client, vehicle, service } = await seedDb();
    const booking = await createBooking(client.id, vehicle.id, service.id);
    const req = new NextRequest(`http://localhost/api/bookings/${booking.id}`, {
      method: "PUT",
      body: JSON.stringify({ status: "cancelled", cancellationReason: "Customer no-show" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await PUT(req, { params: { id: booking.id } });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.status).toBe("cancelled");
    expect(data.cancellationReason).toBe("Customer no-show");
  });

  it("updates booking date and time", async () => {
    const { client, vehicle, service } = await seedDb();
    const booking = await createBooking(client.id, vehicle.id, service.id);
    const req = new NextRequest(`http://localhost/api/bookings/${booking.id}`, {
      method: "PUT",
      body: JSON.stringify({ bookingDate: "2026-04-15", bookingTime: "14:00" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await PUT(req, { params: { id: booking.id } });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.bookingTime).toBe("14:00");
  });

  it("updates notes and travel surcharge", async () => {
    const { client, vehicle, service } = await seedDb();
    const booking = await createBooking(client.id, vehicle.id, service.id);
    const req = new NextRequest(`http://localhost/api/bookings/${booking.id}`, {
      method: "PUT",
      body: JSON.stringify({ notes: "Park in driveway", travelSurcharge: 25 }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await PUT(req, { params: { id: booking.id } });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.notes).toBe("Park in driveway");
    expect(data.travelSurcharge).toBe(25);
  });
});

describe("DELETE /api/bookings/[id]", () => {
  it("deletes a booking", async () => {
    const { client, vehicle, service } = await seedDb();
    const booking = await createBooking(client.id, vehicle.id, service.id);
    const req = new NextRequest(`http://localhost/api/bookings/${booking.id}`, { method: "DELETE" });
    const res = await DELETE(req, { params: { id: booking.id } });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    const found = await testPrisma.booking.findUnique({ where: { id: booking.id } });
    expect(found).toBeNull();
  });
});
