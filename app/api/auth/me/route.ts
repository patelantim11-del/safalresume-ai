import { verifyToken } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { USERS_COLLECTION } from "@/models/user";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("resume-auth")?.value;

  if (!token) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  const payload = verifyToken(token);

  if (!payload) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  const client = await connectToDatabase();
  const db = client.db();
  const user = await db
    .collection(USERS_COLLECTION)
    .findOne({ _id: new (await import("mongodb")).ObjectId(payload.id) });

  if (!user) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  return NextResponse.json(
    {
      user: {
        id: user._id.toString(),
        email: user.email,
        fullName: user.fullName,
      },
    },
    { status: 200 },
  );
}
