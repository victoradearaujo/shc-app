import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import {
  formatDate,
  formatStatus,
  getStatusColor,
  formatPrice,
  formatVehicleType,
} from "@/lib/utils";
import {
  ArrowLeft,
  Phone,
  Car,
  CalendarDays,
  Clock,
  DollarSign,
  StickyNote,
} from "lucide-react";
import Link from "next/link";
import BookingStatusButton from "@/components/ui/BookingStatusButton";

export default async function BookingDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const booking = await prisma.booking.findUnique({
    where: { id: params.id },
    include: { client: true, vehicle: true, service: true },
  });

  if (!booking) notFound();

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/bookings"
          className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft size={16} />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {booking.client.firstName} {booking.client.lastName}
          </h1>
          <p className="text-gray-500 text-sm">
            {booking.service.name} · {formatDate(booking.bookingDate)}
          </p>
        </div>
        <span
          className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusColor(
            booking.status
          )}`}
        >
          {formatStatus(booking.status)}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {booking.status !== "completed" && booking.status !== "cancelled" && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Job Status</h2>
              <BookingStatusButton
                bookingId={booking.id}
                currentStatus={booking.status}
                estimatedPrice={booking.estimatedPrice}
              />
            </div>
          )}

          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Booking Details</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <CalendarDays size={16} className="text-gray-400 shrink-0" />
                <span>{formatDate(booking.bookingDate)}</span>
              </div>
              {booking.bookingTime && (
                <div className="flex items-center gap-3 text-sm">
                  <Clock size={16} className="text-gray-400 shrink-0" />
                  <span>{booking.bookingTime}</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-sm">
                <Car size={16} className="text-gray-400 shrink-0" />
                <span>
                  {booking.vehicle.make} {booking.vehicle.model}
                  {booking.vehicle.year ? ` (${booking.vehicle.year})` : ""} ·{" "}
                  {formatVehicleType(booking.vehicle.vehicleType)}
                  {booking.vehicle.rego ? ` · ${booking.vehicle.rego}` : ""}
                </span>
              </div>
              {booking.notes && (
                <div className="flex items-start gap-3 text-sm">
                  <StickyNote size={16} className="text-gray-400 shrink-0 mt-0.5" />
                  <span>{booking.notes}</span>
                </div>
              )}
              {booking.cancellationReason && (
                <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-sm text-red-700">
                  <strong>Cancellation reason:</strong> {booking.cancellationReason}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-3">Client</h2>
            <Link
              href={`/clients/${booking.client.id}`}
              className="block text-sm text-brand-600 hover:text-brand-700 font-medium mb-2"
            >
              {booking.client.firstName} {booking.client.lastName}
            </Link>
            <a
              href={`tel:${booking.client.phone}`}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-brand-600"
            >
              <Phone size={13} className="text-gray-400" />
              {booking.client.phone}
            </a>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <DollarSign size={16} />
              Pricing
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Service</span>
                <span>{booking.service.name}</span>
              </div>
              {booking.travelSurcharge !== null && booking.travelSurcharge > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Travel surcharge</span>
                  <span>{formatPrice(booking.travelSurcharge)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-gray-100 pt-2">
                <span className="text-gray-500">
                  {booking.finalPrice ? "Final price" : "Estimated"}
                </span>
                <span className="font-bold text-gray-900">
                  {formatPrice(booking.finalPrice ?? booking.estimatedPrice ?? 0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
