"use server";

import { db } from "@/db";
import { products } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const BUCKET = "product-images";
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export async function addProduct(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be signed in to add products");
  }

  const name = formData.get("name")?.toString();
  const description = formData.get("description")?.toString();
  const price = Number(formData.get("price"));
  const stock = Number(formData.get("stock"));
  const file = formData.get("image") as File | null;

  if (!name || isNaN(price) || isNaN(stock) || !file || file.size === 0) {
    throw new Error("Missing required fields");
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("The uploaded file must be an image");
  }

  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("The image must be 5 MB or smaller");
  }

  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${user.id}/${Date.now()}-${crypto.randomUUID()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });

  if (uploadError) {
    throw new Error("Failed to upload the image: " + uploadError.message);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(path);

  // Generate a simple slug
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now();

  await db.insert(products).values({
    name,
    slug,
    description: description || "",
    price,
    stock,
    image: publicUrl,
    images: [publicUrl],
  });

  revalidatePath("/");
  revalidatePath("/products");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
