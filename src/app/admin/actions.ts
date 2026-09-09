"use server";

import { db } from "@/db";
import { products, categories, orderItems } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SUPABASE_URL } from "@/lib/supabase/env";

const BUCKET = "product-images";
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_IMAGES = 8;

export type AddProductResult = { success: true } | { success: false; error: string };
export type UpdateProductResult = { success: true } | { success: false; error: string };
export type DeleteProductResult = { success: true } | { success: false; error: string };

/**
 * Returns the signed-in Supabase user, or null when the session is missing.
 * Shared by every admin server action (defense in depth on top of the
 * /admin middleware).
 */
async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user: user ?? null };
}

/**
 * Extracts the storage path of an image that lives in our public
 * "product-images" bucket (e.g. "<userId>/<uuid>.jpg") from its public URL.
 * Returns null for anything else (seed/demo images hosted on Unsplash, other
 * buckets, malformed URLs…) so those are never sent to Storage .remove().
 */
function storagePathFromUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.origin !== new URL(SUPABASE_URL).origin) return null;

    const marker = `/storage/v1/object/public/${BUCKET}/`;
    const index = parsed.pathname.indexOf(marker);
    if (index === -1) return null;

    const path = decodeURIComponent(parsed.pathname.slice(index + marker.length));
    return path.length > 0 ? path : null;
  } catch {
    return null;
  }
}

/**
 * Best-effort cleanup: removes the given image URLs from Supabase Storage.
 * External images (Unsplash, etc.) are skipped; failures are only logged so a
 * storage hiccup never blocks a product update/delete.
 */
async function deleteStoredImages(
  supabase: Awaited<ReturnType<typeof createClient>>,
  urls: (string | null | undefined)[]
): Promise<void> {
  const paths = urls
    .filter((url): url is string => typeof url === "string" && url.length > 0)
    .map((url) => storagePathFromUrl(url))
    .filter((path): path is string => path !== null);

  if (paths.length === 0) return;

  const { error } = await supabase.storage.from(BUCKET).remove(paths);
  if (error) {
    console.warn("Failed to remove old product images from storage", error);
  }
}

function validateImageFiles(files: File[]): string | null {
  if (files.length > MAX_IMAGES) {
    return `You can upload up to ${MAX_IMAGES} images`;
  }
  for (const file of files) {
    if (!file.type.startsWith("image/")) {
      return `"${file.name}" is not an image`;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      return `"${file.name}" is larger than 5 MB`;
    }
  }
  return null;
}

async function uploadProductImages(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  files: File[]
): Promise<{ urls: string[] } | { error: string }> {
  const urls: string[] = [];

  for (const file of files) {
    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${userId}/${Date.now()}-${crypto.randomUUID()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { contentType: file.type, upsert: false });

    if (uploadError) {
      // Clean up anything we already uploaded in this batch.
      await deleteStoredImages(supabase, urls);
      console.error("Product image upload failed", uploadError);
      return { error: `Failed to upload "${file.name}": ${uploadError.message}` };
    }

    urls.push(supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl);
  }

  return { urls };
}

export async function addProduct(formData: FormData): Promise<AddProductResult> {
  const { supabase, user } = await requireUser();

  if (!user) {
    return { success: false, error: "You must be signed in to add products" };
  }

  const name = formData.get("name")?.toString();
  const description = formData.get("description")?.toString();
  const price = Number(formData.get("price"));
  const stock = Number(formData.get("stock"));
  const categoryId = Number(formData.get("categoryId"));
  const files = formData
    .getAll("images")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);

  if (!name || isNaN(price) || isNaN(stock) || files.length === 0) {
    return { success: false, error: "Missing required fields" };
  }

  // The product must be added to one of the existing categories
  // (Clothes / Shoes / Electronics).
  if (!Number.isInteger(categoryId) || categoryId <= 0) {
    return { success: false, error: "Please choose a category for the product" };
  }
  const [category] = await db
    .select()
    .from(categories)
    .where(eq(categories.id, categoryId))
    .limit(1);
  if (!category) {
    return { success: false, error: "The selected category does not exist" };
  }

  const fileError = validateImageFiles(files);
  if (fileError) {
    return { success: false, error: fileError };
  }

  const uploaded = await uploadProductImages(supabase, user.id, files);
  if ("error" in uploaded) {
    return { success: false, error: uploaded.error };
  }
  const urls = uploaded.urls;

  // Generate a simple slug
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now();

  try {
    await db.insert(products).values({
      name,
      slug,
      description: description || "",
      price,
      stock,
      image: urls[0],
      images: urls,
      categoryId: category.id,
    });
  } catch (error) {
    console.error("Product insert failed", error);
    const message = error instanceof Error ? error.message : "unknown error";
    return { success: false, error: `Failed to save the product: ${message}` };
  }

  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath(`/category/${category.slug}`);

  return { success: true };
}

