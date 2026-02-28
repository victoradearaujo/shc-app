import { prisma } from "@/lib/prisma";
import { getInitials } from "@/lib/utils";
import { Plus, Search, Phone, MapPin } from "lucide-react";
import Link from "next/link";

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const query = searchParams.q || "";

  const clients = await prisma.client.findMany({
    where: query
      ? {
          OR: [
            { firstName: { contains: query } },
            { lastName: { contains: query } },
            { phone: { contains: query } },
            { suburb: { contains: query } },
          ],
        }
      : undefined,
    include: {
      vehicles: true,
      _count: { select: { bookings: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-500 mt-1">
            {clients.length} client{clients.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <Link
          href="/clients/new"
          className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-colors shadow-sm"
        >
          <Plus size={16} />
          Add Client
        </Link>
      </div>

      {/* Search */}
      <form className="mb-6">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search by name, phone or suburb..."
            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition-all"
          />
        </div>
      </form>

      {/* Client List */}
      {clients.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <Search size={24} className="text-gray-400" />
          </div>
          <h3 className="font-medium text-gray-900 mb-1">
            {query ? "No clients found" : "No clients yet"}
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            {query
              ? "Try a different search term"
              : "Add your first client to get started"}
          </p>
          {!query && (
            <Link
              href="/clients/new"
              className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-colors"
            >
              <Plus size={16} />
              Add Client
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-3">
          {clients.map((client) => (
            <Link
              key={client.id}
              href={`/clients/${client.id}`}
              className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-brand-300 hover:shadow-md transition-all duration-200 group"
            >
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="w-12 h-12 rounded-xl bg-navy-500 text-white flex items-center justify-center font-bold text-sm shrink-0">
                  {getInitials(client.firstName, client.lastName)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 group-hover:text-brand-600 transition-colors">
                    {client.firstName} {client.lastName}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                    <span className="inline-flex items-center gap-1.5 text-sm text-gray-500">
                      <Phone size={13} />
                      {client.phone}
                    </span>
                    {client.suburb && (
                      <span className="inline-flex items-center gap-1.5 text-sm text-gray-500">
                        <MapPin size={13} />
                        {client.suburb}
                      </span>
                    )}
                  </div>
                </div>

                {/* Meta */}
                <div className="hidden sm:block text-right shrink-0">
                  <div className="text-sm font-medium text-gray-900">
                    {client.vehicles.length} vehicle
                    {client.vehicles.length !== 1 ? "s" : ""}
                  </div>
                  <div className="text-xs text-gray-500">
                    {client._count.bookings} booking
                    {client._count.bookings !== 1 ? "s" : ""}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
