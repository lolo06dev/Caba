import { NextResponse } from "next/server";
import { getProducts } from "@/lib/data";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const category = url.searchParams.get("category") ?? undefined;
  const search = url.searchParams.get("search") ?? undefined;
  const featured = url.searchParams.get("featured") === "true";
  const newOnly = url.searchParams.get("new") === "true";
  const limit = url.searchParams.get("limit")
    ? Number(url.searchParams.get("limit"))
    : undefined;
  const products = await getProducts({ categorySlug: category, search, featured, newOnly, limit });
  return NextResponse.json({ products });
}
