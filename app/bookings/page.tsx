import { prisma } from "@/lib/prisma";
import { formatStatus, getStatusColor, formatPrice } from "@/lib/utils";
import { CalendarDays, Plus } from "lucide-react";
import Link from "next/link";

function getWeekDays(date: Date): Date[] {
  const day = date.getDay();
  const monday = new Date(date);
  monday.setDate(date.getDate() - (day === 0 ? 6 : day - 1));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function toDateString(date: Date): string {
  return date.toISOString().split("T")[0];
}

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const STATUS_FILTERS = [
  { value: "all", label: "All" },
  { value: "booked", label: "Booked" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: { date?: string; status?: string };
}) {
  const selectedDate = searchParams.date || "";
  const selectedStatus = searchParams.status || "all";

  const today = new Date();
  const weekDays = getWeekDays(today);
  const todayStr = toDateString(today);

  const where: any = {};

  if (selectedDate) {
    const d = new Date(selectedDate);
    const start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    where.bookingDate = { gte: start, lt: end };
  }

  if (selectedStatus !== "all") {
    where.status = selectedStatus;
  }

  const bookings = await prisma.booking.findMany({
    where,
    orderBy: [{ bookingDate: "asc" }, { bookingTime: "asc" }],
    include: { client: true, vehicle: true, service: true },
  });

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
          <p className="text-gray-500 mt-1">
            {bookings.length} booking{bookings.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/bookings/new"
          className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-colors shadow-sm"
        >
          <Plus size={16} />
          New Booking
        </Link>
      </div>

      {/* Day Strip */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4">
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map((day, i) => {
            const dateStr = toDateString(day);
            const isSelected = selectedDate === dateStr;
            const isToday = dateStr === todayStr;
            const statusParam =
              selectedStatus !== "all" ? `&status=${selectedStatus}` : "";
            const href = isSelected
              ? `/bookings${selectedStatus !== "all" ? `?status=${selectedStatus}` : ""}`
              : `/bookings?date=${dateStr}${statusParam}`;

            return (
              <Link
                key={dateStr}
                href={href}
                className={`flex flex-col items-center py-2 px-1 rounded-xl text-center transition-colors ${
                  isSelected
                    ? "bg-brand-500 text-white"
                    : isToday
                    ? "bg-brand-50 text-brand-700"
                    : "hover:bg-gray-50 text-gray-600"
                }`}
              >
                <span className="text-xs font-medium">{DAY_LABELS[i]}</span>
                <span
                  className={`text-lg font-bold mt-0.5 ${
                    isSelected
                      ? "text-white"
                      : isToday
                      ? "text-brand-600"
                      : "text-gray-900"
                  }`}
                >
                  {day.getDate()}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Status Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {STATUS_FILTERS.map((f) => {
          const dateParam = selectedDate ? `date=${selectedDate}&` : "";
          return (
            <Link
              key={f.value}
              href={`/bookings?${dateParam}status=${f.value}`}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedStatus === f.value
                  ? "bg-navy-500 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      {/* Booking List */}
      {bookings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <CalendarDays size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">No bookings found</p>
          <Link
            href="/bookings/new"
            className="inline-block mt-3 text-sm text-brand-600 hover:text-brand-700 font-medium"
          >
            Create a booking →
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {bookings.map((booking) => (
            <Link
              key={booking.id}
              href={`/bookings/${booking.id}`}
              className="bg-white rounded-2xl border border-gray-100 p-4 hover:border-brand-300 hover:shadow-sm transition-all flex items-center gap-4"
            >
              {/* Date block */}
              <div className="text-center shrink-0 w-12">
                <div className="text-xs text-gray-500">
                  {new Date(booking.bookingDate).toLocaleDateString("en-AU", {
                    month: "short",
                  })}
                </div>
                <div className="text-xl font-bold text-gray-900">
                  {new Date(booking.bookingDate).getDate()}
                </div>
              </div>

              <div className="w-px h-10 bg-gray-100 shrink-0" />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-gray-900">
                  {booking.client.firstName} {booking.client.lastName}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {booking.service.name} · {booking.vehicle.make}{" "}
                  {booking.vehicle.model}
                  {booking.bookingTime ? ` · ${booking.bookingTime}` : ""}
                </div>
              </div>

              {/* Price + Status */}
              <div className="text-right shrink-0">
                <div className="text-sm font-medium text-gray-900">
                  {formatPrice(booking.finalPrice ?? booking.estimatedPrice ?? 0)}
                </div>
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
  );
}
