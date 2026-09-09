import { db } from "@/db";
import { categories, products } from "@/db/schema";
import { eq, inArray, sql } from "drizzle-orm";

const img = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=80`;

// =====================
// Store categories (Clothes / Shoes / Electronics)
// =====================
const categoriesData = [
  {
    name: "Clothes",
    slug: "clothes",
    description: "Apparel and clothing for every style",
    image: img("photo-1576566588028-4147f3842f27"),
  },
  {
    name: "Shoes",
    slug: "shoes",
    description: "Sneakers, boots and footwear",
    image: img("photo-1549298916-b41d501d3772"),
  },
  {
    name: "Electronics",
    slug: "electronics",
    description: "Phones, gadgets and electronic accessories",
    image: img("photo-1498049794561-7780e7231661"),
  },
];

// Old demo categories from the original template — they are merged into
// "clothes" and removed so the store only shows the 3 categories above.
const legacySlugs = ["t-shirts", "shorts", "sets", "accessories"];

// =====================
// Demo products (seeded once on an empty database)
// =====================
const productData = [
  {
    name: "Caba Product BOXY T SHIRT",
    slug: "glitch-boxy-t-shirt",
    description:
      "Oversized boxy fit t-shirt from the Summer 2026 collection. Premium cotton with clean aesthetics.",
    price: 440000,
    oldPrice: null,
    image: img("photo-1576566588028-4147f3842f27"),
    category: "clothes",
    brand: "SUMMER 2026",
    stock: 25,
    rating: 48,
    reviewsCount: 45,
    featured: 1,
    isNew: 1,
    discount: 0,
  },
  {
    name: "Caba Product FULL SET T-SHIRT SHORT",
    slug: "glitch-full-set-tshirt-short",
    description:
      "Complete outfit set including oversized t-shirt and premium shorts. Summer 2026 collection.",
    price: 780000,
    oldPrice: null,
    image: img("photo-1621072156002-e2fccdc0b176"),
    category: "clothes",
    brand: "SUMMER 2026",
    stock: 15,
    rating: 49,
    reviewsCount: 67,
    featured: 1,
    isNew: 1,
    discount: 0,
  },
  {
    name: "Caba Product SLEEVELESS TEE",
    slug: "glitch-sleeveless-tee",
    description:
      "Sleeveless muscle tee with Caba Product branding. Perfect for summer vibes.",
    price: 350000,
    oldPrice: null,
    image: img("photo-1583743814966-8936f5b7be1a"),
    category: "clothes",
    brand: "SUMMER 2026",
    stock: 30,
    rating: 46,
    reviewsCount: 34,
    featured: 1,
    isNew: 1,
    discount: 0,
  },
  {
    name: "Caba Product CARGO SHORT BLACK",
    slug: "glitch-cargo-short-black",
    description:
      "Premium black cargo shorts with multiple pockets. Streetwear essential.",
    price: 450000,
    oldPrice: null,
    image: img("photo-1591195853828-11db59a44f6b"),
    category: "clothes",
    brand: "SUMMER 2026",
    stock: 20,
    rating: 47,
    reviewsCount: 52,
    featured: 0,
    isNew: 1,
    discount: 0,
  },
  {
    name: "Caba Product ARISE BLACK",
    slug: "glitch-arise-black",
    description:
      "Arise collection black tee. Bold statement piece from Drop 2025.",
    price: 890000,
    oldPrice: null,
    image: img("photo-1618354691373-d851c5c3a990"),
    category: "clothes",
    brand: "DROP 2025",
    stock: 0,
    rating: 49,
    reviewsCount: 120,
    featured: 0,
    isNew: 0,
    discount: 0,
  },
  {
    name: "Caba Product ARISE WHITE",
    slug: "glitch-arise-white",
    description:
      "Arise collection white tee. Clean design with premium fabric from Drop 2025.",
    price: 890000,
    oldPrice: null,
    image: img("photo-1521572163474-6864f9cf17ab"),
    category: "clothes",
    brand: "DROP 2025",
    stock: 0,
    rating: 48,
    reviewsCount: 95,
    featured: 0,
    isNew: 0,
    discount: 0,
  },
  {
    name: "Caba Product BOXY FIT T SHIRT BLACK",
    slug: "glitch-boxy-fit-tshirt-black",
    description:
      "Original boxy fit tee in black. Classic Caba Product design from Drop 2024.",
    price: 290000,
    oldPrice: null,
    image: img("photo-1503342217505-b0a15ec3261c"),
    category: "clothes",
    brand: "DROP 2024",
    stock: 0,
    rating: 47,
    reviewsCount: 156,
    featured: 0,
    isNew: 0,
    discount: 0,
  },
  {
    name: "Caba Product BOXY FIT T SHIRT WHITE",
    slug: "glitch-boxy-fit-tshirt-white",
    description:
      "Original boxy fit tee in white. Clean Caba Product branding from Drop 2024.",
    price: 290000,
    oldPrice: null,
    image: img("photo-1622470953794-aa9c70b0fb9d"),
    category: "clothes",
    brand: "DROP 2024",
    stock: 0,
    rating: 46,
    reviewsCount: 143,
    featured: 0,
    isNew: 0,
    discount: 0,
  },
];

async function migrateOrdersTable() {
  // Add the new order columns (commune + online payment) to existing databases.
  // Idempotent: safe to run on every boot.
  await db.execute(sql`
    ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "customer_commune" varchar(120)
  `);
  await db.execute(sql`
    ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "payment_method" varchar(20) NOT NULL DEFAULT 'cod'
  `);
  await db.execute(sql`
    ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "payment_status" varchar(20) NOT NULL DEFAULT 'unpaid'
  `);
  await db.execute(sql`
    ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "chargily_checkout_id" varchar(120)
  `);
}

async function migrateCategories() {
  // 1. Always make sure the 3 store categories exist (idempotent).
  for (const c of categoriesData) {
    await db
      .insert(categories)
      .values(c)
      .onConflictDoNothing({ target: categories.slug });
  }

  // 2. Merge the old template categories into "clothes" and remove them,
  //    so only Clothes / Shoes / Electronics are shown in the store & dashboard.
  const legacy = await db
    .select()
    .from(categories)
    .where(inArray(categories.slug, legacySlugs));
  if (legacy.length > 0) {
    const [clothes] = await db
      .select()
      .from(categories)
      .where(eq(categories.slug, "clothes"))
      .limit(1);
    if (clothes) {
      const legacyIds = legacy.map((l) => l.id);
      await db
        .update(products)
        .set({ categoryId: clothes.id })
        .where(inArray(products.categoryId, legacyIds));
      await db.delete(categories).where(inArray(categories.id, legacyIds));
    }
  }
}

async function seedDemoProducts() {
  // Only seed demo products on a completely empty products table.
  const existing = await db.select().from(products).limit(1);
  if (existing.length > 0) return;

  const catRows = await db.select().from(categories);
  const catMap = new Map(catRows.map((c) => [c.slug, c.id]));

  for (const p of productData) {
    await db.insert(products).values({
      name: p.name,
      slug: p.slug,
      description: p.description,
      price: p.price,
      oldPrice: p.oldPrice,
      image: p.image,
      images: [p.image],
      categoryId: catMap.get(p.category) ?? null,
      brand: p.brand,
      stock: p.stock,
      rating: p.rating,
      reviewsCount: p.reviewsCount,
      featured: p.featured,
      isNew: p.isNew,
      discount: p.discount,
    });
  }
}

export async function seedDatabase() {
  await migrateOrdersTable();
  await migrateCategories();
  await seedDemoProducts();
}
