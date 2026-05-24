import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-linear-to-br from-gray-900 via-gray-800 to-black text-slate-100">
      <div className="absolute inset-x-0 top-0 h-80 bg-linear-to-b from-blue-500/20 to-transparent" />
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-6 py-24 sm:px-10 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl space-y-8">
          <span className="inline-flex rounded-full bg-blue-500/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.24em] text-blue-300">
            SAFALPROFILE AI
          </span>
          <h1 className="text-5xl font-semibold tracking-tight text-white sm:text-6xl">
            Create professional resumes, biodatas, portfolios and profiles with
            AI
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-gray-300">
            SAFALPROFILE AI is your universal AI profile builder. Generate
            resumes, marriage biodatas, CVs, freelancer profiles, business
            profiles, and 10+ more document types with ATS optimization, cover
            letter generation, and AI career tools.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-lg bg-linear-to-r from-blue-500 to-purple-600 px-8 py-4 text-sm font-semibold text-white transition hover:shadow-lg hover:shadow-blue-500/50"
            >
              Start Building Now
            </Link>
            <Link
              href="/auth/signup"
              className="inline-flex items-center justify-center rounded-lg border border-white/20 px-8 py-4 text-sm text-white transition hover:border-white/40 hover:bg-white/5"
            >
              Create Free Account
            </Link>
          </div>
        </div>

        <div className="relative max-w-xl rounded-2xl border border-white/10 bg-white/5 backdrop-blur-lg p-8">
          <div className="space-y-4">
            <div className="rounded-lg bg-gray-900/50 p-6 border border-white/10">
              <p className="text-gray-300">15 Document Types Supported</p>
              <div className="mt-6 grid grid-cols-3 gap-3">
                <div className="rounded-lg bg-gray-800 p-3 text-xs text-gray-400 text-center">
                  📄 Resume
                </div>
                <div className="rounded-lg bg-gray-800 p-3 text-xs text-gray-400 text-center">
                  💍 Biodata
                </div>
                <div className="rounded-lg bg-gray-800 p-3 text-xs text-gray-400 text-center">
                  🎨 Portfolio
                </div>
                <div className="rounded-lg bg-gray-800 p-3 text-xs text-gray-400 text-center">
                  💼 Freelancer
                </div>
                <div className="rounded-lg bg-gray-800 p-3 text-xs text-gray-400 text-center">
                  🏢 Business
                </div>
                <div className="rounded-lg bg-gray-800 p-3 text-xs text-gray-400 text-center">
                  + 10 More
                </div>
              </div>
            </div>
            <div className="rounded-3xl bg-slate-900 p-4 text-xs uppercase tracking-[0.18em] text-slate-400">
              Government
            </div>
          </div>

          <div className="rounded-4xl bg-slate-950/95 p-5 text-slate-300 mt-6">
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
    </section>
  );
}
