"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

export default function ResetPasswordPage() {
  const { token } = useParams() as { token?: string };
  const router = useRouter();
  const { register, handleSubmit } = useForm<{
    password: string;
    confirm: string;
  }>();
  const [status, setStatus] = useState<string | null>(null);

  async function onSubmit(data: { password: string; confirm: string }) {
    setStatus(null);
    if (data.password !== data.confirm) {
      setStatus("Passwords do not match");
      return;
    }

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: data.password }),
      });
      const j = await res.json();
      if (res.ok) {
        setStatus("Password reset successful. Redirecting to login...");
        setTimeout(() => router.push("/auth/login"), 1200);
      } else {
        setStatus(j.error || "Failed to reset password");
      }
    } catch {
      setStatus("Failed to reset password");
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 px-6 py-12">
      <div className="max-w-xl mx-auto rounded-2xl border bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 p-8">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          Reset Password
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Set a new password for your account.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm text-slate-700 dark:text-slate-300">
              New password
            </span>
            <input
              type="password"
              {...register("password")}
              className="mt-2 w-full rounded-lg border px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-700"
            />
          </label>
          <label className="block">
            <span className="text-sm text-slate-700 dark:text-slate-300">
              Confirm password
            </span>
            <input
              type="password"
              {...register("confirm")}
              className="mt-2 w-full rounded-lg border px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-700"
            />
          </label>

          <button className="w-full rounded-lg bg-sky-500 px-4 py-2 text-white">
            Set new password
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
