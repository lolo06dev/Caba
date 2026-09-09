"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type LocalCartItem = {
  productId: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
  slug: string;
};

type CartState = {
  items: LocalCartItem[];
  isOpen: boolean;
  add: (item: LocalCartItem) => void;
  remove: (productId: number) => void;
  updateQty: (productId: number, qty: number) => void;
  clear: () => void;
  setOpen: (open: boolean) => void;
  toggle: () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      add: (item) =>
        set((state) => {
          const existing = state.items.find(
            (i) => i.productId === item.productId
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === item.productId
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
              isOpen: true,
            };
          }
          return { items: [...state.items, item], isOpen: true };
        }),
      remove: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),
      updateQty: (productId, qty) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId
              ? { ...i, quantity: Math.max(1, qty) }
              : i
          ),
        })),
      clear: () => set({ items: [] }),
      setOpen: (open) => set({ isOpen: open }),
      toggle: () => set((state) => ({ isOpen: !state.isOpen })),
    }),
    {
      name: "arena-store-cart",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
