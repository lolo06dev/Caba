import crypto from "crypto";

// ============================================================
// Chargily Pay (https://dev.chargily.com) — Algerian payment
// gateway for EDAHABIA & CIB cards.
//
// Set CHARGILY_API_KEY in your environment (test_sk_... or
// live_sk_...). Until the key is added, the store gracefully
// falls back to cash on delivery only.
// ============================================================

const API_KEY = process.env.CHARGILY_API_KEY?.trim() ?? "";

export function isChargilyConfigured(): boolean {
  return API_KEY.length > 0;
}

/**
 * Resolve the public base URL of the store (for payment redirect URLs),
 * preferring NEXT_PUBLIC_SITE_URL, then proxy headers, then the request URL.
 */
export function getSiteUrl(request: Request): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/+$/, "");

  const headers = request.headers;
  const host =
    headers.get("x-forwarded-host") || headers.get("host") || "";
  if (host) {
    const proto =
      headers.get("x-forwarded-proto")?.split(",")[0] ||
      (host.startsWith("localhost") || host.startsWith("127.0.0.1")
        ? "http"
        : "https");
    return `${proto}://${host}`;
  }
  return new URL(request.url).origin;
}

function baseUrl(): string {
  const override = process.env.CHARGILY_API_URL?.trim();
  if (override) return override.replace(/\/+$/, "");
  // Test keys use the sandbox API, live keys use the live API.
  return API_KEY.startsWith("test_sk_")
    ? "https://pay.chargily.net/test/api/v2"
    : "https://pay.chargily.net/api/v2";
}

export type ChargilyCheckout = {
  id: string;
  checkoutUrl: string;
  status: string;
};

/**
 * Create a Chargily Pay checkout session.
 * Amounts are in centimes (same unit the store uses everywhere).
 * Docs: https://dev.chargily.com/pay-v2/api-reference/checkouts/create
 */
export async function createChargilyCheckout(input: {
  amount: number;
  description: string;
  successUrl: string;
  failureUrl: string;
  webhookUrl?: string | null;
  locale?: string;
  paymentMethod?: string;
  metadata?: Record<string, string>;
  shippingAddress?: string;
}): Promise<ChargilyCheckout> {
  const body: Record<string, unknown> = {
    amount: Math.round(input.amount),
    currency: "dzd",
    payment_method: input.paymentMethod || "edahabia",
    success_url: input.successUrl,
    failure_url: input.failureUrl,
    description: input.description,
    locale: input.locale || "ar",
    metadata: input.metadata ?? {},
  };
  if (input.shippingAddress) body.shipping_address = input.shippingAddress;
  // Chargily requires a publicly reachable HTTPS webhook endpoint.
  if (input.webhookUrl?.startsWith("https://")) {
    body.webhook_endpoint = input.webhookUrl;
  }

  const res = await fetch(`${baseUrl()}/checkouts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const message =
      (data &&
        ((typeof data.message === "string" && data.message) ||
          (Array.isArray(data.errors) && data.errors.join(", ")) ||
          JSON.stringify(data))) ||
      `Chargily API error (HTTP ${res.status})`;
    throw new Error(message);
  }

  if (!data?.checkout_url || !data?.id) {
    throw new Error("Chargily API returned an unexpected response");
  }

  return {
    id: data.id as string,
    checkoutUrl: data.checkout_url as string,
    status: (data.status as string) ?? "pending",
  };
}

/**
 * Verify the webhook signature header Chargily sends.
 * The signature is an HMAC-SHA256 hex digest of the raw request body,
 * signed with the API secret key (or a dedicated webhook secret).
 */
export function verifyChargilySignature(
  rawBody: string,
  signature: string | null
): boolean {
  if (!signature) return false;
  const secret =
    process.env.CHARGILY_WEBHOOK_SECRET?.trim() || API_KEY;
  if (!secret) return false;

  const computed = crypto
    .createHmac("sha256", secret)
    .update(rawBody, "utf8")
    .digest("hex");

  const a = Buffer.from(computed, "utf8");
  const b = Buffer.from(signature, "utf8");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
