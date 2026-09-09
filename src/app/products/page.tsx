import { getProducts } from "@/lib/data";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";

export const dynamic = "force-dynamic";

type SearchParams = {
  search?: string;
  filter?: "new" | "deals" | "featured";
  sort?: "newest" | "price-asc" | "price-desc" | "rating";
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const search = params.search;
  const filter = params.filter;
  const sort = params.sort ?? "newest";

  let products = await getProducts({
    search,
    newOnly: filter === "new",
  });

  if (filter === "deals") {
    products = products.filter((p) => p.discount > 0);
  } else if (filter === "featured") {
    products = products.filter((p) => p.featured === 1);
  }

  if (sort === "price-asc") {
    products = [...products].sort((a, b) => a.price - b.price);
  } else if (sort === "price-desc") {
    products = [...products].sort((a, b) => b.price - a.price);
  } else if (sort === "rating") {
    products = [...products].sort((a, b) => b.rating - a.rating);
  }

  const title = search
    ? `نتائج البحث عن "${search}"`
    : filter === "new"
    ? "وصل حديثاً"
    : filter === "deals"
    ? "العروض والتخفيضات"
    : filter === "featured"
    ? "المنتجات المميزة"
    : "كل المنتجات";

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
        <Link href="/" className="hover:text-amber-600">الرئيسية</Link>
        <span>/</span>
        <span className="text-slate-900 font-semibold">{title}</span>
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-1">{title}</h1>
          <p className="text-slate-500 text-sm">
            {products.length} منتج
          </p>
        </div>

        {/* Sort */}
        <form className="flex items-center gap-2">
          <input type="hidden" name="search" value={search ?? ""} />
          {filter && <input type="hidden" name="filter" value={filter} />}
          <label className="text-sm text-slate-600">ترتيب:</label>
          <select
            name="sort"
            defaultValue={sort}
            className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="newest">الأحدث</option>
            <option value="price-asc">السعر: من الأقل</option>
            <option value="price-desc">السعر: من الأعلى</option>
            <option value="rating">الأعلى تقييماً</option>
          </select>
          <button type="submit" className="btn btn-dark text-sm">
            تطبيق
          </button>
        </form>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
          <div className="text-6xl mb-3">📦</div>
          <h3 className="font-bold text-xl mb-1">لا توجد منتجات</h3>
          <p className="text-slate-500 mb-5">جرّب البحث بكلمات أخرى</p>
          <Link href="/products" className="btn btn-primary">
            كل المنتجات
          </Link>
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
