"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { getPriceForVehicle, formatPrice } from "@/lib/utils";
import { ArrowLeft, Save, DollarSign } from "lucide-react";
import Link from "next/link";

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number | null;
  vehicleType: string;
  color: string | null;
  rego: string | null;
}

interface ClientWithVehicles {
  id: string;
  firstName: string;
  lastName: string;
  vehicles: Vehicle[];
}

interface Service {
  id: string;
  name: string;
  priceHatchSedan: number;
  priceSuv: number;
  price4x4: number;
  isExtra: boolean;
}

interface BookingFormProps {
  clients: ClientWithVehicles[];
  services: Service[];
  initialClientId?: string;
}

export default function BookingForm({ clients, services, initialClientId }: BookingFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const mainServices = services.filter((s) => !s.isExtra);

  const [form, setForm] = useState({
    clientId: initialClientId || "",
    vehicleId: "",
    serviceId: "",
    bookingDate: "",
    bookingTime: "",
    travelSurcharge: "0",
    notes: "",
  });

  function updateForm(field: string, value: string) {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "clientId") next.vehicleId = "";
      return next;
    });
  }

  const selectedClient = clients.find((c) => c.id === form.clientId);
  const availableVehicles = selectedClient?.vehicles || [];
  const selectedVehicle = availableVehicles.find((v) => v.id === form.vehicleId);
  const selectedService = mainServices.find((s) => s.id === form.serviceId);

  const basePrice =
    selectedService && selectedVehicle
      ? getPriceForVehicle(selectedService, selectedVehicle.vehicleType)
      : 0;
  const surcharge = parseFloat(form.travelSurcharge) || 0;
  const totalPrice = basePrice + surcharge;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: form.clientId,
          vehicleId: form.vehicleId,
          serviceId: form.serviceId,
          bookingDate: form.bookingDate,
          bookingTime: form.bookingTime || null,
          estimatedPrice: totalPrice,
          travelSurcharge: surcharge,
          notes: form.notes || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Something went wrong");
      }

      const data = await res.json();
      router.push(`/bookings/${data.id}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/bookings"
          className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft size={16} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 flex-1">New Booking</h1>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-colors shadow-sm"
        >
          <Save size={16} />
          {saving ? "Saving..." : "Save Booking"}
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Client & Vehicle</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Client *</label>
                <select
                  required
                  value={form.clientId}
                  onChange={(e) => updateForm("clientId", e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 bg-white"
                >
                  <option value="">Select client...</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.firstName} {c.lastName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Vehicle *</label>
                <select
                  required
                  value={form.vehicleId}
                  onChange={(e) => updateForm("vehicleId", e.target.value)}
                  disabled={!form.clientId || availableVehicles.length === 0}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 bg-white disabled:opacity-50"
                >
                  <option value="">Select vehicle...</option>
                  {availableVehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.make} {v.model}
                      {v.year ? ` (${v.year})` : ""}
                      {v.rego ? ` — ${v.rego}` : ""}
                    </option>
                  ))}
                </select>
                {form.clientId && availableVehicles.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1">This client has no vehicles registered.</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Service</h2>
            <div className="grid gap-3">
              {mainServices.map((s) => (
                <label
                  key={s.id}
                  className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                    form.serviceId === s.id ? "border-brand-400 bg-brand-50" : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="serviceId"
                    value={s.id}
                    checked={form.serviceId === s.id}
                    onChange={(e) => updateForm("serviceId", e.target.value)}
                    className="accent-brand-500"
                    required
                  />
                  <div className="flex-1">
                    <div className="font-medium text-sm text-gray-900">{s.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      Hatch/Sedan: {formatPrice(s.priceHatchSedan)} · SUV: {formatPrice(s.priceSuv)} · 4x4: {formatPrice(s.price4x4)}
                    </div>
                  </div>
                  {form.serviceId === s.id && selectedVehicle && (
                    <div className="text-sm font-bold text-brand-600">
                      {formatPrice(getPriceForVehicle(s, selectedVehicle.vehicleType))}
                    </div>
                  )}
                </label>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Schedule</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Date *</label>
                <input
                  type="date"
                  required
                  value={form.bookingDate}
                  onChange={(e) => updateForm("bookingDate", e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Time</label>
                <input
                  type="time"
                  value={form.bookingTime}
                  onChange={(e) => updateForm("bookingTime", e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Travel Surcharge ($)</label>
                <input
                  type="number"
                  min="0"
                  step="5"
                  value={form.travelSurcharge}
                  onChange={(e) => updateForm("travelSurcharge", e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes</label>
                <input
                  type="text"
                  value={form.notes}
                  onChange={(e) => updateForm("notes", e.target.value)}
                  placeholder="Any special instructions..."
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400"
                />
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-6">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <DollarSign size={16} />
              Price Summary
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Base price</span>
                <span className="font-medium">{basePrice > 0 ? formatPrice(basePrice) : "—"}</span>
              </div>
              {surcharge > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Travel surcharge</span>
                  <span className="font-medium">{formatPrice(surcharge)}</span>
                </div>
              )}
              <div className="border-t border-gray-100 pt-3 flex justify-between">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="font-bold text-xl text-brand-600">
                  {totalPrice > 0 ? formatPrice(totalPrice) : "—"}
                </span>
              </div>
            </div>
            {!selectedVehicle && (
              <p className="text-xs text-gray-400 mt-4">
                Select a client, vehicle, and service to see the price.
              </p>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
