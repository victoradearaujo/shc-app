import { vi } from "vitest";
import { testPrisma } from "./db";

vi.mock("@/lib/prisma", () => ({
  prisma: testPrisma,
}));

export { testPrisma as prisma };
