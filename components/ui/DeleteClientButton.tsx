"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash2 } from "lucide-react";

export default function DeleteClientButton({
  clientId,
  clientName,
}: {
  clientId: string;
  clientName: string;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/clients/${clientId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.push("/clients");
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
      setConfirming(false);
    }
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-red-600">Delete {clientName}?</span>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-medium transition-colors"
        >
          {deleting ? "..." : "Yes"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-medium transition-colors"
        >
          No
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center hover:bg-red-50 hover:border-red-200 hover:text-red-600 text-gray-400 transition-colors"
    >
      <Trash2 size={15} />
    </button>
  );
}
