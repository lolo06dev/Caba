import { NextResponse } from "next/server";
import { createOrder } from "@/lib/data";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customer, items, notes } = body || {};

    if (
      !customer ||
      !customer.name ||
      !customer.phone ||
      !customer.address ||
      !customer.city
    ) {
      return NextResponse.json(
        { error: "Customer details are incomplete" },
        { status: 400 }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Your cart is empty" },
        { status: 400 }
      );
    }

    const order = await createOrder({
      customerName: customer.name,
      customerPhone: customer.phone,
      customerEmail: customer.email,
      customerAddress: customer.address,
      customerCity: customer.city,
      notes,
      items: items.map((i: any) => ({
        productId: i.productId,
        name: i.name,
        image: i.image,
        price: i.price,
        quantity: i.quantity,
        slug: i.slug,
      })),
    });

    return NextResponse.json({ order });
  } catch (e) {
    console.error("Order error", e);
    return NextResponse.json(
      { error: "Failed to create the order" },
      { status: 500 }
    );
  }
}
