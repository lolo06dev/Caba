"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useCart } from "@/lib/cart-store";
import { formatPrice } from "@/lib/types";

const CartDrawer = () => {
  const isOpen = useCart((s) => s.isOpen);
  const setOpen = useCart((s) => s.setOpen);
  const items = useCart((s) => s.items);
  const updateQty = useCart((s) => s.updateQty);
  const remove = useCart((s) => s.remove);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const shipping = items.length === 0 ? 0 : subtotal > 50000 ? 0 : 5000;
  const total = subtotal + shipping;

  const fmt = formatPrice;

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 animate-fade-in"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <aside
        className={`fixed top-0 left-0 h-full w-full sm:w-[420px] bg-white z-50 shadow-2xl transition-transform duration-300 flex flex-col ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h2 className="font-bold text-lg">
            Shopping Cart ({items.length})
          </h2>
          <button
            onClick={() => setOpen(false)}
            className="w-9 h-9 rounded-lg hover:bg-slate-100 flex items-center justify-center"
            aria-label="Close"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-slate-400"
                >
                  <circle cx="8" cy="21" r="1" />
                  <circle cx="19" cy="21" r="1" />
                  <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-1">Your cart is empty</h3>
              <p className="text-slate-500 text-sm mb-6">
                Start shopping and add your favorite products
              </p>
              <Link
                href="/products"
                onClick={() => setOpen(false)}
                className="btn btn-primary"
              >
                Browse products
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="flex gap-3 p-3 bg-slate-50 rounded-xl"
                >
                  <div className="w-20 h-20 rounded-lg bg-white overflow-hidden shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/product/${item.slug}`}
                      onClick={() => setOpen(false)}
                      className="font-semibold text-sm line-clamp-2 hover:text-amber-600"
                    >
                      {item.name}
                    </Link>
                    <div className="text-amber-600 font-bold text-sm mt-1">
                      {fmt(item.price)}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center bg-white rounded-lg border border-slate-200">
                        <button
                          onClick={() =>
                            updateQty(item.productId, item.quantity - 1)
                          }
                          className="w-7 h-7 flex items-center justify-center hover:bg-slate-100 rounded-r-lg"
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span className="w-8 text-center text-sm font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQty(item.productId, item.quantity + 1)
                          }
                          className="w-7 h-7 flex items-center justify-center hover:bg-slate-100 rounded-l-lg"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => remove(item.productId)}
                        className="text-red-500 hover:text-red-600 text-xs"
                        aria-label="Remove"
                      >
                        🗑 Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-slate-200 p-4 space-y-3 bg-white">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Subtotal</span>
              <span className="font-semibold">{fmt(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Shipping</span>
              <span className="font-semibold">
                {shipping === 0 ? (
                  <span className="text-emerald-600">Free</span>
                ) : (
                  fmt(shipping)
                )}
              </span>
            </div>
            {subtotal < 50000 && (
              <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded-lg">
                Add {fmt(50000 - subtotal)} more to get free shipping
              </div>
            )}
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-slate-200">
              <span>Total</span>
              <span className="text-amber-600">{fmt(total)}</span>
            </div>
            <Link
              href="/checkout"
              onClick={() => setOpen(false)}
              className="btn btn-primary w-full"
            >
              Checkout
            </Link>
            <button
              onClick={() => setOpen(false)}
              className="btn btn-outline w-full"
            >
              Continue shopping
            </button>
          </div>
        )}
      </aside>
    </>
  );
};

export default CartDrawer;
