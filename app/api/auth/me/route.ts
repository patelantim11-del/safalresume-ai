import { connectToDatabase } from "@/lib/mongodb";
import { USERS_COLLECTION } from "@/models/user";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token?.email) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const client = await connectToDatabase();
    const db = client.db();
    const user = await db
      .collection(USERS_COLLECTION)
      .findOne({ email: token.email });

    if (!user) return NextResponse.json({ user: null }, { status: 200 });

    return NextResponse.json(
      {
        user: {
          id: user._id.toString(),
          email: user.email,
          fullName: user.fullName,
          subscription: user.subscription || "free",
          image: user.image || null,
        },
      },
      { status: 200 },
    );
  } catch (err) {
    console.error("/api/auth/me error:", err);
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
