import { sendResetEmail } from "@/lib/email";
import { connectToDatabase } from "@/lib/mongodb";
import { devStoreToken, generateResetToken } from "@/lib/password-reset";
import { USERS_COLLECTION } from "@/models/user";
import crypto from "crypto";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email)
      return NextResponse.json({ error: "Missing email" }, { status: 400 });

    const client = await connectToDatabase();
    const db = client.db();
    const user = await db.collection(USERS_COLLECTION).findOne({ email });

    // Always respond OK to avoid account enumeration
    if (!user) return NextResponse.json({ ok: true });

    const token = crypto.randomBytes(20).toString("hex");
    const hashed = crypto.createHash("sha256").update(token).digest("hex");
    const expiry = Date.now() + 3600 * 1000; // 1 hour

    await db
      .collection(USERS_COLLECTION)
      .updateOne(
        { email },
        { $set: { resetToken: hashed, resetTokenExpiry: expiry } },
      );

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "";
    const resetUrl = `${appUrl.replace(/\/$/, "")}/auth/reset-password/${token}`;

    // send email if SMTP configured
    const host = process.env.SMTP_HOST;
    if (host && process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT) || 465,
          secure: process.env.SMTP_SECURE === "true",
          auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
        });

        await transporter.sendMail({
          from: process.env.EMAIL_FROM_NAME || process.env.SMTP_USER,
          to: email,
          subject: "Reset your SafalResume AI password",
          text: `Click to reset your password: ${resetUrl}`,
          html: `<p>Click to reset your password: <a href="${resetUrl}">${resetUrl}</a></p>`,
        });
      } catch (e) {
        console.error("Failed to send reset email:", e);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Forgot password error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// Simple in-memory rate limiter per IP and per email
const ipAttempts = new Map<string, { count: number; first: number }>();
const emailAttempts = new Map<string, { count: number; first: number }>();
const WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_PER_IP = 20;
const MAX_PER_EMAIL = 5;

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "local";
    const now = Date.now();

    const ipRecord = ipAttempts.get(ip) || { count: 0, first: now };
    if (now - ipRecord.first > WINDOW_MS) {
      ipRecord.count = 0;
      ipRecord.first = now;
    }
    ipRecord.count++;
    ipAttempts.set(ip, ipRecord);
    if (ipRecord.count > MAX_PER_IP) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    // Read raw body for better diagnostics (some clients may send invalid JSON)
    const raw = await request.text();
    console.log("[forgot-password] Raw request body:", raw.slice(0, 200));
    console.log(
      "[forgot-password] Raw request body (escaped):",
      JSON.stringify(raw).slice(0, 400),
    );
    let body: any;
    try {
      body = JSON.parse(raw);
      // Handle double-encoded JSON: client may send a JSON string containing JSON
      if (typeof body === "string") {
        try {
          body = JSON.parse(body);
        } catch (err) {
          console.error("[forgot-password] JSON double-parse failed:", body);
          throw err;
        }
      }
    } catch (err) {
      console.error("[forgot-password] JSON parse error for body:", raw);
      throw err;
    }

    const email = String(body.email || "").toLowerCase();
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const emailRecord = emailAttempts.get(email) || { count: 0, first: now };
    if (now - emailRecord.first > WINDOW_MS) {
      emailRecord.count = 0;
      emailRecord.first = now;
    }
    emailRecord.count++;
    emailAttempts.set(email, emailRecord);
    if (emailRecord.count > MAX_PER_EMAIL) {
      return NextResponse.json(
        { error: "Too many requests for this email" },
        { status: 429 },
      );
    }

    let users: any = null;
    let user: any = null;

    try {
      const client = await connectToDatabase();
      const db = client.db();
      users = db.collection(USERS_COLLECTION);
      user = await users.findOne({ email });
    } catch (dbError) {
      console.error("[forgot-password] DB error:", dbError);
      // If DB is unavailable, allow a dev-only fallback when enabled
      if (process.env.DEV_RESET_FALLBACK === "true") {
        const { token, hashed } = generateResetToken();
        const expiry = Date.now() + 15 * 60 * 1000;
        devStoreToken(hashed, email, expiry);
        const base =
          process.env.NEXT_PUBLIC_BASE_URL || `http://localhost:3000`;
        const resetUrl = `${base}/auth/reset-password/${token}`;
        try {
          await sendResetEmail(email, resetUrl);
          console.log(
            `[forgot-password] (dev-fallback) Password reset email sent to ${email}`,
          );
        } catch (err) {
          console.error(
            "[forgot-password] (dev-fallback) Error sending email:",
            err,
          );
          console.log(
            `[forgot-password] (dev-fallback) Reset URL: ${resetUrl}`,
          );
        }
        return NextResponse.json({ ok: true });
      }

      // otherwise rethrow to be handled by outer catch
      throw dbError;
    }

    // Always return success to avoid user enumeration
    if (!user) {
      console.log(
        "[forgot-password] No user for email, but returning generic success",
        { email },
      );
      return NextResponse.json({ ok: true });
    }
    // Always return success to avoid user enumeration
    if (!user) {
      console.log(
        "[forgot-password] No user for email, but returning generic success",
        { email },
      );
      return NextResponse.json({ ok: true });
    }

    const { token, hashed } = generateResetToken();
    const expiry = Date.now() + 15 * 60 * 1000; // 15 minutes

    await users.updateOne(
      { _id: user._id },
      { $set: { resetToken: hashed, resetTokenExpiry: expiry } },
    );

    // Build reset URL
    const base = process.env.NEXT_PUBLIC_BASE_URL || `http://localhost:3000`;
    const resetUrl = `${base}/auth/reset-password/${token}`;

    try {
      await sendResetEmail(user.email, resetUrl);
      console.log(`[forgot-password] Password reset email sent to ${email}`);
    } catch (err) {
      console.error("[forgot-password] Error sending email:", err);
      // Revert token on failure to avoid stale tokens
      await users.updateOne(
        { _id: user._id },
        { $unset: { resetToken: "", resetTokenExpiry: "" } },
      );
      // Return generic success to avoid enumeration
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[forgot-password] Error:", error);
    return NextResponse.json(
      { error: "Failed to request password reset" },
      { status: 500 },
    );
  }
}
