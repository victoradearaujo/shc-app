"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Save, ArrowLeft, Plus, Trash2, Car } from "lucide-react";
import Link from "next/link";

interface Vehicle {
  id?: string;
  make: string;
  model: string;
  year: number | null;
  color: string;
  rego: string;
  vehicleType: string;
  notes: string;
}

interface ClientFormProps {
  initialData?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    suburb: string;
    notes: string;
    vehicles: Vehicle[];
  };
}

export default function ClientForm({ initialData }: ClientFormProps) {
  const router = useRouter();
  const isEditing = !!initialData;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    firstName: initialData?.firstName || "",
    lastName: initialData?.lastName || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    address: initialData?.address || "",
    suburb: initialData?.suburb || "",
    notes: initialData?.notes || "",
  });

  const [vehicles, setVehicles] = useState<Vehicle[]>(
    initialData?.vehicles || []
  );

  function updateForm(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function addVehicle() {
    setVehicles((prev) => [
      ...prev,
      {
        make: "",
        model: "",
        year: null,
        color: "",
        rego: "",
        vehicleType: "hatch_sedan",
        notes: "",
      },
    ]);
  }

  function updateVehicle(index: number, field: string, value: string | number | null) {
    setVehicles((prev) =>
      prev.map((v, i) => (i === index ? { ...v, [field]: value } : v))
    );
  }

  function removeVehicle(index: number) {
    setVehicles((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const url = isEditing
        ? `/api/clients/${initialData.id}`
        : "/api/clients";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, vehicles }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Something went wrong");
      }

      const data = await res.json();
      router.push(`/clients/${data.id}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href={isEditing ? `/clients/${initialData.id}` : "/clients"}
          className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft size={16} />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? "Edit Client" : "New Client"}
          </h1>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-colors shadow-sm"
        >
          <Save size={16} />
          {saving ? "Saving..." : "Save Client"}
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Client Details */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">Client Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              First Name *
            </label>
            <input
              type="text"
              required
              value={form.firstName}
              onChange={(e) => updateForm("firstName", e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400"
              placeholder="John"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Last Name *
            </label>
            <input
              type="text"
              required
              value={form.lastName}
              onChange={(e) => updateForm("lastName", e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400"
              placeholder="Smith"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Phone *
            </label>
            <input
              type="tel"
              required
              value={form.phone}
              onChange={(e) => updateForm("phone", e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400"
              placeholder="0412 345 678"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => updateForm("email", e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400"
              placeholder="john@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Address
            </label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => updateForm("address", e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400"
              placeholder="42 Ocean Drive"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Suburb
            </label>
            <input
              type="text"
              value={form.suburb}
              onChange={(e) => updateForm("suburb", e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400"
              placeholder="Mooloolaba"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Notes
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => updateForm("notes", e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 resize-none"
              placeholder="Gate code, pet info, preferences..."
            />
          </div>
        </div>
      </div>

      {/* Vehicles */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Vehicles</h2>
          <button
            type="button"
            onClick={addVehicle}
            className="inline-flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-700 font-medium"
          >
            <Plus size={16} />
            Add Vehicle
          </button>
        </div>

        {vehicles.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl">
            <Car size={32} className="mx-auto text-gray-300 mb-2" />
            <p className="text-sm text-gray-500 mb-3">No vehicles added yet</p>
            <button
              type="button"
              onClick={addVehicle}
              className="inline-flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-700 font-medium"
            >
              <Plus size={16} />
              Add Vehicle
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {vehicles.map((vehicle, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-xl p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700">
                    Vehicle {index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeVehicle(index)}
                    className="text-red-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Make *
                    </label>
                    <input
                      type="text"
                      required
                      value={vehicle.make}
                      onChange={(e) =>
                        updateVehicle(index, "make", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400"
                      placeholder="Toyota"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Model *
                    </label>
                    <input
                      type="text"
                      required
                      value={vehicle.model}
                      onChange={(e) =>
                        updateVehicle(index, "model", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400"
                      placeholder="RAV4"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Type *
                    </label>
                    <select
                      value={vehicle.vehicleType}
                      onChange={(e) =>
                        updateVehicle(index, "vehicleType", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 bg-white"
                    >
                      <option value="hatch_sedan">Hatch/Sedan</option>
                      <option value="suv">SUV</option>
                      <option value="4x4">4x4</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Year
                    </label>
                    <input
                      type="number"
                      value={vehicle.year || ""}
                      onChange={(e) =>
                        updateVehicle(
                          index,
                          "year",
                          e.target.value ? parseInt(e.target.value) : null
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400"
                      placeholder="2022"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Colour
                    </label>
                    <input
                      type="text"
                      value={vehicle.color}
                      onChange={(e) =>
                        updateVehicle(index, "color", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400"
                      placeholder="White"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Rego
                    </label>
                    <input
                      type="text"
                      value={vehicle.rego}
                      onChange={(e) =>
                        updateVehicle(index, "rego", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400"
                      placeholder="ABC123"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </form>
  );
}
