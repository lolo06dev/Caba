import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrderById, getOrderItems } from "@/lib/data";
import { isChargilyConfigured } from "@/lib/chargily";
import { formatPrice } from "@/lib/types";
import PayNowButton from "@/components/PayNowButton";

export const dynamic = "force-dynamic";

const statusLabel: Record<string, string> = {
  pending: "Pending review",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const statusColor: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-indigo-100 text-indigo-700",
  delivered: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
};

const paymentStatusLabel: Record<string, string> = {
  unpaid: "Unpaid",
  paid: "Paid",
  failed: "Payment failed",
};

const paymentStatusColor: Record<string, string> = {
  unpaid: "bg-slate-100 text-slate-700",
  paid: "bg-emerald-100 text-emerald-700",
  failed: "bg-red-100 text-red-700",
};

export default async function OrderSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ payment?: string }>;
}) {
  const { id } = await params;
  const { payment } = await searchParams;
  const orderId = Number(id);
  if (!Number.isFinite(orderId)) notFound();
  const order = await getOrderById(orderId);
  if (!order) notFound();
  const items = await getOrderItems(orderId);

  const isOnlineOrder = order.paymentMethod === "chargily";
  const canPayNow = isOnlineOrder && order.paymentStatus !== "paid" && isChargilyConfigured();

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="max-w-2xl mx-auto">
        {/* Success card */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-emerald-600"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold mb-2">Your order is confirmed!</h1>
          <p className="text-slate-600 mb-2">
            Thank you, {order.customerName}. We have received your order and will
            process it as soon as possible.
          </p>
          <p className="text-sm text-slate-500 mb-6">
            Order number: <span className="font-bold text-slate-900">#{order.id}</span>
          </p>

          <div className="inline-flex flex-wrap items-center justify-center gap-2">
            <span
              className={`text-sm font-bold px-4 py-1.5 rounded-full ${
                statusColor[order.status] ?? "bg-slate-100 text-slate-700"
              }`}
            >
              {statusLabel[order.status] ?? order.status}
            </span>
            <span
              className={`text-sm font-bold px-4 py-1.5 rounded-full ${
                order.paymentStatus === "paid"
                  ? paymentStatusColor.paid
                  : isOnlineOrder
                  ? paymentStatusColor[order.paymentStatus] ?? paymentStatusColor.unpaid
                  : "bg-slate-100 text-slate-700"
              }`}
            >
              {order.paymentStatus === "paid"
                ? "Paid"
                : isOnlineOrder
                ? paymentStatusLabel[order.paymentStatus] ?? "Unpaid"
                : "Due on delivery"}
            </span>
          </div>
        </div>

        {/* Payment banners after redirect from Chargily */}
        {payment === "success" && (
          <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl text-sm">
            Thank you for your payment! We are confirming it now — your order
            status will update to <strong>Paid</strong> within a few moments.
          </div>
        )}
        {payment === "failed" && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-sm">
            The payment was canceled or failed. You can retry using the button
            below.
          </div>
        )}
        {payment === "error" && (
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 text-amber-700 rounded-2xl text-sm">
            We could not start the online payment. Your order is saved — you can
            retry using the button below or contact us.
          </div>
        )}

        {/* Order details */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 mt-6">
          <h2 className="text-xl font-bold mb-4">Order details</h2>

          <div className="space-y-3 mb-5">
            {items.map((it) => (
              <div
                key={it.id}
                className="flex items-center gap-3 py-3 border-b border-slate-100 last:border-0"
              >
                <div className="w-16 h-16 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={it.productImage ?? ""}
                    alt={it.productName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold line-clamp-2">{it.productName}</div>
                  <div className="text-sm text-slate-500">
                    {it.quantity} × {formatPrice(it.price)}
                  </div>
                </div>
                <div className="font-bold text-amber-600">
                  {formatPrice(it.price * it.quantity)}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2 text-sm border-t border-slate-200 pt-3">
            <div className="flex justify-between">
              <span className="text-slate-600">Subtotal</span>
              <span className="font-semibold">{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Shipping</span>
              <span className="font-semibold">
                {order.shipping === 0 ? "Free" : formatPrice(order.shipping)}
              </span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-slate-200">
              <span>Total</span>
              <span className="text-amber-600">{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Pay now (online payment orders) */}
        {canPayNow && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 mt-6">
            <h2 className="text-xl font-bold mb-2">Online payment</h2>
            <p className="text-sm text-slate-500 mb-4">
              This order is not paid yet. Pay securely with your EDAHABIA or CIB
              card — powered by Chargily.
            </p>
            <PayNowButton orderId={order.id} />
          </div>
        )}

        {/* Customer info */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 mt-6">
          <h2 className="text-xl font-bold mb-4">Delivery address</h2>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-slate-500">Name: </span>
              <span className="font-semibold">{order.customerName}</span>
            </div>
            <div>
              <span className="text-slate-500">Phone: </span>
              <span className="font-semibold" dir="ltr">{order.customerPhone}</span>
            </div>
            <div>
              <span className="text-slate-500">Wilaya: </span>
              <span className="font-semibold">{order.customerCity}</span>
            </div>
            {order.customerCommune && (
              <div>
                <span className="text-slate-500">Commune: </span>
                <span className="font-semibold">{order.customerCommune}</span>
              </div>
            )}
            <div>
              <span className="text-slate-500">Address: </span>
              <span className="font-semibold">{order.customerAddress}</span>
            </div>
            <div>
              <span className="text-slate-500">Payment: </span>
              <span className="font-semibold">
                {isOnlineOrder ? "Online (EDAHABIA / CIB)" : "Cash on delivery"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <Link href="/products" className="btn btn-primary flex-1">
            Continue shopping
          </Link>
          <Link href="/" className="btn btn-outline flex-1">
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
