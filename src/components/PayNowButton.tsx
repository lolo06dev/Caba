"use client";

import { useState } from "react";

export default function PayNowButton({ orderId }: { orderId: number }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handlePay() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/orders/${orderId}/pay`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to start the payment");
      window.location.href = data.paymentUrl as string;
    } catch (e: any) {
      setError(e.message || "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={handlePay}
        disabled={loading}
        className="btn btn-primary w-full"
      >
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Redirecting to payment...
          </>
        ) : (
          <>
            💳 Pay now with EDAHABIA / CIB
          </>
        )}
      </button>
      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
}
