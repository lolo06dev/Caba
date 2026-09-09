import { notFound } from "next/navigation";
import Link from "next/link";
import { getProductBySlug, getRelatedProducts } from "@/lib/data";
import { formatPrice, starArray } from "@/lib/types";
import AddToCartButton from "@/components/AddToCartButton";
import ProductCard from "@/components/ProductCard";

export const dynamic = "force-dynamic";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = product.categoryId
    ? await getRelatedProducts(product.categoryId, product.id)
    : [];

  const stars = starArray(product.rating);
  const images = product.images && product.images.length > 0 ? product.images : [product.image];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <Link href="/" className="hover:text-amber-600">الرئيسية</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-amber-600">المنتجات</Link>
        <span>/</span>
        <span className="text-slate-900 font-semibold line-clamp-1">{product.name}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12 bg-white rounded-3xl p-4 md:p-8 border border-slate-200">
        {/* Gallery */}
        <div>
          <div className="aspect-square rounded-2xl overflow-hidden bg-slate-100 relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {product.discount > 0 && (
              <span className="absolute top-4 right-4 bg-red-500 text-white text-sm font-bold px-3 py-1.5 rounded-xl shadow">
                خصم {product.discount}%
              </span>
            )}
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-2 mt-3">
              {images.map((src, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-lg overflow-hidden bg-slate-100 border-2 border-slate-200 hover:border-amber-500 cursor-pointer"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt={`${product.name} ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          {product.brand && (
            <div className="text-sm text-slate-500 mb-2">
              الماركة: <span className="font-semibold text-slate-700">{product.brand}</span>
            </div>
          )}
          <h1 className="text-2xl md:text-3xl font-extrabold mb-3">
            {product.name}
          </h1>

          {product.reviewsCount > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {stars.map((filled, idx) => (
                  <svg
                    key={idx}
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill={filled ? "#f59e0b" : "#e2e8f0"}
                  >
                    <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm text-slate-600">
                {(product.rating / 10).toFixed(1)} ({product.reviewsCount} تقييم)
              </span>
            </div>
          )}

          <div className="flex items-end gap-3 mb-5 pb-5 border-b border-slate-200">
            <span className="text-4xl font-black text-amber-600">
              {formatPrice(product.price)}
            </span>
            {product.oldPrice && product.oldPrice > product.price && (
              <>
                <span className="text-xl text-slate-400 line-through">
                  {formatPrice(product.oldPrice)}
                </span>
                <span className="bg-red-100 text-red-600 text-sm font-bold px-2.5 py-1 rounded-lg">
                  وفّر {formatPrice(product.oldPrice - product.price)}
                </span>
              </>
            )}
          </div>

          <div className="mb-5">
            <h3 className="font-bold mb-2">الوصف</h3>
            <p className="text-slate-600 leading-relaxed text-sm">
              {product.description}
            </p>
          </div>

          <div className="mb-5 flex items-center gap-2">
            <span
              className={`inline-block w-2.5 h-2.5 rounded-full ${
                product.stock > 0 ? "bg-emerald-500" : "bg-red-500"
              }`}
            />
            <span
              className={`text-sm font-semibold ${
                product.stock > 0 ? "text-emerald-600" : "text-red-600"
              }`}
            >
              {product.stock > 0
                ? `متوفر في المخزون (${product.stock} قطعة)`
                : "غير متوفر حالياً"}
            </span>
          </div>

          <AddToCartButton product={product} />

          <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-slate-200">
            <div className="text-center">
              <div className="text-2xl mb-1">🚚</div>
              <div className="text-xs font-semibold">شحن سريع</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-1">🔄</div>
              <div className="text-xs font-semibold">استرجاع مجاني</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-1">🛡️</div>
              <div className="text-xs font-semibold">ضمان سنة</div>
            </div>
          </div>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-6">
            منتجات مشابهة
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {related
              .filter((r) => r.id !== product.id)
              .slice(0, 4)
              .map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
          </div>
        </section>
      )}
    </div>
  );
}
