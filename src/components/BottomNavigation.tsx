"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/cart-store";

const HomeIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V10Z" />
  </svg>
);

const StoreIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M4 10v10a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V10" />
    <path d="M3 10h18l-1.5-6h-15L3 10Z" />
    <path d="M8 21v-6h8v6M8 10a2 2 0 0 0 4 0 2 2 0 0 0 4 0 2 2 0 0 0 4 0" />
  </svg>
);

const CartIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="9" cy="20" r="1" />
    <circle cx="18" cy="20" r="1" />
    <path d="M3 4h2l2.1 10.1a2 2 0 0 0 2 1.6h8.7a2 2 0 0 0 1.9-1.4L21 8H6" />
  </svg>
);

const BottomNavigation = () => {
  const pathname = usePathname();
  const cartItems = useCart((state) => state.items);
  const openCart = useCart((state) => state.setOpen);
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const isStorePage =
    pathname.startsWith("/products") ||
    pathname.startsWith("/product/") ||
    pathname.startsWith("/category/");

  return (
    <nav className="bottom-navigation" aria-label="Primary navigation">
      <Link
        href="/"
        className={`bottom-navigation-item ${pathname === "/" ? "is-active" : ""}`}
        aria-current={pathname === "/" ? "page" : undefined}
      >
        <HomeIcon />
        <span>Home</span>
      </Link>

      <Link
        href="/products"
        className={`bottom-navigation-item ${isStorePage ? "is-active" : ""}`}
        aria-current={isStorePage ? "page" : undefined}
      >
        <StoreIcon />
        <span>Store</span>
      </Link>

      <button
        type="button"
        className="bottom-navigation-item bottom-navigation-cart"
        onClick={() => openCart(true)}
        aria-label={cartCount > 0 ? `Cart, ${cartCount} items` : "Cart"}
      >
        <span className="bottom-navigation-icon-wrap">
          <CartIcon />
          {cartCount > 0 && <span className="bottom-navigation-badge">{cartCount}</span>}
        </span>
        <span>Cart</span>
      </button>
    </nav>
  );
};

export default BottomNavigation;
