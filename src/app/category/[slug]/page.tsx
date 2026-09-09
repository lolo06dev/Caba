import { notFound } from "next/navigation";
import Link from "next/link";
import { getCategoryBySlug, getProducts } from "@/lib/data";
import ProductCard from "@/components/ProductCard";

export const dynamic = "force-dynamic";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();
  const products = await getProducts({ categorySlug: slug });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Banner */}
      <div className="relative h-48 md:h-64 rounded-3xl overflow-hidden mb-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={category.image ?? ""}
          alt={category.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="absolute bottom-0 inset-x-0 p-6 text-white">
          <div className="flex items-center gap-2 text-sm mb-2">
            <Link href="/" className="hover:text-amber-300">الرئيسية</Link>
            <span>/</span>
            <Link href="/products" className="hover:text-amber-300">المنتجات</Link>
            <span>/</span>
            <span className="text-amber-300">{category.name}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-1">
            {category.name}
          </h1>
          {category.description && (
            <p className="text-white/90 text-sm max-w-2xl">
              {category.description}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <p className="text-slate-600">
          {products.length} منتج في هذه الفئة
        </p>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
          <div className="text-6xl mb-3">📦</div>
          <h3 className="font-bold text-xl mb-1">لا توجد منتجات بعد</h3>
          <p className="text-slate-500">سنضيف منتجات لهذه الفئة قريباً</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
