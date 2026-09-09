"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-store";
import { formatPrice, type Product } from "@/lib/types";

type Props = {
  product: Product;
};

const ProductCard = ({ product }: Props) => {
  const add = useCart((s) => s.add);

  const onAdd = () => {
    add({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
      slug: product.slug,
    });
  };

  const isSoldOut = product.stock === 0;

  // Determine season/collection label from brand field or use category
  const seasonLabel = product.brand || "COLLECTION";

  return (
    <div className="glitch-card">
      <Link
        href={`/product/${product.slug}`}
        className="glitch-card-image block"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.image}
          alt={product.name}
        />
        {isSoldOut && (
          <span className="sold-out-badge">SOLD OUT</span>
        )}
      </Link>

      <button
        onClick={onAdd}
        disabled={isSoldOut}
        className="cart-icon-btn"
        aria-label="Add to cart"
        style={{ position: "absolute", bottom: "auto", top: "auto" }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="8" cy="21" r="1" />
          <circle cx="19" cy="21" r="1" />
          <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
        </svg>
      </button>

      <div className="glitch-card-info">
        <h3>{product.name}</h3>
        <div className="season">{seasonLabel}</div>
        <div className="price">{formatPrice(product.price)}</div>
      </div>
    </div>
  );
};

export default ProductCard;
