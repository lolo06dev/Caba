import { NextResponse } from "next/server";
import { getOrderById, setOrderChargilyCheckout } from "@/lib/data";
import {
  createChargilyCheckout,
  getSiteUrl,
  isChargilyConfigured,
} from "@/lib/chargily";

// Creates (or re-creates) a Chargily Pay checkout for an existing
// online-payment order — used by the "Pay now" button on the order page.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const orderId = Number(id);
    if (!Number.isFinite(orderId)) {
      return NextResponse.json({ error: "Invalid order id" }, { status: 400 });
    }

    const order = await getOrderById(orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.paymentMethod !== "chargily") {
      return NextResponse.json(
        { error: "This order is not an online payment order" },
        { status: 400 }
      );
    }

    if (order.paymentStatus === "paid") {
      return NextResponse.json(
        { error: "This order is already paid" },
        { status: 400 }
      );
    }

    if (!isChargilyConfigured()) {
      return NextResponse.json(
        { error: "Online payment is not configured yet" },
        { status: 503 }
      );
    }

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

    return NextResponse.json({ paymentUrl: checkout.checkoutUrl });
  } catch (e) {
    console.error("Chargily pay error", e);
    const message =
      e instanceof Error ? e.message : "Failed to create the payment session";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
