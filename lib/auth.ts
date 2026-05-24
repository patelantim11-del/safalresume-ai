import type { User } from "@/types";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { MongoClient } from "mongodb";
import { NextRequest } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET ?? "resume-builder-secret";

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash?: string) {
  if (!hash) {
    return false;
  }

  return bcrypt.compare(password, hash);
}

export function signToken(
  user: Pick<User, "email" | "fullName" | "createdAt"> & { id: string },
) {
  return jwt.sign(
    { id: user.id, email: user.email, fullName: user.fullName },
    JWT_SECRET,
    {
      expiresIn: "7d",
    },
  );
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
      fullName: string;
    };
  } catch {
    return null;
  }
}

export async function getUserFromRequest(
  request: NextRequest,
): Promise<User | null> {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) return null;

    const decoded = verifyToken(token);
    if (!decoded) return null;

    const uri = process.env.MONGODB_URI;
    if (!uri) return null;

    const client = new MongoClient(uri);
    await client.connect();

    const db = client.db();
    const usersCollection = db.collection("users");

    const user = await usersCollection.findOne({ email: decoded.email });
    await client.close();

    if (!user) return null;

    return {
      _id: user._id?.toString(),
      fullName: user.fullName || "",
      email: user.email || "",
      passwordHash: user.passwordHash || "",
      username: user.username,
      profileUrl: user.profileUrl,
      bio: user.bio,
      photoUrl: user.photoUrl,
      subscription: user.subscription || "free",
      subscriptionStatus: user.subscriptionStatus || "active",
      aiCredits: user.aiCredits || 0,
      documentsCreated: user.documentsCreated || 0,
      coverLettersGenerated: user.coverLettersGenerated || 0,
      profileViews: user.profileViews || 0,
      isAdmin: user.isAdmin || false,
      createdAt: user.createdAt || new Date().toISOString(),
      updatedAt: user.updatedAt || new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error getting user from request:", error);
    return null;
  }
}
