import { USERS_COLLECTION } from "@/models/user";
import type { User } from "@/types";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";
import { connectToDatabase } from "./mongodb";
import { authOptions } from "./nextauth";

function getJwtSecret() {
  if (!process.env.JWT_SECRET) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "Missing JWT_SECRET environment variable in production. Set JWT_SECRET to a strong secret.",
      );
    }
    return "resume-builder-secret";
  }

  return process.env.JWT_SECRET;
}
export const AUTH_COOKIE_NAME = "resume-auth";

export function getTokenFromRequest(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  console.debug("[auth] Cookie detection", {
    cookieName: AUTH_COOKIE_NAME,
    tokenFound: Boolean(token),
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
    getJwtSecret(),
    {
      expiresIn: "7d",
    },
  );
  console.debug("[auth] Signed JWT", { userId: user.id });
  return token;
}

export function verifyToken(token: string) {
  try {
    const payload = jwt.verify(token, getJwtSecret()) as {
      id: string;
      email: string;
      fullName: string;
    };
    console.debug("[auth] JWT verification succeeded", { userId: payload.id });
    return payload;
  } catch (error) {
    console.warn("[auth] JWT verification failed", {
      message: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

export async function getUserFromRequest(
  _request: NextRequest,
): Promise<User | null> {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
      console.warn("[auth] Authorization failed: no valid session");
      return null;
    }

    const email = session.user.email;

    const client = await connectToDatabase();
    const db = client.db();
    const usersCollection = db.collection(USERS_COLLECTION);

    console.log("[auth] Looking up authenticated user by email", { email });

    const user = await usersCollection.findOne({ email });

    if (!user) {
      console.warn("[auth] Authorization failed: user not found", { email });
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
    } as User;
  } catch (error) {
    console.error("Error getting user from request:", error);
    return null;
  }
}
