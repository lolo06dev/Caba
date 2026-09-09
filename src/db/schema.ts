import {
  pgTable,
  serial,
  text,
  varchar,
  integer,
  timestamp,
  pgEnum,
  jsonb,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// =====================
// Enums
// =====================
export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
]);

// =====================
// Categories
// =====================
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  slug: varchar("slug", { length: 120 }).notNull().unique(),
  description: text("description"),
  image: text("image"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// =====================
// Products
// =====================
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  slug: varchar("slug", { length: 200 }).notNull().unique(),
  description: text("description"),
  price: integer("price").notNull(), // in cents/piasters
  oldPrice: integer("old_price"),
  image: text("image").notNull(),
  images: jsonb("images").$type<string[]>().default([]),
  categoryId: integer("category_id").references(() => categories.id, {
    onDelete: "set null",
  }),
  brand: varchar("brand", { length: 120 }),
  stock: integer("stock").notNull().default(0),
  rating: integer("rating").notNull().default(0), // 0..50 (x10 for half stars)
  reviewsCount: integer("reviews_count").notNull().default(0),
  featured: integer("featured").notNull().default(0), // 0/1
  isNew: integer("is_new").notNull().default(0),
  discount: integer("discount").notNull().default(0), // percentage
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// =====================
// Orders
// =====================
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  customerName: varchar("customer_name", { length: 200 }).notNull(),
  customerPhone: varchar("customer_phone", { length: 40 }).notNull(),
  customerEmail: varchar("customer_email", { length: 200 }),
  customerAddress: text("customer_address").notNull(),
  customerCity: varchar("customer_city", { length: 120 }).notNull(),
  customerCommune: varchar("customer_commune", { length: 120 }),
  notes: text("notes"),
  status: orderStatusEnum("status").notNull().default("pending"),
  // Payment: "cod" (cash on delivery) or "chargily" (online card payment)
  paymentMethod: varchar("payment_method", { length: 20 }).notNull().default("cod"),
  // Payment status: "unpaid" | "paid" | "failed" (updated by Chargily webhook)
  paymentStatus: varchar("payment_status", { length: 20 }).notNull().default("unpaid"),
  chargilyCheckoutId: varchar("chargily_checkout_id", { length: 120 }),
  subtotal: integer("subtotal").notNull(),
  shipping: integer("shipping").notNull(),
  total: integer("total").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// =====================
// Order Items
// =====================
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: integer("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "set null" }),
  productName: varchar("product_name", { length: 200 }).notNull(),
  productImage: text("product_image"),
  price: integer("price").notNull(),
  quantity: integer("quantity").notNull(),
});

// =====================
// Cart (simple persistent demo cart table)
// =====================
export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  sessionId: varchar("session_id", { length: 200 }).notNull(),
  productId: integer("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  quantity: integer("quantity").notNull().default(1),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Re-export sql for convenience
export { sql };
