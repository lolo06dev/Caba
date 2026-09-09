"use server";

import { db } from "@/db";
import { products, categories } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const BUCKET = "product-images";
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_IMAGES = 8;

export type AddProductResult = { success: true } | { success: false; error: string };

export async function addProduct(formData: FormData): Promise<AddProductResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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

  if (files.length > MAX_IMAGES) {
    return { success: false, error: `You can upload up to ${MAX_IMAGES} images` };
  }

  for (const file of files) {
    if (!file.type.startsWith("image/")) {
      return { success: false, error: `"${file.name}" is not an image` };
    }
    if (file.size > MAX_IMAGE_BYTES) {
      return { success: false, error: `"${file.name}" is larger than 5 MB` };
    }
  }

  const urls: string[] = [];

  for (const file of files) {
    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${user.id}/${Date.now()}-${crypto.randomUUID()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { contentType: file.type, upsert: false });

    if (uploadError) {
      console.error("Product image upload failed", uploadError);
      return { success: false, error: `Failed to upload "${file.name}": ${uploadError.message}` };
    }

    urls.push(supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl);
  }

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

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
