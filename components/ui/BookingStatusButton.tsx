"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatPrice } from "@/lib/utils";
import { Play, CheckCircle, XCircle, Loader2 } from "lucide-react";

interface BookingStatusButtonProps {
  bookingId: string;
  currentStatus: string;
  estimatedPrice: number | null;
}

export default function BookingStatusButton({
  bookingId,
  currentStatus,
  estimatedPrice,
}: BookingStatusButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");

  async function updateStatus(data: object) {
    setLoading(true);
    try {
      await fetch(`/api/bookings/${bookingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      router.refresh();
    } finally {
      setLoading(false);
      setShowCompleteConfirm(false);
      setShowCancelConfirm(false);
    }
  }

  if (currentStatus === "completed" || currentStatus === "cancelled") {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {loading && <Loader2 size={16} className="animate-spin text-gray-400" />}

      {currentStatus === "booked" && !loading && (
        <button
          onClick={() => updateStatus({ status: "in_progress" })}
          className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
        >
          <Play size={14} />
          Start Job
        </button>
      )}

      {currentStatus === "in_progress" && !loading && !showCompleteConfirm && !showCancelConfirm && (
        <button
          onClick={() => setShowCompleteConfirm(true)}
          className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
        >
          <CheckCircle size={14} />
          Complete
        </button>
      )}

      {showCompleteConfirm && !loading && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5">
          <span className="text-sm text-green-800">
            Mark complete? Final price:{" "}
            <strong>{estimatedPrice ? formatPrice(estimatedPrice) : "$0"}</strong>
          </span>
          <button
            onClick={() => updateStatus({ status: "completed", finalPrice: estimatedPrice })}
            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg text-xs font-medium"
          >
            Confirm
          </button>
          <button
            onClick={() => setShowCompleteConfirm(false)}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-lg text-xs font-medium"
          >
            Back
          </button>
        </div>
      )}

      {!loading && !showCancelConfirm && !showCompleteConfirm && (
        <button
          onClick={() => setShowCancelConfirm(true)}
          className="inline-flex items-center gap-2 border border-gray-200 hover:bg-red-50 hover:border-red-200 hover:text-red-600 text-gray-500 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
        >
          <XCircle size={14} />
          Cancel Booking
        </button>
      )}

      {showCancelConfirm && !loading && (
        <div className="w-full flex flex-col gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <span className="text-sm text-red-800 font-medium">Cancellation reason (optional):</span>
          <input
            type="text"
            value={cancellationReason}
            onChange={(e) => setCancellationReason(e.target.value)}
            placeholder="e.g. Client rescheduled"
            className="w-full px-3 py-2 border border-red-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20"
          />
          <div className="flex gap-2">
            <button
              onClick={() => updateStatus({ status: "cancelled", cancellationReason: cancellationReason || null })}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-xs font-medium"
            >
              Confirm Cancel
            </button>
            <button
              onClick={() => { setShowCancelConfirm(false); setCancellationReason(""); }}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-lg text-xs font-medium"
            >
              Keep Booking
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
