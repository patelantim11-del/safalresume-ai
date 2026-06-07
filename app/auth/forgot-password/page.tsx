"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";

export default function ForgotPasswordPage() {
  const { register, handleSubmit } = useForm<{ email: string }>();
  const [status, setStatus] = useState<string | null>(null);

  async function onSubmit(data: { email: string }) {
    setStatus(null);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email }),
      });
      if (res.ok) {
        setStatus("If an account exists, a reset link was sent to your email.");
      } else {
        const j = await res.json();
        setStatus(j.error || "Failed to request reset");
      }
    } catch {
      setStatus("Failed to request reset");
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 px-6 py-12">
      <div className="max-w-xl mx-auto rounded-2xl border bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 p-8">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          Forgot Password
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Enter your account email and we will send a reset link.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm text-slate-700 dark:text-slate-300">
              Email
            </span>
            <input
              type="email"
              {...register("email")}
              className="mt-2 w-full rounded-lg border px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-700"
            />
          </label>

          <button className="w-full rounded-lg bg-sky-500 px-4 py-2 text-white">
            Send reset link
          </button>
        </form>

        {status && (
          <p className="mt-4 text-sm text-slate-700 dark:text-slate-200">
            {status}
          </p>
        )}
      </div>
    </main>
  );
}
