import Link from "next/link";

export default function DashboardHome() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16 sm:px-10">
      <div className="rounded-4xl border border-slate-800 bg-slate-900/90 p-10 shadow-2xl shadow-slate-950/40">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.3em] text-sky-400">
            Dashboard
          </p>
          <h1 className="mt-4 text-4xl font-semibold text-white sm:text-5xl">
            Your career toolkit dashboard
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-400">
            Manage your private resumes, track saved drafts, and stay in control
            of your Indian career journey.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          <Link
            href="/dashboard/resumes"
            className="rounded-3xl border border-slate-800 bg-slate-950 px-6 py-8 text-center transition hover:border-sky-500"
          >
            <p className="text-lg font-semibold text-white">My Resumes</p>
            <p className="mt-2 text-sm text-slate-400">
              View, edit, duplicate, and delete your saved resumes.
            </p>
          </Link>
          <Link
            href="/resume?new=true"
            className="rounded-3xl border border-slate-800 bg-slate-950 px-6 py-8 text-center transition hover:border-sky-500"
          >
            <p className="text-lg font-semibold text-white">Create Resume</p>
            <p className="mt-2 text-sm text-slate-400">
              Start a fresh resume with AI-powered tools and templates.
            </p>
          </Link>
          <Link
            href="/dashboard/profile"
            className="rounded-3xl border border-slate-800 bg-slate-950 px-6 py-8 text-center transition hover:border-sky-500"
          >
            <p className="text-lg font-semibold text-white">Profile</p>
            <p className="mt-2 text-sm text-slate-400">
              Review your account details and manage your profile.
            </p>
          </Link>
        </div>
      </div>
    </section>
  );
}
