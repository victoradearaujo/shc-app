import { prisma } from "@/lib/prisma";
import BookingForm from "@/components/forms/BookingForm";

export default async function NewBookingPage({
  searchParams,
}: {
  searchParams: { clientId?: string };
}) {
  const [clients, services] = await Promise.all([
    prisma.client.findMany({
      include: { vehicles: { orderBy: { createdAt: "asc" } } },
      orderBy: { firstName: "asc" },
    }),
    prisma.service.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  return (
    <BookingForm
      clients={clients}
      services={services}
      initialClientId={searchParams.clientId}
    />
  );
}
