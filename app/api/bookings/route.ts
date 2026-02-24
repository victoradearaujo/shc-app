import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const status = searchParams.get("status");
    const q = searchParams.get("q");

    const where: any = {};

    if (date) {
      const d = new Date(date);
      const start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      where.bookingDate = { gte: start, lt: end };
    } else if (from || to) {
      where.bookingDate = {};
      if (from) where.bookingDate.gte = new Date(from);
      if (to) {
        const toDate = new Date(to);
        toDate.setDate(toDate.getDate() + 1);
        where.bookingDate.lt = toDate;
      }
    }

    if (status && status !== "all") {
      where.status = status;
    }

    if (q) {
      where.client = {
        OR: [
          { firstName: { contains: q } },
          { lastName: { contains: q } },
        ],
      };
    }

    const bookings = await prisma.booking.findMany({
      where,
      orderBy: [{ bookingDate: "asc" }, { bookingTime: "asc" }],
      include: { client: true, vehicle: true, service: true },
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      clientId, vehicleId, serviceId, bookingDate,
      bookingTime, estimatedPrice, travelSurcharge, notes,
    } = body;

    if (!clientId || !vehicleId || !serviceId || !bookingDate) {
      return NextResponse.json(
        { error: "Client, vehicle, service, and date are required" },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.create({
      data: {
        clientId,
        vehicleId,
        serviceId,
        bookingDate: new Date(bookingDate),
        bookingTime: bookingTime || null,
        estimatedPrice: estimatedPrice || 0,
        travelSurcharge: travelSurcharge || 0,
        notes: notes || null,
        status: "booked",
      },
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
  }
}
