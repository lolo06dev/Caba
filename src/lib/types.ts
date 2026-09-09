// Shared types and utilities for the store

export type Product = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  oldPrice: number | null;
  image: string;
  images: string[] | null;
  categoryId: number | null;
  brand: string | null;
  stock: number;
  rating: number;
  reviewsCount: number;
  featured: number;
  isNew: number;
  discount: number;
  createdAt: Date;
};

export type Category = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  createdAt: Date;
};

export type CartItem = {
  id: number;
  productId: number;
  quantity: number;
  product: Product;
};

export type CartState = {
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
};

export type Order = {
  id: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  customerAddress: string;
  customerCity: string;
  customerCommune: string | null;
  notes: string | null;
  status:
    | "pending"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled";
  paymentMethod: string; // "cod" | "chargily"
  paymentStatus: string; // "unpaid" | "paid" | "failed"
  chargilyCheckoutId: string | null;
  subtotal: number;
  shipping: number;
  total: number;
  createdAt: Date;
};

export function formatPrice(value: number): string {
  // value is stored in centimes, divide by 100 for currency
  const num = value / 100;
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num) + " DA";
}

export function calcDiscount(oldPrice: number | null, price: number): number {
  if (!oldPrice || oldPrice <= price) return 0;
  return Math.round(((oldPrice - price) / oldPrice) * 100);
}

export function starArray(rating: number): boolean[] {
  // rating is 0..50 (x10), convert to 0..5
  const r = rating / 10;
  const arr: boolean[] = [];
  for (let i = 1; i <= 5; i++) {
    arr.push(i <= Math.floor(r));
  }
  return arr;
}
