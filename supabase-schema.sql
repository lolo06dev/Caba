-- Caba store schema for Supabase (PostgreSQL)
-- Run in Supabase Dashboard > SQL Editor.

-- Enums
DO $$ BEGIN
  CREATE TYPE "public"."order_status" AS ENUM ('pending', 'processing', 'shipped', 'delivered', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Categories
CREATE TABLE IF NOT EXISTS "categories" (
  "id" serial PRIMARY KEY NOT NULL,
  "name" varchar(120) NOT NULL,
  "slug" varchar(120) NOT NULL,
  "description" text,
  "image" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "categories_slug_unique" UNIQUE ("slug")
);

-- Products
CREATE TABLE IF NOT EXISTS "products" (
  "id" serial PRIMARY KEY NOT NULL,
  "name" varchar(200) NOT NULL,
  "slug" varchar(200) NOT NULL,
  "description" text,
  "price" integer NOT NULL,
  "old_price" integer,
  "image" text NOT NULL,
  "images" jsonb DEFAULT '[]'::jsonb,
  "category_id" integer REFERENCES "categories"("id") ON DELETE SET NULL,
  "brand" varchar(120),
  "stock" integer DEFAULT 0 NOT NULL,
  "rating" integer DEFAULT 0 NOT NULL,
  "reviews_count" integer DEFAULT 0 NOT NULL,
  "featured" integer DEFAULT 0 NOT NULL,
  "is_new" integer DEFAULT 0 NOT NULL,
  "discount" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "products_slug_unique" UNIQUE ("slug")
);

-- Orders
CREATE TABLE IF NOT EXISTS "orders" (
  "id" serial PRIMARY KEY NOT NULL,
  "customer_name" varchar(200) NOT NULL,
  "customer_phone" varchar(40) NOT NULL,
  "customer_email" varchar(200),
  "customer_address" text NOT NULL,
  "customer_city" varchar(120) NOT NULL,
  "notes" text,
  "status" "order_status" DEFAULT 'pending' NOT NULL,
  "subtotal" integer NOT NULL,
  "shipping" integer NOT NULL,
  "total" integer NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

-- Order items
CREATE TABLE IF NOT EXISTS "order_items" (
  "id" serial PRIMARY KEY NOT NULL,
  "order_id" integer NOT NULL REFERENCES "orders"("id") ON DELETE CASCADE,
  "product_id" integer NOT NULL REFERENCES "products"("id") ON DELETE RESTRICT,
  "product_name" varchar(200) NOT NULL,
  "product_image" text,
  "price" integer NOT NULL,
  "quantity" integer NOT NULL
);

-- Cart items
CREATE TABLE IF NOT EXISTS "cart_items" (
  "id" serial PRIMARY KEY NOT NULL,
  "session_id" varchar(200) NOT NULL,
  "product_id" integer NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
  "quantity" integer DEFAULT 1 NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS "products_category_id_idx" ON "products" ("category_id");
CREATE INDEX IF NOT EXISTS "order_items_order_id_idx" ON "order_items" ("order_id");
CREATE INDEX IF NOT EXISTS "cart_items_session_id_idx" ON "cart_items" ("session_id");

-- =====================================================================
-- Storage bucket for product images uploaded from the admin dashboard
-- =====================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

DO $$ BEGIN
  CREATE POLICY "Public read product images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'product-images');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Authenticated upload product images"
    ON storage.objects FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'product-images');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Authenticated update product images"
    ON storage.objects FOR UPDATE TO authenticated
    USING (bucket_id = 'product-images');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Authenticated delete product images"
    ON storage.objects FOR DELETE TO authenticated
    USING (bucket_id = 'product-images');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
