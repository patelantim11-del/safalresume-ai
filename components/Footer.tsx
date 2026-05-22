import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-slate-950 px-6 py-10 text-slate-400 sm:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 border-t border-slate-800 pt-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-lg font-semibold text-slate-100">SafalResume AI</p>
          <p className="mt-2 text-sm text-slate-500">
            AI-powered resume creation for professionals and teams.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
          <Link href="/" className="transition hover:text-white">
            Home
          </Link>
          <Link href="/resume" className="transition hover:text-white">
            Builder
          </Link>
          <Link href="/auth/login" className="transition hover:text-white">
            Login
          </Link>
          <Link href="/auth/signup" className="transition hover:text-white">
            Signup
          </Link>
        </div>
      </div>
      <p className="mt-8 text-center text-xs text-slate-500">
        © 2026 SafalResume AI. All rights reserved.
      </p>
    </footer>
  );
}
