import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// POST /api/clients - Create a new client
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { firstName, lastName, email, phone, address, suburb, notes, vehicles } = body;

    if (!firstName || !lastName || !phone) {
      return NextResponse.json(
        { error: "First name, last name, and phone are required" },
        { status: 400 }
      );
    }

    const client = await prisma.client.create({
      data: {
        firstName,
        lastName,
        email: email || null,
        phone,
        address: address || null,
        suburb: suburb || null,
        notes: notes || null,
        vehicles: {
          create: (vehicles || [])
            .filter((v: any) => v.make && v.model)
            .map((v: any) => ({
              make: v.make,
              model: v.model,
              year: v.year || null,
              color: v.color || null,
              rego: v.rego || null,
              vehicleType: v.vehicleType || "hatch_sedan",
              notes: v.notes || null,
            })),
        },
      },
      include: { vehicles: true },
    });

    return NextResponse.json(client, { status: 201 });
  } catch (error) {
    console.error("Error creating client:", error);
    return NextResponse.json(
      { error: "Failed to create client" },
      { status: 500 }
    );
  }
}
