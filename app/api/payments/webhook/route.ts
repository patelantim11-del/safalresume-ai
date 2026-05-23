import { connectToDatabase } from "@/lib/mongodb";
import { PAYMENTS_COLLECTION } from "@/models/payment";
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature") ?? "";
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET ?? "";

  if (!secret) {
    return NextResponse.json(
      { error: "Webhook secret not configured." },
      { status: 500 },
    );
  }

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  if (signature !== expectedSignature) {
    return NextResponse.json(
      { error: "Invalid webhook signature." },
      { status: 401 },
    );
  }

  const event = JSON.parse(rawBody);
  const payment = event.payload?.payment?.entity || {};
  const order = event.payload?.order?.entity || {};

  const client = await connectToDatabase();
  const db = client.db();

  await db.collection(PAYMENTS_COLLECTION).insertOne({
    userId: order.notes?.userId ?? "unknown",
    razorpayOrderId: order.id ?? "",
    razorpayPaymentId: payment.id ?? "",
    amount: payment.amount ?? 0,
    currency: payment.currency ?? "INR",
    status: payment.status ?? event.event,
    createdAt: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true });
}
