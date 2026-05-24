import type { User } from "@/types";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { MongoClient, ObjectId } from "mongodb";
import { NextRequest } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET ?? "resume-builder-secret";
export const AUTH_COOKIE_NAME = "resume-auth";

export function getTokenFromRequest(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  console.log("[auth] Cookie detection", {
    cookieName: AUTH_COOKIE_NAME,
    tokenFound: Boolean(token),
    tokenSnippet: token ? `${token.slice(0, 10)}...` : null,
  });
  return token || null;
}

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
  const token = jwt.sign(
    { id: user.id, email: user.email, fullName: user.fullName },
    JWT_SECRET,
    {
      expiresIn: "7d",
    },
  );
  console.log("[auth] Signed JWT", {
    userId: user.id,
    email: user.email,
  });
  return token;
}

export function verifyToken(token: string) {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
      fullName: string;
    };
    console.log("[auth] JWT verification succeeded", {
      userId: payload.id,
      email: payload.email,
    });
    return payload;
  } catch (error) {
    console.warn("[auth] JWT verification failed", {
      message: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

export async function getUserFromRequest(
  request: NextRequest,
): Promise<User | null> {
  try {
    const token = getTokenFromRequest(request);
    if (!token) {
      console.warn("[auth] Authorization failed: missing auth token");
      return null;
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      console.warn("[auth] Authorization failed: invalid JWT");
      return null;
    }

    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error("[auth] MONGODB_URI is not set");
      return null;
    }

    const client = new MongoClient(uri);
    await client.connect();

    const db = client.db();
    const usersCollection = db.collection("users");

    console.log("[auth] Looking up authenticated user", {
      userId: decoded.id,
      email: decoded.email,
    });

    const user = await usersCollection.findOne({
      _id: new ObjectId(decoded.id),
    });
    await client.close();

    if (!user) {
      console.warn("[auth] Authorization failed: user not found", {
        userId: decoded.id,
        email: decoded.email,
      });
      return null;
    }

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
