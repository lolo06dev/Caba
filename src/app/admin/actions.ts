"use server";

import { db } from "@/db";
import { products } from "@/db/schema";
import { revalidatePath } from "next/cache";

export async function addProduct(formData: FormData) {
  const name = formData.get("name")?.toString();
  const description = formData.get("description")?.toString();
  const price = Number(formData.get("price"));
  const stock = Number(formData.get("stock"));
  const image = formData.get("image")?.toString();

  if (!name || isNaN(price) || isNaN(stock) || !image) {
    throw new Error("Missing required fields");
  }

  // Generate a simple slug
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now();

  await db.insert(products).values({
    name,
    slug,
    description: description || "",
    price,
    stock,
    image,
    images: [image],
  });

  revalidatePath("/");
  revalidatePath("/products");
}
