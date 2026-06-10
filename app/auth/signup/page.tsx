"use client";

import GoogleAuthButton from "@/components/GoogleAuthButton";
import Link from "next/link";

export default function SignupPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 px-6 py-12 sm:px-12">
      <div className="max-w-3xl mx-auto rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl shadow-slate-950/40">
        <h1 className="text-4xl font-semibold">
          Create your SafalResume AI account
        </h1>
        <p className="mt-3 text-slate-400">
          Build resumes faster with AI-powered templates and export tools.
        </p>

        <div className="mt-8 space-y-6">
          <GoogleAuthButton
            label="Continue with Google"
            redirect="/dashboard"
          />
        </div>

        <p className="mt-6 text-sm text-slate-400">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-sky-400 hover:text-sky-300">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
