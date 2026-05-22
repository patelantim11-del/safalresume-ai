import Link from "next/link";

export default function CareerToolsPage() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16 sm:px-10">
      <div className="rounded-4xl border border-slate-800 bg-slate-900/90 p-10 shadow-2xl shadow-slate-950/40">
        <div className="mb-10">
          <p className="text-sm uppercase tracking-[0.3em] text-sky-400">
            Career Toolkit
          </p>
          <h1 className="mt-4 text-4xl font-semibold text-white sm:text-5xl">
            Smart hiring-ready tools for your career growth
          </h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-400">
            Use AI-powered resume analysis, job description matching, interview
            preparation, cover letters, and LinkedIn optimization from one
            career platform.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-4xl border border-slate-800 bg-slate-950/90 p-8">
            <h2 className="text-2xl font-semibold text-white">Resume Health</h2>
            <p className="mt-4 text-slate-400">
              Analyze your resume, get an ATS score, identify missing keywords,
              and get improvement recommendations.
            </p>
          </div>
          <div className="rounded-4xl border border-slate-800 bg-slate-950/90 p-8">
            <h2 className="text-2xl font-semibold text-white">
              Job Description Matching
            </h2>
            <p className="mt-4 text-slate-400">
              Paste any job description and receive skill extraction, match
              percentage, and keyword suggestions.
            </p>
          </div>
          <div className="rounded-4xl border border-slate-800 bg-slate-950/90 p-8">
            <h2 className="text-2xl font-semibold text-white">Career Growth</h2>
            <p className="mt-4 text-slate-400">
              Get project ideas, career roadmaps, trending skills, and LinkedIn
              recommendations for your chosen role.
            </p>
          </div>
          <div className="rounded-4xl border border-slate-800 bg-slate-950/90 p-8">
            <h2 className="text-2xl font-semibold text-white">
              Interview & Cover Letters
            </h2>
            <p className="mt-4 text-slate-400">
              Generate recruiter-ready cover letters and curated interview
              questions for HR, technical, and behavioral rounds.
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-slate-400">
            Ready to improve your resume and start applying faster?
          </p>
          <Link
            href="/resume"
            className="inline-flex items-center justify-center rounded-3xl bg-sky-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
          >
            Build or analyze resume
          </Link>
        </div>
      </div>
    </section>
  );
}
