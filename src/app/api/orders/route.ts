import { NextResponse } from "next/server";
import { createOrder, setOrderChargilyCheckout } from "@/lib/data";
import {
  createChargilyCheckout,
  getSiteUrl,
  isChargilyConfigured,
} from "@/lib/chargily";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customer, items, notes, paymentMethod } = body || {};

    if (
      !customer ||
      !customer.name ||
      !customer.phone ||
      !customer.address ||
      !customer.city ||
      !customer.commune
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

    const method = paymentMethod === "chargily" ? "chargily" : "cod";

    const order = await createOrder({
      customerName: customer.name,
      customerPhone: customer.phone,
      customerEmail: customer.email,
      customerAddress: customer.address,
      customerCity: customer.city,
      customerCommune: customer.commune,
      notes,
      paymentMethod: method,
      items: items.map((i: any) => ({
        productId: i.productId,
        name: i.name,
        image: i.image,
        price: i.price,
        quantity: i.quantity,
        slug: i.slug,
      })),
    });

    // Online payment via Chargily: create a checkout session and
    // redirect the customer to the payment page.
    let paymentUrl: string | null = null;
    let paymentError: string | null = null;

    if (method === "chargily" && isChargilyConfigured()) {
      try {
        const base = getSiteUrl(request);
        const checkout = await createChargilyCheckout({
          amount: order.total,
          description: `Order #${order.id} - Caba Product`,
          successUrl: `${base}/order/${order.id}?payment=success`,
          failureUrl: `${base}/order/${order.id}?payment=failed`,
          webhookUrl: `${base}/api/chargily/webhook`,
          locale: process.env.CHARGILY_LOCALE?.trim() || "ar",
          paymentMethod:
            process.env.CHARGILY_PAYMENT_METHOD?.trim().toLowerCase() ||
            "edahabia",
          metadata: { order_id: String(order.id) },
          shippingAddress: `${order.customerAddress}, ${order.customerCommune ?? ""} ${order.customerCity}`.trim(),
        });
        await setOrderChargilyCheckout(order.id, checkout.id);
        paymentUrl = checkout.checkoutUrl;
      } catch (e) {
        console.error("Chargily checkout creation failed", e);
        paymentError =
          "We could not start the online payment. You can retry from your order page.";
      }
    } else if (method === "chargily") {
      paymentError =
        "Online payment is not configured yet. You can retry later from your order page.";
    }

    return NextResponse.json({ order, paymentUrl, paymentError });
  } catch (e) {
    console.error("Order error", e);
    return NextResponse.json(
      { error: "Failed to create the order" },
      { status: 500 }
    );
  }
}
