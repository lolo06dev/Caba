"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteProduct, updateProduct } from "../actions";
import { calcDiscount, formatPrice } from "@/lib/types";

export type AdminProduct = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  oldPrice: number | null;
  image: string;
  images: string[];
  categoryId: number | null;
  categoryName: string | null;
  brand: string | null;
  stock: number;
  featured: number;
  isNew: number;
  discount: number;
};

export type AdminCategory = {
  id: number;
  name: string;
  slug: string;
};

type Banner = { type: "success" | "error"; text: string } | null;

const inputStyle =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200";

function Badges({ product }: { product: AdminProduct }) {
  const discount =
    product.discount > 0
      ? product.discount
      : calcDiscount(product.oldPrice, product.price);

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {product.featured === 1 && (
        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-700">
          ★ Featured
        </span>
      )}
      {product.isNew === 1 && (
        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
          NEW
        </span>
      )}
      {discount > 0 && (
        <span className="rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-bold text-red-600">
          -{discount}%
        </span>
      )}
      {product.stock === 0 && (
        <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-bold text-slate-600">
          SOLD OUT
        </span>
      )}
    </div>
  );
}

function Price({ product }: { product: AdminProduct }) {
  return (
    <div className="whitespace-nowrap">
      <span className="font-bold text-slate-900">{formatPrice(product.price)}</span>
      {product.oldPrice && product.oldPrice > product.price && (
        <span className="ml-2 text-sm text-slate-400 line-through">
          {formatPrice(product.oldPrice)}
        </span>
      )}
    </div>
  );
}

function ProductImage({ product }: { product: AdminProduct }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={product.image}
      alt={product.name}
      className="h-14 w-14 flex-shrink-0 rounded-lg border border-slate-200 object-cover"
    />
  );
}

