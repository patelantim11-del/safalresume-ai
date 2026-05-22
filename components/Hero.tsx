import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-slate-950 text-slate-100">
      <div className="absolute inset-x-0 top-0 h-80 bg-linear-to-b from-sky-500/20 to-transparent" />
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-6 py-24 sm:px-10 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl space-y-8">
          <span className="inline-flex rounded-full bg-sky-500/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.24em] text-sky-300">
            Indian AI Career Toolkit
          </span>
          <h1 className="text-5xl font-semibold tracking-tight text-white sm:text-6xl">
            Launch your next chapter with a premium Indian AI career toolkit.
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-slate-300">
            SafalResume AI helps you build ATS-ready resumes, score your
            applications, generate cover letters, and prepare for interviews
            with India-focused career guidance.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/resume"
              className="inline-flex items-center justify-center rounded-3xl bg-sky-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
            >
              Start your career
            </Link>
            <Link
              href="/auth/signup"
              className="inline-flex items-center justify-center rounded-3xl border border-slate-700 px-6 py-3 text-sm text-slate-200 transition hover:border-slate-500"
            >
              Create account
            </Link>
          </div>
        </div>
        <div className="relative max-w-xl rounded-4xl border border-slate-800 bg-slate-900/85 p-8 shadow-2xl shadow-slate-950/30">
          <div className="space-y-4">
            <div className="rounded-4xl bg-slate-950/90 p-6">
              <p className="text-slate-300">
                Designed for the Indian job market
              </p>
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="rounded-3xl bg-slate-900 p-4 text-xs uppercase tracking-[0.18em] text-slate-400">
                  Campus
                </div>
                <div className="rounded-3xl bg-slate-900 p-4 text-xs uppercase tracking-[0.18em] text-slate-400">
                  Corporate
                </div>
                <div className="rounded-3xl bg-slate-900 p-4 text-xs uppercase tracking-[0.18em] text-slate-400">
                  Startup
                </div>
                <div className="rounded-3xl bg-slate-900 p-4 text-xs uppercase tracking-[0.18em] text-slate-400">
                  Government
                </div>
              </div>
            </div>
            <div className="rounded-4xl bg-slate-950/95 p-5 text-slate-300">
              <p className="text-sm uppercase tracking-[0.24em] text-sky-400">
                Career Toolkit
              </p>
              <ul className="mt-4 space-y-3 text-sm leading-6">
                <li>AI Resume Builder</li>
                <li>ATS Resume Score Checker</li>
                <li>AI Cover Letter Generator</li>
                <li>Interview Preparation</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
