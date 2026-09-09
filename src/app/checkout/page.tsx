"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-store";

const fmt = (n: number) =>
  new Intl.NumberFormat("ar-EG", { minimumFractionDigits: 0 }).format(n / 100) +
  " ج.م";

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCart((s) => s.items);
  const clear = useCart((s) => s.clear);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    notes: "",
    payment: "cod",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const shipping = items.length === 0 ? 0 : subtotal > 50000 ? 0 : 5000;
  const total = subtotal + shipping;

  const onChange = (k: keyof typeof form, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.name || !form.phone || !form.address || !form.city) {
      setError("من فضلك أكمل جميع البيانات المطلوبة");
      return;
    }
    if (items.length === 0) {
      setError("السلة فارغة");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            name: form.name,
            phone: form.phone,
            email: form.email || undefined,
            address: form.address,
            city: form.city,
          },
          notes: form.notes || undefined,
          items: items.map((i) => ({
            productId: i.productId,
            name: i.name,
            image: i.image,
            price: i.price,
            quantity: i.quantity,
            slug: i.slug,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشل إنشاء الطلب");
      clear();
      router.push(`/order/${data.order.id}`);
    } catch (err: any) {
      setError(err.message || "حدث خطأ");
      setSubmitting(false);
    }
  };

  if (!hydrated) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="inline-block w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-2xl p-10 border border-slate-200 max-w-md mx-auto">
          <div className="text-6xl mb-3">🛒</div>
          <h2 className="text-2xl font-extrabold mb-2">السلة فارغة</h2>
          <p className="text-slate-500 mb-5">أضف منتجات أولاً قبل إتمام الطلب</p>
          <Link href="/products" className="btn btn-primary">
            تصفح المنتجات
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <Link href="/" className="hover:text-amber-600">الرئيسية</Link>
        <span>/</span>
        <span className="text-slate-900 font-semibold">إتمام الطلب</span>
      </div>

      <h1 className="text-3xl md:text-4xl font-extrabold mb-8">إتمام الطلب</h1>

      <form onSubmit={onSubmit} className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Customer info */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center text-sm">
                1
              </span>
              بيانات العميل
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1.5">
                  الاسم الكامل <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => onChange("name", e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5">
                  رقم الهاتف <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => onChange("phone", e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold mb-1.5">
                  البريد الإلكتروني (اختياري)
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => onChange("email", e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Shipping address */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center text-sm">
                2
              </span>
              عنوان التوصيل
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1.5">
                  المحافظة <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.city}
                  onChange={(e) => onChange("city", e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                  required
                >
                  <option value="">اختر المحافظة</option>
                  {[
                    "القاهرة",
                    "الجيزة",
                    "الإسكندرية",
                    "المنصورة",
                    "أسيوط",
                    "الأقصر",
                    "أسوان",
                    "بورسعيد",
                    "السويس",
                    "الإسماعيلية",
                    "الفيوم",
                    "البحيرة",
                    "الدقهلية",
                    "الشرقية",
                    "المنوفية",
                    "القليوبية",
                    "البحر الأحمر",
                    "الوادي الجديد",
                    "مطروح",
                    "شمال سيناء",
                    "جنوب سيناء",
                    "دمياط",
                    "كفر الشيخ",
                    "سوهاج",
                    "قنا",
                  ].map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold mb-1.5">
                  العنوان بالتفصيل <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => onChange("address", e.target.value)}
                  placeholder="الشارع، رقم المبنى، علامة مميزة..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold mb-1.5">
                  ملاحظات (اختياري)
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) => onChange("notes", e.target.value)}
                  rows={3}
                  placeholder="أي ملاحظات إضافية على الطلب..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center text-sm">
                3
              </span>
              طريقة الدفع
            </h2>
            <div className="space-y-2">
              {[
                { v: "cod", t: "الدفع عند الاستلام", d: "ادفع نقداً عند استلام الطلب" },
                { v: "card", t: "بطاقة ائتمانية", d: "دفع آمن عبر الإنترنت" },
              ].map((m) => (
                <label
                  key={m.v}
                  className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition ${
                    form.payment === m.v
                      ? "border-amber-500 bg-amber-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={m.v}
                    checked={form.payment === m.v}
                    onChange={(e) => onChange("payment", e.target.value)}
                    className="mt-1 accent-amber-500"
                  />
                  <div>
                    <div className="font-semibold">{m.t}</div>
                    <div className="text-sm text-slate-500">{m.d}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 sticky top-32">
            <h2 className="text-xl font-bold mb-4">ملخص الطلب</h2>
            <div className="space-y-3 max-h-80 overflow-y-auto mb-4">
              {items.map((it) => (
                <div key={it.productId} className="flex gap-3 text-sm">
                  <div className="relative w-14 h-14 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={it.image} alt={it.name} className="w-full h-full object-cover" />
                    <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                      {it.quantity}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold line-clamp-2">{it.name}</div>
                    <div className="text-amber-600 font-bold">
                      {fmt(it.price * it.quantity)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-200 pt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">المجموع الفرعي</span>
                <span className="font-semibold">{fmt(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">الشحن</span>
                <span className="font-semibold">
                  {shipping === 0 ? (
                    <span className="text-emerald-600">مجاني</span>
                  ) : (
                    fmt(shipping)
                  )}
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-slate-200">
                <span>الإجمالي</span>
                <span className="text-amber-600">{fmt(total)}</span>
              </div>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary w-full mt-5"
            >
              {submitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  جاري الإرسال...
                </>
              ) : (
                <>تأكيد الطلب ({fmt(total)})</>
              )}
            </button>
            <p className="text-xs text-slate-500 text-center mt-3">
              بالنقر على "تأكيد الطلب" فأنت توافق على شروط الاستخدام
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
