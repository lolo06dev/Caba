import { db } from "@/db";
import { categories, products } from "@/db/schema";
import { sql } from "drizzle-orm";

// Flag file check - we use a simple approach: check if any product has Caba Product in the name
// If not, we need to reseed
const img = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=80`;

const cat = (name: string, slug: string, description: string, image: string) => ({
  name,
  slug,
  description,
  image,
});

const categoriesData = [
  cat("T-Shirts", "t-shirts", "Oversized and boxy fit t-shirts", img("photo-1576566588028-4147f3842f27")),
  cat("Shorts", "shorts", "Premium streetwear shorts", img("photo-1591195853828-11db59a44f6b")),
  cat("Full Sets", "sets", "Complete outfit sets", img("photo-1621072156002-e2fccdc0b176")),
  cat("Accessories", "accessories", "Caps, bags, and accessories", img("photo-1556306535-0f09a537f0a3")),
];

const productData = [
  // SUMMER 2026 Collection
  {
    name: "Caba Product BOXY T SHIRT",
    slug: "glitch-boxy-t-shirt",
    description: "Oversized boxy fit t-shirt from the Summer 2026 collection. Premium cotton with clean aesthetics.",
    price: 440000,
    oldPrice: null,
    image: img("photo-1576566588028-4147f3842f27"),
    category: "t-shirts",
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
    description: "Complete outfit set including oversized t-shirt and premium shorts. Summer 2026 collection.",
    price: 780000,
    oldPrice: null,
    image: img("photo-1621072156002-e2fccdc0b176"),
    category: "sets",
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
    description: "Sleeveless muscle tee with Caba Product branding. Perfect for summer vibes.",
    price: 350000,
    oldPrice: null,
    image: img("photo-1583743814966-8936f5b7be1a"),
    category: "t-shirts",
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
    description: "Premium black cargo shorts with multiple pockets. Streetwear essential.",
    price: 450000,
    oldPrice: null,
    image: img("photo-1591195853828-11db59a44f6b"),
    category: "shorts",
    brand: "SUMMER 2026",
    stock: 20,
    rating: 47,
    reviewsCount: 52,
    featured: 0,
    isNew: 1,
    discount: 0,
  },

  // DROP 2025 Collection
  {
    name: "Caba Product ARISE BLACK",
    slug: "glitch-arise-black",
    description: "Arise collection black tee. Bold statement piece from Drop 2025.",
    price: 890000,
    oldPrice: null,
    image: img("photo-1618354691373-d851c5c3a990"),
    category: "t-shirts",
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
    description: "Arise collection white tee. Clean design with premium fabric from Drop 2025.",
    price: 890000,
    oldPrice: null,
    image: img("photo-1521572163474-6864f9cf17ab"),
    category: "t-shirts",
    brand: "DROP 2025",
    stock: 0,
    rating: 48,
    reviewsCount: 95,
    featured: 0,
    isNew: 0,
    discount: 0,
  },

  // DROP 2024 Collection
  {
    name: "Caba Product BOXY FIT T SHIRT BLACK",
    slug: "glitch-boxy-fit-tshirt-black",
    description: "Original boxy fit tee in black. Classic Caba Product design from Drop 2024.",
    price: 290000,
    oldPrice: null,
    image: img("photo-1503342217505-b0a15ec3261c"),
    category: "t-shirts",
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
    description: "Original boxy fit tee in white. Clean Caba Product branding from Drop 2024.",
    price: 290000,
    oldPrice: null,
    image: img("photo-1622470953794-aa9c70b0fb9d"),
    category: "t-shirts",
    brand: "DROP 2024",
    stock: 0,
    rating: 46,
    reviewsCount: 143,
    featured: 0,
    isNew: 0,
    discount: 0,
  },
];

export async function seedDatabase() {
  // Skip if already seeded
  const existing = await db.select().from(categories).limit(1);
  if (existing.length > 0) return;

  // Insert categories and capture id map
  const catMap = new Map<string, number>();
  for (const c of categoriesData) {
    const [inserted] = await db
      .insert(categories)
      .values({
        name: c.name,
        slug: c.slug,
        description: c.description,
        image: c.image,
      })
      .returning();
    if (inserted) catMap.set(c.slug, inserted.id);
  }

  // Insert products
  for (const p of productData) {
    const categoryId = catMap.get(p.category) ?? null;
    await db.insert(products).values({
      name: p.name,
      slug: p.slug,
      description: p.description,
      price: p.price,
      oldPrice: p.oldPrice,
      image: p.image,
      images: [p.image],
      categoryId,
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
