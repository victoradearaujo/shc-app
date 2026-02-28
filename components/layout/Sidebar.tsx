"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  History,
  Settings,
  Sun,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/bookings", label: "Bookings", icon: CalendarDays },
  { href: "/history", label: "Job History", icon: History },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 md:hidden bg-navy-500 text-white p-2 rounded-lg shadow-lg"
      >
        <Menu size={20} />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-50
          w-64 bg-navy-500 text-white flex flex-col
          transform transition-transform duration-200 ease-in-out
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"} 
          md:translate-x-0
        `}
      >
        {/* Logo area */}
        <div className="p-6 border-b border-white/10">
          <button
            onClick={() => setMobileOpen(false)}
            className="absolute top-4 right-4 md:hidden text-white/60 hover:text-white"
          >
            <X size={20} />
          </button>
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center">
              <Sun size={22} className="text-white" />
            </div>
            <div>
              <div className="font-bold text-sm leading-tight">Sunshine</div>
              <div className="text-brand-400 text-xs font-medium leading-tight">
                Hot Cars
              </div>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname?.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                  transition-all duration-150
                  ${
                    isActive
                      ? "bg-white/15 text-white shadow-sm"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }
                `}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/10">
          <div className="text-xs text-white/40 text-center">
            Sunshine Hot Cars © 2026
          </div>
        </div>
      </aside>
    </>
  );
}
