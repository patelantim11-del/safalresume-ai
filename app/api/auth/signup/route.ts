import { hashPassword, signToken } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { USERS_COLLECTION } from "@/models/user";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fullName, email, password } = body as {
      fullName: string;
      email: string;
      password: string;
    };

    if (!email || !password || !fullName) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const client = await connectToDatabase();
    const db = client.db();
    const existing = await db.collection(USERS_COLLECTION).findOne({ email });
    if (existing) {
      return NextResponse.json(
        { error: "Account already exists" },
        { status: 409 },
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const now = new Date().toISOString();

    const user = {
      fullName,
      email,
      passwordHash,
      subscription: "free",
      subscriptionStatus: "active",
      aiCredits: 0,
      documentsCreated: 0,
      coverLettersGenerated: 0,
      profileViews: 0,
      isAdmin: false,
      createdAt: now,
      updatedAt: now,
    } as any;

    await db.collection(USERS_COLLECTION).insertOne(user);

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error("Signup error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export const runtime = "nodejs";

const signupSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = signupSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.format() },
        { status: 400 },
      );
    }

    console.log("[signup] Attempting to connect to MongoDB...");
    const client = await connectToDatabase();
    console.log("[signup] MongoDB connected. Checking existing user...");
    const db = client.db();
    const existingUser = await db
      .collection(USERS_COLLECTION)
      .findOne({ email: parsed.data.email });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered." },
        { status: 409 },
      );
    }

    const passwordHash = await hashPassword(parsed.data.password);
    const createdAt = new Date().toISOString();

    const result = await db.collection(USERS_COLLECTION).insertOne({
      fullName: parsed.data.fullName,
      email: parsed.data.email,
      passwordHash,
      createdAt,
    });

    const token = signToken({
      id: result.insertedId.toString(),
      email: parsed.data.email,
      fullName: parsed.data.fullName,
      createdAt,
    });

    const response = NextResponse.json(
      {
        user: {
          id: result.insertedId.toString(),
          email: parsed.data.email,
          fullName: parsed.data.fullName,
        },
      },
      { status: 201 },
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
    console.error("[signup] Error:", {
      message,
      stack,
      name: (error as any)?.name,
      code: (error as any)?.code,
    });
    return NextResponse.json(
      {
        error: "Signup failed.",
        details: message,
      },
      { status: 500 },
    );
  }
}
