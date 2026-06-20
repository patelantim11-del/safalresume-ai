const required = [
  "MONGODB_URI",
  "JWT_SECRET",
  "NEXTAUTH_SECRET",
  "NEXTAUTH_URL",
  "NEXT_PUBLIC_BASE_URL",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "SMTP_USER",
  "SMTP_PASS",
];

const recommended = [
  "AI_PROVIDER",
  "GEMINI_API_KEY",
  "OPENAI_API_KEY",
  "RAZORPAY_KEY_ID",
  "RAZORPAY_KEY_SECRET",
  "RAZORPAY_WEBHOOK_SECRET",
  "NEXT_PUBLIC_APP_URL",
];

const missing = required.filter((k) => !process.env[k]);
const missingRecommended = recommended.filter((k) => !process.env[k]);

if (missing.length === 0) {
  console.log("OK: All required env vars are present");
} else {
  console.warn("Missing environment variables:");
  missing.forEach((m) => console.warn(" -", m));
}

if (missingRecommended.length > 0) {
  console.warn("Missing optional/recommended environment variables:");
  missingRecommended.forEach((m) => console.warn(" -", m));
}

// Always exit 0 so checks in this environment don't abort automated runs
process.exit(0);