export async function updateProduct(formData: FormData): Promise<UpdateProductResult> {
  const { supabase, user } = await requireUser();

  if (!user) {
    return { success: false, error: "You must be signed in to edit products" };
  }

  const productId = Number(formData.get("productId"));
  if (!Number.isInteger(productId) || productId <= 0) {
    return { success: false, error: "Invalid product" };
  }

  const [existing] = await db
    .select()
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);
  if (!existing) {
    return { success: false, error: "Product not found" };
  }

  const name = formData.get("name")?.toString().trim();
  const description = formData.get("description")?.toString();
  const price = Number(formData.get("price"));
  const stock = Number(formData.get("stock"));
  const categoryId = Number(formData.get("categoryId"));
  const brand = formData.get("brand")?.toString().trim() || null;
  const discount = Number(formData.get("discount") ?? 0);
  const oldPriceRaw = formData.get("oldPrice")?.toString().trim();
  const oldPrice = oldPriceRaw ? Number(oldPriceRaw) : null;
  const featured = formData.get("featured") === "on" ? 1 : 0;
  const isNew = formData.get("isNew") === "on" ? 1 : 0;
  const files = formData
    .getAll("images")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);

  if (!name || isNaN(price) || isNaN(stock)) {
    return { success: false, error: "Name, price and stock are required" };
  }
  if (!Number.isInteger(price) || price < 0) {
    return { success: false, error: "Price must be a positive whole number (in centimes)" };
  }
  if (!Number.isInteger(stock) || stock < 0) {
    return { success: false, error: "Stock must be a positive whole number" };
  }
  if (oldPrice !== null && (isNaN(oldPrice) || oldPrice < 0)) {
    return { success: false, error: "Old price must be a positive number" };
  }
  if (!Number.isInteger(categoryId) || categoryId <= 0) {
    return { success: false, error: "Please choose a category for the product" };
  }
  if (!Number.isInteger(discount) || discount < 0 || discount > 100) {
    return { success: false, error: "Discount must be a whole number between 0 and 100" };
  }

  const [category] = await db
    .select()
    .from(categories)
    .where(eq(categories.id, categoryId))
    .limit(1);
  if (!category) {
    return { success: false, error: "The selected category does not exist" };
  }

  // The slug intentionally stays untouched — it is the product's public URL
  // and may already be shared or indexed.

  let image = existing.image;
  let images = existing.images ?? [];
  let replacedImages: string[] | null = null;

  if (files.length > 0) {
    const fileError = validateImageFiles(files);
    if (fileError) {
      return { success: false, error: fileError };
    }

    const uploaded = await uploadProductImages(supabase, user.id, files);
    if ("error" in uploaded) {
      return { success: false, error: uploaded.error };
    }

    image = uploaded.urls[0];
    images = uploaded.urls;
    // Only collected here — the old images are removed from Supabase Storage
    // once the database update has actually succeeded.
    replacedImages = [existing.image, ...(existing.images ?? [])];
  }

  try {
    await db
      .update(products)
      .set({
        name,
        description: description ?? "",
        price,
        oldPrice,
        stock,
        categoryId: category.id,
        brand,
        discount,
        featured,
        isNew,
        image,
        images,
      })
      .where(eq(products.id, productId));
  } catch (error) {
    // The DB still points at the old images, so remove the freshly uploaded
    // ones instead of leaving orphans behind.
    if (replacedImages) {
      await deleteStoredImages(supabase, images);
    }
    console.error("Product update failed", error);
    const message = error instanceof Error ? error.message : "unknown error";
    return { success: false, error: `Failed to update the product: ${message}` };
  }

  // Now that the product is safely pointing at the new images, clean up the
  // replaced ones (external/seed images are skipped automatically).
  if (replacedImages) {
    await deleteStoredImages(supabase, replacedImages);
  }

  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/admin/products");
  revalidatePath(`/product/${existing.slug}`);
  if (existing.categoryId && existing.categoryId !== category.id) {
    const [oldCategory] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, existing.categoryId))
      .limit(1);
    if (oldCategory) revalidatePath(`/category/${oldCategory.slug}`);
  }
  revalidatePath(`/category/${category.slug}`);

  return { success: true };
}

export async function deleteProduct(productId: number): Promise<DeleteProductResult> {
  const { supabase, user } = await requireUser();

  if (!user) {
    return { success: false, error: "You must be signed in to delete products" };
  }

  if (!Number.isInteger(productId) || productId <= 0) {
    return { success: false, error: "Invalid product" };
  }

  const [existing] = await db
    .select()
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);
  if (!existing) {
    return { success: false, error: "Product not found" };
  }

  // Orders keep a historical snapshot (name, image, price…) but stay linked
  // to the product. Deleting it would break order history, so we refuse with
  // a friendly message and suggest hiding it instead.
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(orderItems)
    .where(eq(orderItems.productId, productId));

  if (count > 0) {
    return {
      success: false,
      error: `"${existing.name}" is linked to ${count} past order${
        count === 1 ? "" : "s"
      }, so it can't be deleted without breaking your order history. Tip: set its stock to 0 instead — it will show as "Sold out" and customers won't be able to order it.`,
    };
  }

  try {
    // Cart items are removed automatically (ON DELETE CASCADE).
    await db.delete(products).where(eq(products.id, productId));
  } catch (error) {
    console.error("Product delete failed", error);
    const message = error instanceof Error ? error.message : "unknown error";
    return { success: false, error: `Failed to delete the product: ${message}` };
  }

  // Clean up the storage images (best-effort; external URLs are skipped).
  await deleteStoredImages(supabase, [existing.image, ...(existing.images ?? [])]);

  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/admin/products");
  revalidatePath(`/product/${existing.slug}`);
  if (existing.categoryId) {
    const [category] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, existing.categoryId))
      .limit(1);
    if (category) revalidatePath(`/category/${category.slug}`);
  }

  return { success: true };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
