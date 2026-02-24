import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const services = await prisma.service.findMany({
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json(services);
}

export async function POST(req: NextRequest) {
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

    const service = await prisma.service.create({
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

    return NextResponse.json(service, { status: 201 });
  } catch (error) {
    console.error("Error creating service:", error);
    return NextResponse.json({ error: "Failed to create service" }, { status: 500 });
  }
}
