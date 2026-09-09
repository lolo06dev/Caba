"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart-store";
import type { Product } from "@/lib/types";

const AddToCartButton = ({ product }: { product: Product }) => {
  const [qty, setQty] = useState(1);
  const add = useCart((s) => s.add);

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="flex items-center bg-slate-100 rounded-xl overflow-hidden">
        <button
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          className="w-11 h-11 hover:bg-slate-200 font-bold text-lg"
          aria-label="إنقاص"
        >
          −
        </button>
        <span className="w-12 text-center font-bold">{qty}</span>
        <button
          onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
          className="w-11 h-11 hover:bg-slate-200 font-bold text-lg"
          aria-label="زيادة"
        >
          +
        </button>
      </div>
      <button
        onClick={() =>
          add({
            productId: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: qty,
            slug: product.slug,
          })
        }
        disabled={product.stock === 0}
        className="btn btn-primary flex-1 text-base"
      >
        {product.stock === 0
          ? "غير متوفر"
          : "🛒 أضف إلى السلة"}
      </button>
    </div>
  );
};

export default AddToCartButton;
