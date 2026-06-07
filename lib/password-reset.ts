import crypto from "crypto";

export function generateResetToken() {
  // raw token sent to user
  const token = crypto.randomBytes(32).toString("hex");
  // hashed token stored in DB for verification
  const hashed = crypto.createHash("sha256").update(token).digest("hex");
  return { token, hashed };
}

export function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

// In-memory store for dev-only token testing when MongoDB is unavailable
export const devResetStore = new Map<
  string,
  { email: string; expiry: number }
>();

export function devStoreToken(hashed: string, email: string, expiry: number) {
  devResetStore.set(hashed, { email, expiry });
}

export function devGetToken(hashed: string) {
  const rec = devResetStore.get(hashed);
  if (!rec) return null;
  if (Date.now() > rec.expiry) {
    devResetStore.delete(hashed);
    return null;
  }
  return rec;
}

export function devDeleteToken(hashed: string) {
  devResetStore.delete(hashed);
}
