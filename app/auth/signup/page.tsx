"use client";

import GoogleAuthButton from "@/components/GoogleAuthButton";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

export default function SignupPage() {
  const { register, handleSubmit } = useForm<{
    fullName: string;
    email: string;
    password: string;
  }>();
  const [status, setStatus] = useState<string | null>(null);
  const router = useRouter();

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
      if (res.status === 201) {
        // attempt to sign in via NextAuth credentials
        const signInRes = await signIn("credentials", {
          redirect: false,
          email: data.email,
          password: data.password,
        } as any);
        // navigate to dashboard regardless (NextAuth will set session cookie)
        router.push("/dashboard");
      } else {
        const j = await res.json();
        setStatus(j.error || "Failed to create account");
      }
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

        <div className="mt-8 space-y-6">
          <GoogleAuthButton
            label="Continue with Google"
            redirect="/dashboard"
          />

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <label className="block">
              <span className="text-sm text-slate-300">Full name</span>
              <input
                {...register("fullName")}
                className="mt-2 w-full rounded-lg border px-3 py-2 bg-slate-800 text-slate-100 border-slate-700"
              />
            </label>

            <label className="block">
              <span className="text-sm text-slate-300">Email</span>
              <input
                type="email"
                {...register("email")}
                className="mt-2 w-full rounded-lg border px-3 py-2 bg-slate-800 text-slate-100 border-slate-700"
              />
            </label>

            <label className="block">
              <span className="text-sm text-slate-300">Password</span>
              <input
                type="password"
                {...register("password")}
                className="mt-2 w-full rounded-lg border px-3 py-2 bg-slate-800 text-slate-100 border-slate-700"
              />
            </label>

            <button className="w-full rounded-2xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white">
              Create account
            </button>
          </form>
        </div>

        <p className="mt-6 text-sm text-slate-400">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-sky-400 hover:text-sky-300">
            Sign in
          </Link>
        </p>

        {status && <p className="mt-4 text-sm text-red-400">{status}</p>}
      </div>
    </main>
  );
}
