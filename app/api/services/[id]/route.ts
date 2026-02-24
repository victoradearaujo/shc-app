import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const {
      name, description, priceHatchSedan, priceSuv,
      price4x4, isExtra, isActive, sortOrder,
    } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Service name is required" },
        { status: 400 }
      );
    }

    const service = await prisma.service.update({
      where: { id: params.id },
      data: {
        name,
        description: description || null,
        priceHatchSedan: priceHatchSedan || 0,
        priceSuv: priceSuv || 0,
        price4x4: price4x4 || 0,
        isExtra: isExtra ?? false,
        isActive: isActive ?? true,
        sortOrder: sortOrder || 0,
      },
    });

    return NextResponse.json(service);
  } catch (error) {
    console.error("Error updating service:", error);
    return NextResponse.json({ error: "Failed to update service" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const bookingCount = await prisma.booking.count({
      where: { serviceId: params.id },
    });

    if (bookingCount > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete: this service has ${bookingCount} booking(s) linked to it.`,
        },
        { status: 409 }
      );
    }

    await prisma.service.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting service:", error);
    return NextResponse.json({ error: "Failed to delete service" }, { status: 500 });
  }
}
