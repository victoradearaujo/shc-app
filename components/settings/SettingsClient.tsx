"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatPrice } from "@/lib/utils";
import { Plus, Edit, Trash2, CheckCircle, XCircle } from "lucide-react";
import ServiceForm from "@/components/forms/ServiceForm";

interface Service {
  id: string;
  name: string;
  description: string | null;
  priceHatchSedan: number;
  priceSuv: number;
  price4x4: number;
  isExtra: boolean;
  isActive: boolean;
  sortOrder: number;
}

interface SettingsClientProps {
  services: Service[];
}

export default function SettingsClient({ services }: SettingsClientProps) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addingMain, setAddingMain] = useState(false);
  const [addingExtra, setAddingExtra] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string>("");

  const mainServices = services.filter((s) => !s.isExtra);
  const extraServices = services.filter((s) => s.isExtra);

  function refresh() {
    router.refresh();
    setEditingId(null);
    setAddingMain(false);
    setAddingExtra(false);
  }

  async function handleDelete(id: string) {
    setDeleteError("");
    const res = await fetch(`/api/services/${id}`, { method: "DELETE" });
    if (res.ok) {
      router.refresh();
      setDeletingId(null);
    } else {
      const data = await res.json();
      setDeleteError(data.error || "Failed to delete");
      setDeletingId(null);
    }
  }

  function ServiceRow({ service }: { service: Service }) {
    if (editingId === service.id) {
      return (
        <ServiceForm
          initialData={{
            id: service.id,
            name: service.name,
            description: service.description || "",
            priceHatchSedan: service.priceHatchSedan,
            priceSuv: service.priceSuv,
            price4x4: service.price4x4,
            isExtra: service.isExtra,
            isActive: service.isActive,
            sortOrder: service.sortOrder,
          }}
          onSave={refresh}
          onCancel={() => setEditingId(null)}
        />
      );
    }

    return (
      <div className="border border-gray-100 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm text-gray-900">
                {service.name}
              </span>
              {!service.isActive && (
                <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">
                  Inactive
                </span>
              )}
            </div>
            {service.description && (
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                {service.description}
              </p>
            )}
            <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-600">
              <span>Hatch/Sedan: {formatPrice(service.priceHatchSedan)}</span>
              <span>SUV: {formatPrice(service.priceSuv)}</span>
              <span>4x4: {formatPrice(service.price4x4)}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setEditingId(service.id)}
              className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
            >
              <Edit size={14} />
            </button>
            {deletingId === service.id ? (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleDelete(service.id)}
                  className="w-8 h-8 rounded-lg bg-red-500 hover:bg-red-600 flex items-center justify-center text-white transition-colors"
                >
                  <CheckCircle size={14} />
                </button>
                <button
                  onClick={() => setDeletingId(null)}
                  className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
                >
                  <XCircle size={14} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setDeleteError("");
                  setDeletingId(service.id);
                }}
                className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-red-50 hover:text-red-500 flex items-center justify-center text-gray-400 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </div>
        {deletingId === service.id && (
          <p className="text-xs text-red-600 mt-2">
            Confirm delete? This cannot be undone.
          </p>
        )}
      </div>
    );
  }

  function Section({
    title,
    items,
    showAdd,
    onAdd,
    isExtra,
  }: {
    title: string;
    items: Service[];
    showAdd: boolean;
    onAdd: () => void;
    isExtra: boolean;
  }) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onAdd}
            className="inline-flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-700 font-medium"
          >
            <Plus size={16} />
            Add Service
          </button>
        </div>

        {deleteError && (
          <div className="mb-3 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-xs">
            {deleteError}
          </div>
        )}

        <div className="space-y-3">
          {showAdd && (
            <ServiceForm
              initialData={{
                name: "",
                description: "",
                priceHatchSedan: 0,
                priceSuv: 0,
                price4x4: 0,
                isExtra,
                isActive: true,
                sortOrder: 0,
              }}
              onSave={refresh}
              onCancel={() =>
                isExtra ? setAddingExtra(false) : setAddingMain(false)
              }
            />
          )}
          {items.map((s) => (
            <ServiceRow key={s.id} service={s} />
          ))}
          {items.length === 0 && !showAdd && (
            <p className="text-sm text-gray-500 text-center py-4">
              No services yet.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Section
        title="Main Services"
        items={mainServices}
        showAdd={addingMain}
        onAdd={() => setAddingMain(true)}
        isExtra={false}
      />
      <Section
        title="Extras"
        items={extraServices}
        showAdd={addingExtra}
        onAdd={() => setAddingExtra(true)}
        isExtra={true}
      />
    </div>
  );
}
