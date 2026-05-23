import { signToken, verifyPassword } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { USERS_COLLECTION } from "@/models/user";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.format() },
        { status: 400 },
      );
    }

    console.log("[login] Attempting to connect to MongoDB...");
    const client = await connectToDatabase();
    console.log("[login] MongoDB connected. Querying user...");
    const db = client.db();
    const user = await db
      .collection(USERS_COLLECTION)
      .findOne({ email: parsed.data.email });

    if (
      !user ||
      !user.passwordHash ||
      !(await verifyPassword(parsed.data.password, user.passwordHash))
    ) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 },
      );
    }

    const token = signToken({
      id: user._id.toString(),
      email: user.email,
      fullName: user.fullName,
      createdAt: user.createdAt,
    });
    const response = NextResponse.json(
      {
        user: {
          id: user._id.toString(),
          email: user.email,
          fullName: user.fullName,
        },
      },
      { status: 200 },
    );
    response.cookies.set({
      name: "resume-auth",
      value: token,
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : "";
    console.error("[login] Error:", {
      message,
      stack,
      name: (error as any)?.name,
      code: (error as any)?.code,
    });
    return NextResponse.json(
      { error: "Login failed.", details: message },
      { status: 500 },
    );
  }
}
