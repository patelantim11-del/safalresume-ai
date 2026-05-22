"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DashboardNav() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/auth/login");
  }

  return (
    <header className="no-print border-b border-slate-800 bg-slate-950/95 px-6 py-4 shadow-sm shadow-slate-950/20 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <Link href="/dashboard" className="text-lg font-semibold text-white">
            SafalResume AI
          </Link>
          <nav className="hidden md:flex flex-wrap items-center gap-3 text-slate-300">
            <Link href="/dashboard" className="transition hover:text-white">
              Dashboard
            </Link>
            <Link
              href="/dashboard/resumes"
              className="transition hover:text-white"
            >
              My Resumes
            </Link>
            <Link
              href="/dashboard/career-tools"
              className="transition hover:text-white"
            >
              Career Tools
            </Link>
            <Link href="/resume" className="transition hover:text-white">
              Create Resume
            </Link>
            <Link
              href="/dashboard/profile"
              className="transition hover:text-white"
            >
              Profile
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:block">
            <Link
              href="/resume"
              className="inline-flex items-center mr-3 rounded-3xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-emerald-400"
            >
              Create Resume
            </Link>
          </div>

          <div className="hidden sm:block">
            <Link
              href="/dashboard/resumes"
              className="inline-flex items-center mr-3 rounded-3xl bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-sky-400"
            >
              My Resumes
            </Link>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-100 transition hover:border-slate-500 disabled:opacity-50"
          >
            {isLoggingOut ? "Signing out..." : "Logout"}
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((s) => !s)}
            className="ml-2 inline-flex items-center rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 md:hidden"
            aria-label="Toggle menu"
          >
            {mobileOpen ? "Close" : "Menu"}
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <div className="md:hidden border-t border-slate-800 bg-slate-950/95 px-6 py-4">
          <nav className="flex flex-col gap-3 text-slate-300">
            <Link href="/dashboard" onClick={() => setMobileOpen(false)}>
              Dashboard
            </Link>
            <Link
              href="/dashboard/resumes"
              onClick={() => setMobileOpen(false)}
            >
              My Resumes
            </Link>
            <Link
              href="/dashboard/career-tools"
              onClick={() => setMobileOpen(false)}
            >
              Career Tools
            </Link>
            <Link href="/resume" onClick={() => setMobileOpen(false)}>
              Create Resume
            </Link>
            <Link
              href="/dashboard/profile"
              onClick={() => setMobileOpen(false)}
            >
              Profile
            </Link>
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                handleLogout();
              }}
              className="text-left text-sm text-rose-400"
            >
              Logout
            </button>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
