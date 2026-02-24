import { prisma } from "@/lib/prisma";
import SettingsClient from "@/components/settings/SettingsClient";

export default async function SettingsPage() {
  const services = await prisma.service.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">
          Service prices and business configuration
        </p>
      </div>
      <SettingsClient services={services} />
    </div>
  );
}
