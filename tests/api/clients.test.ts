import { describe, it, expect, beforeEach } from "vitest";
import "../helpers/mockPrisma";
import { resetDb, seedDb, testPrisma } from "../helpers/db";
import { POST } from "@/app/api/clients/route";
import { PUT, DELETE } from "@/app/api/clients/[id]/route";
import { NextRequest } from "next/server";

function makeRequest(body: object, url = "http://localhost/api/clients") {
  return new NextRequest(url, {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

beforeEach(async () => {
  await resetDb();
});

describe("POST /api/clients", () => {
  it("creates a client with required fields", async () => {
    const req = makeRequest({ firstName: "Jane", lastName: "Smith", phone: "0400000002" });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.firstName).toBe("Jane");
    expect(data.lastName).toBe("Smith");
    expect(data.phone).toBe("0400000002");
  });

  it("creates a client with optional fields", async () => {
    const req = makeRequest({
      firstName: "Jane", lastName: "Smith", phone: "0400000002",
      email: "jane@example.com", address: "1 Main St", suburb: "Sydney", notes: "VIP",
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.email).toBe("jane@example.com");
    expect(data.suburb).toBe("Sydney");
  });

  it("creates a client with vehicles", async () => {
    const req = makeRequest({
      firstName: "Jane", lastName: "Smith", phone: "0400000002",
      vehicles: [{ make: "Honda", model: "Civic", vehicleType: "hatch_sedan" }],
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.vehicles).toHaveLength(1);
    expect(data.vehicles[0].make).toBe("Honda");
  });

  it("returns 400 when firstName is missing", async () => {
    const req = makeRequest({ lastName: "Smith", phone: "0400000002" });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/required/i);
  });

  it("returns 400 when lastName is missing", async () => {
    const req = makeRequest({ firstName: "Jane", phone: "0400000002" });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 when phone is missing", async () => {
    const req = makeRequest({ firstName: "Jane", lastName: "Smith" });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("ignores vehicles with missing make or model", async () => {
    const req = makeRequest({
      firstName: "Jane", lastName: "Smith", phone: "0400000002",
      vehicles: [{ make: "Honda" }],
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.vehicles).toHaveLength(0);
  });
});

describe("PUT /api/clients/[id]", () => {
  it("updates a client's fields", async () => {
    const { client } = await seedDb();
    const req = new NextRequest(`http://localhost/api/clients/${client.id}`, {
      method: "PUT",
      body: JSON.stringify({ firstName: "Updated", lastName: "Name", phone: "0400000099", email: "new@example.com" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await PUT(req, { params: { id: client.id } });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.firstName).toBe("Updated");
    expect(data.email).toBe("new@example.com");
  });

  it("returns 400 when required fields are missing on update", async () => {
    const { client } = await seedDb();
    const req = new NextRequest(`http://localhost/api/clients/${client.id}`, {
      method: "PUT",
      body: JSON.stringify({ firstName: "Jane" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await PUT(req, { params: { id: client.id } });
    expect(res.status).toBe(400);
  });

  it("adds a new vehicle on update", async () => {
    const { client, vehicle } = await seedDb();
    const req = new NextRequest(`http://localhost/api/clients/${client.id}`, {
      method: "PUT",
      body: JSON.stringify({
        firstName: client.firstName, lastName: client.lastName, phone: client.phone,
        vehicles: [
          { id: vehicle.id, make: vehicle.make, model: vehicle.model, vehicleType: vehicle.vehicleType },
          { make: "Mazda", model: "3", vehicleType: "hatch_sedan" },
        ],
      }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await PUT(req, { params: { id: client.id } });
    expect(res.status).toBe(200);
    const vehicles = await testPrisma.vehicle.findMany({ where: { clientId: client.id } });
    expect(vehicles).toHaveLength(2);
  });

  it("removes a vehicle when not included in update", async () => {
    const { client } = await seedDb();
    const req = new NextRequest(`http://localhost/api/clients/${client.id}`, {
      method: "PUT",
      body: JSON.stringify({
        firstName: client.firstName, lastName: client.lastName, phone: client.phone,
        vehicles: [],
      }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await PUT(req, { params: { id: client.id } });
    expect(res.status).toBe(200);
    const vehicles = await testPrisma.vehicle.findMany({ where: { clientId: client.id } });
    expect(vehicles).toHaveLength(0);
  });
});

describe("DELETE /api/clients/[id]", () => {
  it("deletes a client", async () => {
    const { client } = await seedDb();
    const req = new NextRequest(`http://localhost/api/clients/${client.id}`, { method: "DELETE" });
    const res = await DELETE(req, { params: { id: client.id } });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    const found = await testPrisma.client.findUnique({ where: { id: client.id } });
    expect(found).toBeNull();
  });

  it("cascades vehicle deletion when client is deleted", async () => {
    const { client, vehicle } = await seedDb();
    const req = new NextRequest(`http://localhost/api/clients/${client.id}`, { method: "DELETE" });
    await DELETE(req, { params: { id: client.id } });
    const found = await testPrisma.vehicle.findUnique({ where: { id: vehicle.id } });
    expect(found).toBeNull();
  });
});
