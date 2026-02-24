import { prisma } from "@/lib/prisma";
import { formatDate, formatStatus, getStatusColor, formatPrice } from "@/lib/utils";
import Link from "next/link";
import { TrendingUp } from "lucide-react";

const STATUS_FILTERS = [
  { value: "all", label: "All" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "booked", label: "Booked" },
  { value: "in_progress", label: "In Progress" },
];

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: { from?: string; to?: string; status?: string; q?: string };
}) {
  const now = new Date();
  function localDateStr(d: Date) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }
  const defaultFrom = localDateStr(new Date(now.getFullYear(), now.getMonth(), 1));
  const defaultTo = localDateStr(new Date(now.getFullYear(), now.getMonth() + 1, 0));

  const from = searchParams.from || defaultFrom;
  const to = searchParams.to || defaultTo;
  const status = searchParams.status || "all";
  const q = searchParams.q || "";

  const where: any = {};

  if (from || to) {
    where.bookingDate = {};
    if (from) where.bookingDate.gte = new Date(from);
    if (to) {
      const toDate = new Date(to);
      toDate.setDate(toDate.getDate() + 1);
      where.bookingDate.lt = toDate;
    }
  }

  if (status !== "all") {
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
    orderBy: { bookingDate: "desc" },
    include: { client: true, vehicle: true, service: true },
  });

  const totalRevenue = bookings.reduce(
    (sum, b) => sum + (b.finalPrice ?? b.estimatedPrice ?? 0),
    0
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Job History</h1>
        <p className="text-gray-500 mt-1">All bookings and service records</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
        <form className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              From
            </label>
            <input
              type="date"
              name="from"
              defaultValue={from}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              To
            </label>
            <input
              type="date"
              name="to"
              defaultValue={to}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              Status
            </label>
            <select
              name="status"
              defaultValue={status}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 bg-white"
            >
              {STATUS_FILTERS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              Client
            </label>
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Search client name..."
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400"
            />
          </div>
          <div className="sm:col-span-2 lg:col-span-4 flex gap-2">
            <button
              type="submit"
              className="bg-brand-500 hover:bg-brand-600 text-white px-5 py-2 rounded-xl text-sm font-medium transition-colors"
            >
              Apply Filters
            </button>
            <a
              href="/history"
              className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-5 py-2 rounded-xl text-sm font-medium transition-colors"
            >
              Reset
            </a>
          </div>
        </form>
      </div>

      {/* Revenue Summary */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4 flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
          <TrendingUp size={18} className="text-green-600" />
        </div>
        <div>
          <div className="text-2xl font-bold text-gray-900">
            {formatPrice(totalRevenue)}
          </div>
          <div className="text-sm text-gray-500">
            {bookings.length} job{bookings.length !== 1 ? "s" : ""} in selected period
          </div>
        </div>
      </div>

      {/* List */}
      {bookings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <p className="text-gray-500">No records found for the selected filters.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="divide-y divide-gray-50">
            {bookings.map((booking) => (
              <Link
                key={booking.id}
                href={`/bookings/${booking.id}`}
                className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-gray-900">
                    {booking.client.firstName} {booking.client.lastName}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {booking.service.name} · {booking.vehicle.make}{" "}
                    {booking.vehicle.model} · {formatDate(booking.bookingDate)}
                  </div>
                </div>
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
        </div>
      )}
    </div>
  );
}
