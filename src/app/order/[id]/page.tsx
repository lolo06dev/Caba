import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrderById, getOrderItems } from "@/lib/data";
import { formatPrice } from "@/lib/types";

export const dynamic = "force-dynamic";

const statusLabel: Record<string, string> = {
  pending: "قيد المراجعة",
  processing: "قيد التجهيز",
  shipped: "تم الشحن",
  delivered: "تم التوصيل",
  cancelled: "ملغي",
};

const statusColor: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-indigo-100 text-indigo-700",
  delivered: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
};

export default async function OrderSuccessPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const orderId = Number(id);
  if (!Number.isFinite(orderId)) notFound();
  const order = await getOrderById(orderId);
  if (!order) notFound();
  const items = await getOrderItems(orderId);

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
          <h1 className="text-3xl font-extrabold mb-2">تم تأكيد طلبك بنجاح!</h1>
          <p className="text-slate-600 mb-2">
            شكراً لك، {order.customerName}. تم استلام طلبك وسنقوم بمعالجته في
            أقرب وقت.
          </p>
          <p className="text-sm text-slate-500 mb-6">
            رقم الطلب: <span className="font-bold text-slate-900">#{order.id}</span>
          </p>

          <div className="inline-block">
            <span
              className={`text-sm font-bold px-4 py-1.5 rounded-full ${
                statusColor[order.status] ?? "bg-slate-100 text-slate-700"
              }`}
            >
              {statusLabel[order.status] ?? order.status}
            </span>
          </div>
        </div>

        {/* Order details */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 mt-6">
          <h2 className="text-xl font-bold mb-4">تفاصيل الطلب</h2>

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
              <span className="text-slate-600">المجموع الفرعي</span>
              <span className="font-semibold">{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">الشحن</span>
              <span className="font-semibold">
                {order.shipping === 0 ? "مجاني" : formatPrice(order.shipping)}
              </span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-slate-200">
              <span>الإجمالي</span>
              <span className="text-amber-600">{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Customer info */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 mt-6">
          <h2 className="text-xl font-bold mb-4">عنوان التوصيل</h2>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-slate-500">الاسم: </span>
              <span className="font-semibold">{order.customerName}</span>
            </div>
            <div>
              <span className="text-slate-500">الهاتف: </span>
              <span className="font-semibold" dir="ltr">{order.customerPhone}</span>
            </div>
            <div>
              <span className="text-slate-500">المحافظة: </span>
              <span className="font-semibold">{order.customerCity}</span>
            </div>
            <div>
              <span className="text-slate-500">العنوان: </span>
              <span className="font-semibold">{order.customerAddress}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <Link href="/products" className="btn btn-primary flex-1">
            متابعة التسوق
          </Link>
          <Link href="/" className="btn btn-outline flex-1">
            العودة للرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}
