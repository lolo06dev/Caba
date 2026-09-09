import { db } from "@/db";
import { categories, products, orderItems, orders } from "@/db/schema";
import { eq, asc, desc, and, like, or, sql } from "drizzle-orm";
import { seedDatabase } from "./seed";

let seedPromise: Promise<void> | null = null;
function ensureSeeded() {
  if (!seedPromise) {
    seedPromise = seedDatabase().catch((e) => {
      console.error("Seed error", e);
    });
  }
  return seedPromise;
}

export async function getCategories() {
  await ensureSeeded();
  return db.select().from(categories).orderBy(asc(categories.name));
}

export async function getCategoryBySlug(slug: string) {
  await ensureSeeded();
  const rows = await db
    .select()
    .from(categories)
    .where(eq(categories.slug, slug))
    .limit(1);
  return rows[0] ?? null;
}

export async function getProducts(opts?: {
  categorySlug?: string;
  search?: string;
  featured?: boolean;
  newOnly?: boolean;
  limit?: number;
}) {
  await ensureSeeded();
  const conds = [] as any[];
  if (opts?.categorySlug) {
    const cat = await getCategoryBySlug(opts.categorySlug);
    if (cat) conds.push(eq(products.categoryId, cat.id));
    else conds.push(sql`1=0`);
  }
  if (opts?.search) {
    const term = `%${opts.search}%`;
    conds.push(or(like(products.name, term), like(products.description, term)));
  }
  if (opts?.featured) conds.push(eq(products.featured, 1));
  if (opts?.newOnly) conds.push(eq(products.isNew, 1));

  let q = db.select().from(products).$dynamic();
  if (conds.length) q = q.where(and(...conds));
  q = q.orderBy(desc(products.createdAt));
  if (opts?.limit) q = q.limit(opts.limit);
  return q;
}

export async function getProductBySlug(slug: string) {
  await ensureSeeded();
  const rows = await db
    .select()
    .from(products)
    .where(eq(products.slug, slug))
    .limit(1);
  return rows[0] ?? null;
}

export async function getRelatedProducts(categoryId: number, excludeId: number) {
  await ensureSeeded();
  return db
    .select()
    .from(products)
    .where(and(eq(products.categoryId, categoryId)))
    .orderBy(desc(products.rating))
    .limit(4);
}

export async function createOrder(input: {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerAddress: string;
  customerCity: string;
  customerCommune?: string;
  notes?: string;
  paymentMethod?: "cod" | "chargily";
  items: { productId: number; name: string; image: string; price: number; quantity: number; slug: string }[];
}) {
  await ensureSeeded();
  const subtotal = input.items.reduce(
    (s, i) => s + i.price * i.quantity,
    0
  );
  const shipping = subtotal > 50000 ? 0 : 5000;
  const total = subtotal + shipping;

  const [order] = await db
    .insert(orders)
    .values({
      customerName: input.customerName,
      customerPhone: input.customerPhone,
      customerEmail: input.customerEmail ?? null,
      customerAddress: input.customerAddress,
      customerCity: input.customerCity,
      customerCommune: input.customerCommune ?? null,
      notes: input.notes ?? null,
      paymentMethod: input.paymentMethod ?? "cod",
      paymentStatus: "unpaid",
      subtotal,
      shipping,
      total,
      status: "pending",
    })
    .returning();

  if (!order) throw new Error("Failed to create order");

  for (const item of input.items) {
    await db.insert(orderItems).values({
      orderId: order.id,
      productId: item.productId,
      productName: item.name,
      productImage: item.image,
      price: item.price,
      quantity: item.quantity,
    });
  }

  return order;
}

export async function setOrderChargilyCheckout(
  orderId: number,
  checkoutId: string
) {
  await db
    .update(orders)
    .set({ chargilyCheckoutId: checkoutId })
    .where(eq(orders.id, orderId));
}

export async function applyChargilyEvent(input: {
  checkoutId?: string | null;
  orderId?: number | null;
  paymentStatus: "paid" | "failed" | "unpaid";
}): Promise<void> {
  if (input.orderId) {
    await db
      .update(orders)
      .set({ paymentStatus: input.paymentStatus })
      .where(eq(orders.id, input.orderId));
    return;
  }
  if (input.checkoutId) {
    await db
      .update(orders)
      .set({ paymentStatus: input.paymentStatus })
      .where(eq(orders.chargilyCheckoutId, input.checkoutId));
  }
}

export async function getOrderById(id: number) {
  const rows = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function getOrderItems(orderId: number) {
  return db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
}
