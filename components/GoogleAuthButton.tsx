"use client";

import { signIn } from "next-auth/react";

export default function GoogleAuthButton({
  label = "Continue with Google",
  redirect = "/dashboard",
}: {
  label?: string;
  redirect?: string;
}) {
  return (
    <button
      onClick={() => signIn("google", { callbackUrl: redirect })}
      className="w-full rounded-2xl border border-slate-700 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/6"
    >
      <span className="flex items-center justify-center gap-3">{label}</span>
    </button>
  );
}
