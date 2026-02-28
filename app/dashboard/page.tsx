import { prisma } from "@/lib/prisma";
import { formatPrice, formatDate, formatStatus, getStatusColor } from "@/lib/utils";
import {
  Users,
  Car,
  CalendarDays,
  DollarSign,
} from "lucide-react";
import Link from "next/link";

async function getDashboardData() {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const [
    totalClients,
    totalVehicles,
    todayBookings,
    monthBookings,
    recentBookings,
    monthRevenue,
  ] = await Promise.all([
    prisma.client.count(),
    prisma.vehicle.count(),
    prisma.booking.count({
      where: {
        bookingDate: { gte: startOfDay, lt: endOfDay },
        status: { not: "cancelled" },
      },
    }),
    prisma.booking.count({
      where: {
        bookingDate: { gte: startOfMonth, lt: endOfMonth },
        status: "completed",
      },
    }),
    prisma.booking.findMany({
      take: 5,
      orderBy: { bookingDate: "desc" },
      include: {
        client: true,
        vehicle: true,
        service: true,
      },
    }),
    prisma.booking.aggregate({
      where: {
        bookingDate: { gte: startOfMonth, lt: endOfMonth },
        status: "completed",
      },
      _sum: { finalPrice: true },
    }),
  ]);

  return {
    totalClients,
    totalVehicles,
    todayBookings,
    monthBookings,
    recentBookings,
    monthRevenue: monthRevenue._sum.finalPrice || 0,
  };
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  const stats = [
    {
      label: "Total Clients",
      value: data.totalClients,
      icon: Users,
      color: "bg-blue-50 text-blue-600",
      href: "/clients",
    },
    {
      label: "Vehicles",
      value: data.totalVehicles,
      icon: Car,
      color: "bg-emerald-50 text-emerald-600",
      href: "/clients",
    },
    {
      label: "Today's Jobs",
      value: data.todayBookings,
      icon: CalendarDays,
      color: "bg-amber-50 text-amber-600",
      href: "/bookings",
    },
    {
      label: "Revenue (Month)",
      value: formatPrice(data.monthRevenue),
      icon: DollarSign,
      color: "bg-purple-50 text-purple-600",
      href: "/history",
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Welcome back! Here&apos;s your business overview.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-brand-300 hover:shadow-md transition-all duration-200 group"
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}
                >
                  <Icon size={18} />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {stat.value}
              </div>
              <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
            </Link>
          );
        })}
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Recent Bookings</h2>
          <Link
            href="/bookings"
            className="text-sm text-brand-600 hover:text-brand-700 font-medium"
          >
            View all →
          </Link>
        </div>
        {data.recentBookings.length === 0 ? (
          <div className="p-12 text-center">
            <CalendarDays size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No bookings yet</p>
            <Link
              href="/bookings/new"
              className="inline-block mt-3 text-sm text-brand-600 hover:text-brand-700 font-medium"
            >
              Create your first booking →
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {data.recentBookings.map((booking) => (
              <Link
                key={booking.id}
                href={`/bookings/${booking.id}`}
                className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-gray-900 truncate">
                    {booking.client.firstName} {booking.client.lastName}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {booking.vehicle.make} {booking.vehicle.model} •{" "}
                    {booking.service.name}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">
                    {formatDate(booking.bookingDate)}
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
    </div>
  );
}
