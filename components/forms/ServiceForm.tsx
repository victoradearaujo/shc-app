"use client";

import { useState } from "react";
import { Save, X } from "lucide-react";

interface ServiceData {
  id?: string;
  name: string;
  description: string;
  priceHatchSedan: number;
  priceSuv: number;
  price4x4: number;
  isExtra: boolean;
  isActive: boolean;
  sortOrder: number;
}

interface ServiceFormProps {
  initialData?: ServiceData;
  onSave: () => void;
  onCancel: () => void;
}

export default function ServiceForm({
  initialData,
  onSave,
  onCancel,
}: ServiceFormProps) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<ServiceData>({
    name: initialData?.name || "",
    description: initialData?.description || "",
    priceHatchSedan: initialData?.priceHatchSedan ?? 0,
    priceSuv: initialData?.priceSuv ?? 0,
    price4x4: initialData?.price4x4 ?? 0,
    isExtra: initialData?.isExtra ?? false,
    isActive: initialData?.isActive !== undefined ? initialData.isActive : true,
    sortOrder: initialData?.sortOrder ?? 0,
  });

  function update(field: keyof ServiceData, value: string | number | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const url = initialData?.id
        ? `/api/services/${initialData.id}`
        : "/api/services";
      const method = initialData?.id ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Something went wrong");
      }

      onSave();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="border border-brand-200 bg-brand-50/30 rounded-xl p-4">
      {error && (
        <div className="mb-3 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-xs">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Name *
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400"
            placeholder="Service name"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Sort Order
          </label>
          <input
            type="number"
            value={form.sortOrder}
            onChange={(e) => update("sortOrder", parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400"
          />
        </div>
        <div className="sm:col-span-2 lg:col-span-3">
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Description
          </label>
          <textarea
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 resize-none"
            placeholder="What's included..."
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Hatch/Sedan ($)
          </label>
          <input
            type="number"
            min="0"
            step="10"
            value={form.priceHatchSedan}
            onChange={(e) =>
              update("priceHatchSedan", parseFloat(e.target.value) || 0)
            }
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            SUV ($)
          </label>
          <input
            type="number"
            min="0"
            step="10"
            value={form.priceSuv}
            onChange={(e) => update("priceSuv", parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            4x4 ($)
          </label>
          <input
            type="number"
            min="0"
            step="10"
            value={form.price4x4}
            onChange={(e) => update("price4x4", parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400"
          />
        </div>
        <div className="flex items-center gap-4 sm:col-span-2 lg:col-span-3">
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isExtra}
              onChange={(e) => update("isExtra", e.target.checked)}
              className="rounded accent-brand-500"
            />
            Is extra
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => update("isActive", e.target.checked)}
              className="rounded accent-brand-500"
            />
            Active
          </label>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-1.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Save size={14} />
          {saving ? "Saving..." : "Save"}
        </button>
        <button
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <X size={14} />
          Cancel
        </button>
      </div>
    </div>
  );
}
