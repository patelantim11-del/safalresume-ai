import Link from "next/link";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-900/80 bg-slate-950/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 sm:px-10">
        <Link
          href="/"
          className="text-2xl font-semibold tracking-tight text-slate-100"
        >
          SafalResume AI
        </Link>

        <nav className="flex items-center gap-3 text-sm text-slate-300 sm:gap-6">
          <Link href="/#features" className="transition hover:text-white">
            Features
          </Link>
          <Link href="/#pricing" className="transition hover:text-white">
            Pricing
          </Link>
          <Link href="/#faq" className="transition hover:text-white">
            FAQ
          </Link>
          <Link
            href="/resume"
            className="rounded-full bg-sky-500 px-4 py-2 text-slate-950 transition hover:bg-sky-400"
          >
            Build Resume
          </Link>
          <Link
            href="/auth/login"
            className="rounded-full border border-slate-700 px-4 py-2 text-slate-100 transition hover:border-slate-500"
          >
            Login
          </Link>
        </nav>
      </div>
    </header>
  );
}