export default function ProductsManager({
  products,
  categories,
}: {
  products: AdminProduct[];
  categories: AdminCategory[];
}) {
  const router = useRouter();

  const [banner, setBanner] = useState<Banner>(null);

  // Edit modal state
  const [editing, setEditing] = useState<AdminProduct | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [previews, setPreviews] = useState<string[]>([]);

  // Delete dialog state
  const [deleting, setDeleting] = useState<AdminProduct | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  function openEdit(product: AdminProduct) {
    setEditing(product);
    setFormError("");
    setPreviews([]);
  }

  function closeEdit() {
    setEditing(null);
    setFormError("");
    setPreviews([]);
  }

  function openDelete(product: AdminProduct) {
    setDeleting(product);
    setDeleteError("");
  }

  function closeDelete() {
    setDeleting(null);
    setDeleteError("");
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    setPreviews(files.map((file) => URL.createObjectURL(file)));
  }

  async function handleUpdate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;

    setSaving(true);
    setFormError("");

    const formData = new FormData(event.currentTarget);

    try {
      const result = await updateProduct(formData);
      if (result.success) {
        closeEdit();
        setBanner({ type: "success", text: "Product updated successfully!" });
        router.refresh();
      } else {
        setFormError(result.error);
      }
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Failed to update the product"
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleting) return;

    setDeleteBusy(true);
    setDeleteError("");

    try {
      const result = await deleteProduct(deleting.id);
      if (result.success) {
        closeDelete();
        setBanner({ type: "success", text: "Product deleted successfully!" });
        router.refresh();
      } else {
        // Friendly message (e.g. product linked to past orders) — keep the
        // dialog open so the suggestion can be acted on.
        setDeleteError(result.error);
      }
    } catch (error) {
      setDeleteError(
        error instanceof Error ? error.message : "Failed to delete the product"
      );
    } finally {
      setDeleteBusy(false);
    }
  }

  // Quick action offered when a product can't be deleted because it is linked
  // to past orders: hide it by setting its stock to 0 instead.
  async function handleSetStockZero() {
    if (!deleting) return;

    setDeleteBusy(true);
    setDeleteError("");

    const formData = new FormData();
    formData.set("productId", String(deleting.id));
    formData.set("name", deleting.name);
    formData.set("price", String(deleting.price));
    formData.set("oldPrice", deleting.oldPrice ? String(deleting.oldPrice) : "");
    formData.set("stock", "0");
    formData.set("categoryId", String(deleting.categoryId ?? ""));
    formData.set("brand", deleting.brand ?? "");
    formData.set("discount", String(deleting.discount));
    formData.set("description", deleting.description ?? "");
    if (deleting.featured === 1) formData.set("featured", "on");
    if (deleting.isNew === 1) formData.set("isNew", "on");

    try {
      const result = await updateProduct(formData);
      if (result.success) {
        const name = deleting.name;
        closeDelete();
        setBanner({
          type: "success",
          text: `"${name}" is now out of stock (stock set to 0).`,
        });
        router.refresh();
      } else {
        setDeleteError(result.error);
      }
    } catch (error) {
      setDeleteError(
        error instanceof Error ? error.message : "Failed to update the product"
      );
    } finally {
      setDeleteBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold">Manage products</h1>
          <p className="mt-1 text-sm text-slate-500">
            {products.length} product{products.length === 1 ? "" : "s"} in the store
          </p>
        </div>
        <Link
          href="/admin"
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-900 hover:text-slate-900"
        >
          ← Back to dashboard
        </Link>
      </div>

      {/* Banners */}
      {banner && (
        <div
          className={`mb-6 flex items-start justify-between gap-4 rounded-xl px-4 py-3 text-sm ${
            banner.type === "success"
              ? "bg-emerald-50 text-emerald-800"
              : "bg-red-50 text-red-800"
          }`}
        >
          <span>{banner.text}</span>
          <button
            type="button"
            onClick={() => setBanner(null)}
            className="font-bold"
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      )}

      {products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-500">
          No products yet. Add one from the{" "}
          <Link href="/admin" className="font-semibold text-amber-600 underline">
            dashboard
          </Link>
          .
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-2xl border border-slate-200 md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Brand</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3">Badges</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <ProductImage product={product} />
                        <div className="min-w-0">
                          <div className="max-w-[220px] truncate font-semibold text-slate-900">
                            {product.name}
                          </div>
                          <div className="max-w-[220px] truncate text-xs text-slate-400">
                            /{product.slug}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {product.categoryName ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {product.brand ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Price product={product} />
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`font-semibold ${
                          product.stock === 0 ? "text-red-600" : "text-slate-700"
                        }`}
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badges product={product} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(product)}
                          className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-700 transition-colors hover:border-slate-900 hover:bg-slate-900 hover:text-white"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => openDelete(product)}
                          className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 transition-colors hover:border-red-600 hover:bg-red-600 hover:text-white"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="flex flex-col gap-3 md:hidden">
            {products.map((product) => (
              <div
                key={product.id}
                className="rounded-2xl border border-slate-200 bg-white p-4"
              >
                <div className="flex items-start gap-3">
                  <ProductImage product={product} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold text-slate-900">
                      {product.name}
                    </div>
                    <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
                      <span>{product.categoryName ?? "—"}</span>
                      {product.brand && <span>· {product.brand}</span>}
                    </div>
                    <div className="mt-2">
                      <Price product={product} />
                    </div>
                    <div className="mt-1 text-xs">
                      Stock:{" "}
                      <span
                        className={
                          product.stock === 0
                            ? "font-bold text-red-600"
                            : "font-semibold text-slate-700"
                        }
                      >
                        {product.stock}
                      </span>
                    </div>
                    <div className="mt-2">
                      <Badges product={product} />
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => openEdit(product)}
                    className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700 transition-colors hover:border-slate-900 hover:bg-slate-900 hover:text-white"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => openDelete(product)}
                    className="flex-1 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-600 transition-colors hover:border-red-600 hover:bg-red-600 hover:text-white"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Edit modal */}
      {editing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-fade-in"
          onClick={closeEdit}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-extrabold">Edit product</h2>
                <p className="mt-0.5 text-xs text-slate-400">
                  Link stays the same: /product/{editing.slug}
                </p>
              </div>
              <button
                type="button"
                onClick={closeEdit}
                className="rounded-lg px-2 py-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">
                {formError}
              </div>
            )}

            <form onSubmit={handleUpdate} className="flex flex-col gap-4">
              <input type="hidden" name="productId" value={editing.id} />

              <div>
                <label className="mb-1 block text-sm font-semibold">
                  Product name:
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  defaultValue={editing.name}
                  className={inputStyle}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-semibold">
                    Price (in centimes):
                  </label>
                  <input
                    type="number"
                    name="price"
                    required
                    min="0"
                    step="1"
                    defaultValue={editing.price}
                    className={inputStyle}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold">
                    Old price (in centimes):
                  </label>
                  <input
                    type="number"
                    name="oldPrice"
                    min="0"
                    step="1"
                    defaultValue={editing.oldPrice ?? ""}
                    placeholder="Optional — shown struck through"
                    className={inputStyle}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-semibold">
                    Quantity (stock):
                  </label>
                  <input
                    type="number"
                    name="stock"
                    required
                    min="0"
                    step="1"
                    defaultValue={editing.stock}
                    className={inputStyle}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold">
                    Discount (%):
                  </label>
                  <input
                    type="number"
                    name="discount"
                    min="0"
                    max="100"
                    step="1"
                    defaultValue={editing.discount}
                    className={inputStyle}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-semibold">
                    Category:
                  </label>
                  <select
                    name="categoryId"
                    required
                    defaultValue={editing.categoryId ?? ""}
                    className={inputStyle}
                  >
                    <option value="" disabled>
                      Choose a category...
                    </option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold">
                    Brand:
                  </label>
                  <input
                    type="text"
                    name="brand"
                    defaultValue={editing.brand ?? ""}
                    placeholder="e.g. SUMMER 2026"
                    className={inputStyle}
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold">
                  Description:
                </label>
                <textarea
                  name="description"
                  rows={4}
                  defaultValue={editing.description ?? ""}
                  className={inputStyle}
                />
              </div>

              <div className="flex flex-wrap gap-6 rounded-xl bg-slate-50 px-4 py-3">
                <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold">
                  <input
                    type="checkbox"
                    name="featured"
                    defaultChecked={editing.featured === 1}
                    className="h-4 w-4 accent-amber-500"
                  />
                  ★ Featured
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold">
                  <input
                    type="checkbox"
                    name="isNew"
                    defaultChecked={editing.isNew === 1}
                    className="h-4 w-4 accent-emerald-500"
                  />
                  New arrival
                </label>
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold">
                  Replace images:
                </label>
                {editing.images.length > 0 && (
                  <div className="mb-2 flex flex-wrap gap-2">
                    {editing.images.map((src, index) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={src + index}
                        src={src}
                        alt={`${editing.name} ${index + 1}`}
                        className="h-16 w-16 rounded-lg border border-slate-200 object-cover"
                      />
                    ))}
                  </div>
                )}
                <input
                  type="file"
                  name="images"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-slate-900 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-white"
                />
                <small className="mt-1 block text-xs text-slate-500">
                  Optional — leave empty to keep the current images. If you
                  upload new ones (up to 8, JPG/PNG, 5 MB max each), the old
                  images are deleted from Supabase Storage. The first image
                  becomes the main image.
                </small>
                {previews.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {previews.map((preview, index) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={preview}
                        src={preview}
                        alt={`New image preview ${index + 1}`}
                        className="h-16 w-16 rounded-lg border-2 border-amber-500 object-cover"
                      />
                    ))}
                    <span className="self-center text-xs font-semibold text-red-600">
                      Old images will be replaced
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeEdit}
                  className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-bold text-slate-600 transition-colors hover:border-slate-900 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation dialog */}
      {deleting && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-fade-in"
          onClick={deleteBusy ? undefined : closeDelete}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 className="text-lg font-extrabold">Delete product?</h2>

            {!deleteError && (
              <>
                <p className="mt-2 text-sm text-slate-600">
                  Are you sure you want to delete{" "}
                  <span className="font-bold text-slate-900">“{deleting.name}”</span>?
                  This permanently removes the product and its images from the
                  store.
                </p>
                <div className="mt-5 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={closeDelete}
                    disabled={deleteBusy}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold text-slate-600 transition-colors hover:border-slate-900 hover:text-slate-900 disabled:opacity-60"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleteBusy}
                    className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {deleteBusy ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </>
            )}

            {deleteError && (
              <>
                <div className="mt-3 rounded-xl bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-900">
                  {deleteError}
                </div>
                <div className="mt-5 flex flex-wrap justify-end gap-3">
                  <button
                    type="button"
                    onClick={closeDelete}
                    disabled={deleteBusy}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold text-slate-600 transition-colors hover:border-slate-900 hover:text-slate-900 disabled:opacity-60"
                  >
                    Keep it
                  </button>
                  <button
                    type="button"
                    onClick={handleSetStockZero}
                    disabled={deleteBusy}
                    className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {deleteBusy ? "Updating..." : "Set stock to 0 instead"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
