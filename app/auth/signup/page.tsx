"use client";

import GoogleAuthButton from "@/components/GoogleAuthButton";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";

export default function SignupPage() {
  const { register, handleSubmit } = useForm<{
    fullName: string;
    email: string;
    password: string;
  }>();
  const [status, setStatus] = useState<string | null>(null);

  async function onSubmit(data: {
    fullName: string;
    email: string;
    password: string;
  }) {
    setStatus(null);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const j = await res.json();
      if (!res.ok) {
        setStatus(j.error || "Failed to create account");
        return;
      }

      // auto sign-in after successful signup
      await signIn("credentials", {
        redirect: true,
        email: data.email,
        password: data.password,
        callbackUrl: "/dashboard",
      });
    } catch (err) {
      setStatus("Failed to create account");
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 px-6 py-12 sm:px-12">
      <div className="max-w-3xl mx-auto rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl shadow-slate-950/40">
        <h1 className="text-4xl font-semibold">
          Create your SafalResume AI account
        </h1>
        <p className="mt-3 text-slate-400">
          Build resumes faster with AI-powered templates and export tools.
        </p>

        <div className="mt-6 space-y-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <label className="block">
              <span className="text-sm text-slate-300">Full name</span>
              <input
                type="text"
                {...register("fullName")}
                className="mt-2 w-full rounded-lg border px-3 py-2 bg-white/5 text-slate-100 border-slate-700"
              />
            </label>
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
              Create account
            </button>
          </form>
        </div>

        <div className="mt-6">
          <div className="mt-4 space-y-4">
            <GoogleAuthButton
              label="Continue with Google"
              redirect="/dashboard"
            />
          </div>
        </div>

        {status && <p className="mt-4 text-sm text-slate-300">{status}</p>}

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
