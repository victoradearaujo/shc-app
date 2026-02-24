import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: { client: true, vehicle: true, service: true },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    return NextResponse.json(booking);
  } catch (error) {
    console.error("Error fetching booking:", error);
    return NextResponse.json({ error: "Failed to fetch booking" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const {
      status, finalPrice, cancellationReason,
      bookingDate, bookingTime, notes,
      travelSurcharge, serviceId, vehicleId, clientId, estimatedPrice,
    } = body;

    const booking = await prisma.booking.update({
      where: { id: params.id },
      data: {
        ...(status !== undefined && { status }),
        ...(finalPrice !== undefined && { finalPrice }),
        ...(cancellationReason !== undefined && { cancellationReason }),
        ...(bookingDate !== undefined && { bookingDate: new Date(bookingDate) }),
        ...(bookingTime !== undefined && { bookingTime }),
        ...(notes !== undefined && { notes }),
        ...(travelSurcharge !== undefined && { travelSurcharge }),
        ...(serviceId !== undefined && { serviceId }),
        ...(vehicleId !== undefined && { vehicleId }),
        ...(clientId !== undefined && { clientId }),
        ...(estimatedPrice !== undefined && { estimatedPrice }),
      },
      include: { client: true, vehicle: true, service: true },
    });

    return NextResponse.json(booking);
  } catch (error) {
    console.error("Error updating booking:", error);
    return NextResponse.json({ error: "Failed to update booking" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.booking.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting booking:", error);
    return NextResponse.json({ error: "Failed to delete booking" }, { status: 500 });
  }
}
