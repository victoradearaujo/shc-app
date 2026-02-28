import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// PUT /api/clients/[id] - Update client
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { firstName, lastName, email, phone, address, suburb, notes, vehicles } = body;

    if (!firstName || !lastName || !phone) {
      return NextResponse.json(
        { error: "First name, last name, and phone are required" },
        { status: 400 }
      );
    }

    // Update client info
    const client = await prisma.client.update({
      where: { id: params.id },
      data: {
        firstName,
        lastName,
        email: email || null,
        phone,
        address: address || null,
        suburb: suburb || null,
        notes: notes || null,
      },
    });

    // Handle vehicles: delete removed ones, update existing, create new
    const existingVehicles = await prisma.vehicle.findMany({
      where: { clientId: params.id },
    });

    const incomingIds = (vehicles || [])
      .filter((v: any) => v.id)
      .map((v: any) => v.id);

    // Delete vehicles not in the incoming list
    const toDelete = existingVehicles.filter((v) => !incomingIds.includes(v.id));
    for (const v of toDelete) {
      await prisma.vehicle.delete({ where: { id: v.id } });
    }

    // Update or create vehicles
    for (const v of vehicles || []) {
      if (!v.make || !v.model) continue;

      if (v.id) {
        await prisma.vehicle.update({
          where: { id: v.id },
          data: {
            make: v.make,
            model: v.model,
            year: v.year || null,
            color: v.color || null,
            rego: v.rego || null,
            vehicleType: v.vehicleType || "hatch_sedan",
            notes: v.notes || null,
          },
        });
      } else {
        await prisma.vehicle.create({
          data: {
            clientId: params.id,
            make: v.make,
            model: v.model,
            year: v.year || null,
            color: v.color || null,
            rego: v.rego || null,
            vehicleType: v.vehicleType || "hatch_sedan",
            notes: v.notes || null,
          },
        });
      }
    }

    return NextResponse.json(client);
  } catch (error) {
    console.error("Error updating client:", error);
    return NextResponse.json(
      { error: "Failed to update client" },
      { status: 500 }
    );
  }
}

// DELETE /api/clients/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.client.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting client:", error);
    return NextResponse.json(
      { error: "Failed to delete client" },
      { status: 500 }
    );
  }
}
