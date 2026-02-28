import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ClientForm from "@/components/forms/ClientForm";

export default async function EditClientPage({
  params,
}: {
  params: { id: string };
}) {
  const client = await prisma.client.findUnique({
    where: { id: params.id },
    include: { vehicles: true },
  });

  if (!client) notFound();

  return (
    <ClientForm
      initialData={{
        id: client.id,
        firstName: client.firstName,
        lastName: client.lastName,
        email: client.email || "",
        phone: client.phone,
        address: client.address || "",
        suburb: client.suburb || "",
        notes: client.notes || "",
        vehicles: client.vehicles.map((v) => ({
          id: v.id,
          make: v.make,
          model: v.model,
          year: v.year,
          color: v.color || "",
          rego: v.rego || "",
          vehicleType: v.vehicleType,
          notes: v.notes || "",
        })),
      }}
    />
  );
}
