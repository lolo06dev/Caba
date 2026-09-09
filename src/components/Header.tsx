"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/lib/cart-store";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const cartItems = useCart((s) => s.items);
  const cartCount = cartItems.reduce((s, i) => s + i.quantity, 0);
  const toggleCart = useCart((s) => s.toggle);

  return (
    <>
      <header className="glitch-header">
        {/* Menu button */}
        <button
          className="menu-btn"
          onClick={() => setMenuOpen(true)}
          aria-label="Menu"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="4" x2="20" y1="6" y2="6" />
            <line x1="4" x2="20" y1="12" y2="12" />
            <line x1="4" x2="20" y1="18" y2="18" />
          </svg>
          <span>MENU</span>
        </button>

        {/* Logo */}
        <Link href="/" className="logo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="Caba Product"
            style={{
              height: "36px",
              width: "auto",
              objectFit: "contain",
              filter: "brightness(0) invert(1)",
            }}
          />
        </Link>

        {/* Cart */}
        <button className="cart-btn" onClick={toggleCart} aria-label="Cart">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="8" cy="21" r="1" />
            <circle cx="19" cy="21" r="1" />
            <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
          </svg>
          {cartCount > 0 && <span className="badge">{cartCount}</span>}
        </button>
      </header>

      {/* Mobile menu overlay */}
      <div
        className={`mobile-menu-overlay ${menuOpen ? "open" : ""}`}
        onClick={() => setMenuOpen(false)}
      />

      {/* Mobile menu drawer */}
      <div className={`mobile-menu ${menuOpen ? "open" : ""}`}>
        <button
          className="close-btn"
          onClick={() => setMenuOpen(false)}
          aria-label="Close menu"
        >
          ×
        </button>

        <nav>
          <Link href="/" onClick={() => setMenuOpen(false)}>
            Home
          </Link>
          <Link href="/products" onClick={() => setMenuOpen(false)}>
            All Products
          </Link>
          <Link href="/category/clothes" onClick={() => setMenuOpen(false)}>
            Clothes
          </Link>
          <Link href="/category/shoes" onClick={() => setMenuOpen(false)}>
            Shoes
          </Link>
          <Link href="/category/electronics" onClick={() => setMenuOpen(false)}>
            Electronics
          </Link>
        </nav>
      </div>
    </>
  );
};

export default Header;
