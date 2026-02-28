import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import {
  formatVehicleType,
  formatDate,
  formatStatus,
  getStatusColor,
  getInitials,
  formatPrice,
} from "@/lib/utils";
import {
  ArrowLeft,
  Edit,
  Phone,
  Mail,
  MapPin,
  Car,
  StickyNote,
  CalendarDays,
} from "lucide-react";
import Link from "next/link";
import DeleteClientButton from "@/components/ui/DeleteClientButton";

export default async function ClientDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const client = await prisma.client.findUnique({
    where: { id: params.id },
    include: {
      vehicles: { orderBy: { createdAt: "desc" } },
      bookings: {
        take: 10,
        orderBy: { bookingDate: "desc" },
        include: { service: true, vehicle: true },
      },
    },
  });

  if (!client) notFound();

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/clients"
          className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft size={16} />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {client.firstName} {client.lastName}
          </h1>
          <p className="text-gray-500 text-sm">
            Client since {formatDate(client.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/clients/${client.id}/edit`}
            className="inline-flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-xl font-medium text-sm transition-colors"
          >
            <Edit size={15} />
            Edit
          </Link>
          <DeleteClientButton clientId={client.id} clientName={`${client.firstName} ${client.lastName}`} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Client Info */}
        <div className="space-y-6">
          {/* Contact Card */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 rounded-xl bg-navy-500 text-white flex items-center justify-center font-bold text-lg">
                {getInitials(client.firstName, client.lastName)}
              </div>
              <div>
                <div className="font-semibold text-gray-900">
                  {client.firstName} {client.lastName}
                </div>
                {client.suburb && (
                  <div className="text-sm text-gray-500">{client.suburb}</div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <a
                href={`tel:${client.phone}`}
                className="flex items-center gap-3 text-sm text-gray-700 hover:text-brand-600 transition-colors"
              >
                <Phone size={15} className="text-gray-400" />
                {client.phone}
              </a>
              {client.email && (
                <a
                  href={`mailto:${client.email}`}
                  className="flex items-center gap-3 text-sm text-gray-700 hover:text-brand-600 transition-colors"
                >
                  <Mail size={15} className="text-gray-400" />
                  {client.email}
                </a>
              )}
              {client.address && (
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <MapPin size={15} className="text-gray-400" />
                  {client.address}
                  {client.suburb ? `, ${client.suburb}` : ""}
                </div>
              )}
            </div>

            {client.notes && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 text-xs font-medium text-gray-500 mb-2">
                  <StickyNote size={13} />
                  Notes
                </div>
                <p className="text-sm text-gray-700">{client.notes}</p>
              </div>
            )}
          </div>

          {/* Vehicles */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Car size={16} />
              Vehicles ({client.vehicles.length})
            </h2>
            {client.vehicles.length === 0 ? (
              <p className="text-sm text-gray-500">No vehicles registered</p>
            ) : (
              <div className="space-y-3">
                {client.vehicles.map((v) => (
                  <div
                    key={v.id}
                    className="border border-gray-100 rounded-xl p-4"
                  >
                    <div className="font-medium text-sm text-gray-900">
                      {v.make} {v.model}
                      {v.year ? ` (${v.year})` : ""}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                        {formatVehicleType(v.vehicleType)}
                      </span>
                      {v.color && (
                        <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                          {v.color}
                        </span>
                      )}
                      {v.rego && (
                        <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full font-mono">
                          {v.rego}
                        </span>
                      )}
                    </div>
                    {v.notes && (
                      <p className="text-xs text-gray-500 mt-2">{v.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Booking History */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <CalendarDays size={16} />
                Booking History
              </h2>
              <Link
                href={`/bookings/new?clientId=${client.id}`}
                className="text-sm text-brand-600 hover:text-brand-700 font-medium"
              >
                + New Booking
              </Link>
            </div>

            {client.bookings.length === 0 ? (
              <div className="p-12 text-center">
                <CalendarDays
                  size={40}
                  className="mx-auto text-gray-300 mb-3"
                />
                <p className="text-gray-500 text-sm">
                  No bookings for this client yet
                </p>
                <Link
                  href={`/bookings/new?clientId=${client.id}`}
                  className="inline-block mt-3 text-sm text-brand-600 hover:text-brand-700 font-medium"
                >
                  Create first booking →
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {client.bookings.map((booking) => (
                  <Link
                    key={booking.id}
                    href={`/bookings/${booking.id}`}
                    className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-gray-900">
                        {booking.service.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {booking.vehicle.make} {booking.vehicle.model} •{" "}
                        {formatDate(booking.bookingDate)}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      {(booking.finalPrice || booking.estimatedPrice) && (
                        <div className="text-sm font-medium text-gray-900">
                          {formatPrice(
                            booking.finalPrice || booking.estimatedPrice || 0
                          )}
                        </div>
                      )}
                      <span
                        className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(
                          booking.status
                        )}`}
                      >
                        {formatStatus(booking.status)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
