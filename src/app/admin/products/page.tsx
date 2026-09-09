import { desc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { categories, products } from "@/db/schema";
import { getCategories } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import ProductsManager from "./ProductsManager";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  // Defense in depth on top of the /admin middleware: never render the list
  // for an anonymous visitor.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/admin/login?redirect=/admin/products");
  }

  // getCategories seeds the store on an empty database, so it must run
  // before we list the products.
  const cats = await getCategories();

  const rows = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      description: products.description,
      price: products.price,
      oldPrice: products.oldPrice,
      image: products.image,
      images: products.images,
      categoryId: products.categoryId,
      categoryName: categories.name,
      brand: products.brand,
      stock: products.stock,
      featured: products.featured,
      isNew: products.isNew,
      discount: products.discount,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .orderBy(desc(products.createdAt));

  return (
    <ProductsManager
      products={rows.map((row) => ({
        ...row,
        images: row.images ?? [],
      }))}
      categories={cats.map((c) => ({ id: c.id, name: c.name, slug: c.slug }))}
    />
  );
}
