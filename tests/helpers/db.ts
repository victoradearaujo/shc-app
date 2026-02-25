import { PrismaClient } from "@prisma/client";
import path from "path";

const TEST_DB_PATH = path.resolve(__dirname, "../../prisma/test.db");
const TEST_DB_URL = `file:${TEST_DB_PATH}`;

export const testPrisma = new PrismaClient({
  datasources: { db: { url: TEST_DB_URL } },
});

export async function resetDb() {
  await testPrisma.bookingExtra.deleteMany();
  await testPrisma.booking.deleteMany();
  await testPrisma.vehicle.deleteMany();
  await testPrisma.client.deleteMany();
  await testPrisma.service.deleteMany();
}

export async function seedDb() {
  const service = await testPrisma.service.create({
    data: {
      name: "Full Detail",
      priceHatchSedan: 150,
      priceSuv: 180,
      price4x4: 200,
      isActive: true,
      sortOrder: 1,
    },
  });

  const client = await testPrisma.client.create({
    data: {
      firstName: "John",
      lastName: "Doe",
      phone: "0400000001",
      email: "john@example.com",
      vehicles: {
        create: {
          make: "Toyota",
          model: "Corolla",
          vehicleType: "hatch_sedan",
        },
      },
    },
    include: { vehicles: true },
  });

  return { service, client, vehicle: client.vehicles[0] };
}
