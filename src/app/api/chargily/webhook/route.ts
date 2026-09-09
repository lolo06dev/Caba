import { NextResponse } from "next/server";
import { applyChargilyEvent } from "@/lib/data";
import { verifyChargilySignature } from "@/lib/chargily";

// Chargily Pay webhook receiver.
// Chargily sends events such as checkout.paid / checkout.failed here after
// a payment attempt. The signature header is verified with HMAC-SHA256.
export async function POST(request: Request) {
  const signature = request.headers.get("signature");
  const rawBody = await request.text();

  if (!verifyChargilySignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
  }

  let event: {
    type?: string;
    data?: {
      id?: string;
      status?: string;
      metadata?: { order_id?: string | number } | null;
    };
  };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const type = event.type ?? "";
  const data = event.data ?? {};

  const orderId = Number(data.metadata?.order_id);
  const checkoutId = typeof data.id === "string" ? data.id : null;

  try {
    switch (type) {
      case "checkout.paid":
      case "payment.paid": {
        if (data.status && data.status !== "paid") break;
        await applyChargilyEvent({
          checkoutId,
          orderId: Number.isFinite(orderId) && orderId > 0 ? orderId : null,
          paymentStatus: "paid",
        });
        break;
      }
      case "checkout.failed": {
        await applyChargilyEvent({
          checkoutId,
          orderId: Number.isFinite(orderId) && orderId > 0 ? orderId : null,
          paymentStatus: "failed",
        });
        break;
      }
      // checkout.canceled / checkout.expired and others: keep the order
      // unpaid so the customer can retry with the "Pay now" button.
      default:
        break;
    }
  } catch (e) {
    console.error("Chargily webhook handling failed", e);
    // Return 500 so Chargily retries the delivery.
    return NextResponse.json(
      { error: "Webhook handling failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}
