import { NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/mongodb";
import { USERS_COLLECTION } from "@/models/user";

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();
    if (!token || !password) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const hashed = crypto.createHash("sha256").update(token).digest("hex");

    const client = await connectToDatabase();
    const db = client.db();

    const user = await db.collection(USERS_COLLECTION).findOne({ resetToken: hashed, resetTokenExpiry: { $gt: Date.now() } });
    if (!user) return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });

    const passwordHash = await bcrypt.hash(password, 10);

    await db.collection(USERS_COLLECTION).updateOne({ _id: user._id }, { $set: { passwordHash, updatedAt: new Date().toISOString() }, $unset: { resetToken: "", resetTokenExpiry: "" } });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Reset password error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
import { hashPassword } from "@/lib/auth";
import { sendPasswordChangedEmail } from "@/lib/email";
import { connectToDatabase } from "@/lib/mongodb";
import { devGetToken, hashToken } from "@/lib/password-reset";
import { USERS_COLLECTION } from "@/models/user";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token = String(body.token || "");
    const newPassword = String(body.password || "");

    if (!token || newPassword.length < 8) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    let users: any = null;
    let user: any = null;
    const hashed = hashToken(token);

    try {
      const client = await connectToDatabase();
      const db = client.db();
      users = db.collection(USERS_COLLECTION);
      user = await users.findOne({ resetToken: hashed });
      if (
        user &&
        (!user.resetTokenExpiry || Date.now() > user.resetTokenExpiry)
      ) {
        return NextResponse.json({ error: "Token expired" }, { status: 400 });
      }
    } catch (dbError) {
      console.error("[reset-password] DB error:", dbError);
      if (process.env.DEV_RESET_FALLBACK === "true") {
        const devRec = devGetToken(hashed);
        if (!devRec) {
          return NextResponse.json(
            { error: "Invalid or expired token" },
            { status: 400 },
          );
        }
        // Create a fake user object using the email from dev store
        user = { email: devRec.email } as any;
      } else {
        throw dbError;
      }
    }

    const newHash = await hashPassword(newPassword);

    if (users) {
      await users.updateOne(
        { _id: user._id },
        {
          $set: { passwordHash: newHash },
          $unset: { resetToken: "", resetTokenExpiry: "" },
        },
      );

      console.log(`[reset-password] Password updated for user ${user.email}`);
    } else {
      // Dev fallback: no DB to persist password. Log and remove dev token.
      const { devDeleteToken } = await import("@/lib/password-reset");
      try {
        const hashedToken = hashToken(token);
        devDeleteToken(hashedToken);
      } catch {}
      console.log(
        `[reset-password] (dev-fallback) Password change simulated for ${user.email}`,
      );
    }

    try {
      await sendPasswordChangedEmail(user.email);
    } catch (err) {
      console.error("[reset-password] Error sending confirmation email:", err);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[reset-password] Error:", error);
    return NextResponse.json(
      { error: "Failed to reset password" },
      { status: 500 },
    );
  }
}
