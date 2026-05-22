import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { z } from "zod";

const orderSchema = z.object({
  amount: z.number().min(100),
  currency: z.string().default("INR"),
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = orderSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
  }

  const keyId = process.env.RAZORPAY_KEY_ID ?? "";
  const keySecret = process.env.RAZORPAY_KEY_SECRET ?? "";

  if (!keyId || !keySecret) {
    return NextResponse.json(
      { error: "Razorpay keys are not configured." },
      { status: 500 },
    );
  }

  const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
  const order = await razorpay.orders.create({
    amount: parsed.data.amount,
    currency: parsed.data.currency,
    receipt: `resume-builder-${Date.now()}`,
    payment_capture: true,
  });

  return NextResponse.json({ order, keyId }, { status: 201 });
}
