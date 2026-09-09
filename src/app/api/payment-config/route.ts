import { NextResponse } from "next/server";
import { isChargilyConfigured } from "@/lib/chargily";

// Tells the checkout page whether the Chargily online payment option
// should be shown (i.e. whether CHARGILY_API_KEY has been set).
export async function GET() {
  return NextResponse.json({ chargilyEnabled: isChargilyConfigured() });
}
