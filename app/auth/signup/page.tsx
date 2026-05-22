"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

type SignupValues = {
  fullName: string;
  email: string;
  password: string;
};

const signupSchema = z.object({
  fullName: z.string().min(2, "Please enter your name"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export default function SignupPage() {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"success" | "error" | null>(
    null,
  );
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupValues>({ resolver: zodResolver(signupSchema) });

  async function onSubmit(data: SignupValues) {
    setMessage(null);
    setMessageType(null);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        const errorMessage =
          result?.error ||
          result?.details ||
          "Signup failed. Please try again.";
        setMessage(errorMessage);
        setMessageType("error");
        return;
      }

      setMessage("Account created successfully. Redirecting...");
      setMessageType("success");
      router.push("/resume");
    } catch (error: any) {
      const errorMessage = error?.message || "Unable to reach signup service.";
      setMessage(errorMessage);
      setMessageType("error");
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

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
          <label className="block">
            <span className="text-sm text-slate-300">Full name</span>
            <input
              type="text"
              {...register("fullName")}
              className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950/90 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-500"
            />
            {errors.fullName && (
              <p className="mt-2 text-red-400 text-sm">
                {errors.fullName.message}
              </p>
            )}
          </label>

          <label className="block">
            <span className="text-sm text-slate-300">Email</span>
            <input
              type="email"
              {...register("email")}
              className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950/90 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-500"
            />
            {errors.email && (
              <p className="mt-2 text-red-400 text-sm">
                {errors.email.message}
              </p>
            )}
          </label>

          <label className="block">
            <span className="text-sm text-slate-300">Password</span>
            <input
              type="password"
              {...register("password")}
              className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950/90 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-500"
            />
            {errors.password && (
              <p className="mt-2 text-red-400 text-sm">
                {errors.password.message}
              </p>
            )}
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-2xl bg-sky-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Creating account..." : "Get started"}
          </button>

          {message && (
            <div
              className={`rounded-2xl px-4 py-3 text-sm ${
                messageType === "success"
                  ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                  : "bg-red-500/10 text-red-300 border border-red-500/20"
              }`}
            >
              {message}
            </div>
          )}
        </form>

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
