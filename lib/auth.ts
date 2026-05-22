import type { User } from "@/types";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.RAZORPAY_KEY_SECRET ?? "resume-builder-secret";

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
