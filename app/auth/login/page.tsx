"use client";

import GoogleAuthButton from "@/components/GoogleAuthButton";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";

export default function LoginPage() {
  const { register, handleSubmit } = useForm<{
    email: string;
    password: string;
  }>();
  const [status, setStatus] = useState<string | null>(null);

  async function onSubmit(data: { email: string; password: string }) {
    setStatus(null);
    const res = await signIn("credentials", {
      redirect: false,
      email: data.email,
      password: data.password,
    });

    if (res?.error) {
      setStatus(res.error as string);
    } else {
      // successful - redirect to dashboard
      window.location.href = "/dashboard";
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 px-6 py-12 sm:px-12">
      <div className="max-w-3xl mx-auto rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl shadow-slate-950/40">
        <h1 className="text-4xl font-semibold">Login to SafalResume AI</h1>
        <p className="mt-3 text-slate-400">
          Secure access to your saved resumes and AI-powered editor.
        </p>

        <div className="mt-6 space-y-4">
          <GoogleAuthButton />

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <label className="block">
              <span className="text-sm text-slate-300">Email</span>
              <input
                type="email"
                {...register("email")}
                className="mt-2 w-full rounded-lg border px-3 py-2 bg-white/5 text-slate-100 border-slate-700"
              />
            </label>
            <label className="block">
              <span className="text-sm text-slate-300">Password</span>
              <input
                type="password"
                {...register("password")}
                className="mt-2 w-full rounded-lg border px-3 py-2 bg-white/5 text-slate-100 border-slate-700"
              />
            </label>
            <button className="w-full rounded-lg bg-sky-500 px-4 py-2 text-white">
              Sign in
            </button>
          </form>
        </div>

        {status && <p className="mt-4 text-sm text-red-400">{status}</p>}

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
