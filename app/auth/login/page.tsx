"use client";

import GoogleAuthButton from "@/components/GoogleAuthButton";
import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 px-6 py-12 sm:px-12">
      <div className="max-w-3xl mx-auto rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl shadow-slate-950/40">
        <h1 className="text-4xl font-semibold">Login to SafalResume AI</h1>
        <p className="mt-3 text-slate-400">
          Secure access to your saved resumes and AI-powered editor.
        </p>

        <div className="mt-8 space-y-6">
          <GoogleAuthButton />
        </div>

        <div className="mt-6 flex items-center justify-between text-sm text-slate-400">
          <p>
            New here?{" "}
            <Link
              href="/auth/signup"
              className="text-sky-400 hover:text-sky-300"
            >
              Create an account
            </Link>
          </p>
          <p>
            <Link
              href="/auth/forgot-password"
              className="text-sky-400 hover:text-sky-300"
            >
              Forgot Password?
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
