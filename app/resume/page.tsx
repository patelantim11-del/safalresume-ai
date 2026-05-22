import ResumeForm from "@/components/ResumeForm";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export default async function ResumePage() {
  const token = (await cookies()).get("resume-auth")?.value;
  const payload = token ? verifyToken(token) : null;

  if (!payload) {
    redirect("/auth/login");
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <section className="mx-auto max-w-7xl px-6 py-10 sm:px-10">
        <div className="mb-10 rounded-4xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl shadow-slate-950/40">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-sky-400">
                Resume Builder
              </p>
              <h1 className="mt-3 text-4xl font-semibold sm:text-5xl">
                Create your professional resume with AI.
              </h1>
            </div>
            <p className="max-w-xl text-slate-400">
              Fill in your details, preview your layout, and export ATS-friendly
              PDF resumes instantly.
            </p>
          </div>
          <Suspense
            fallback={<div className="text-slate-400">Loading editor...</div>}
          >
            <ResumeForm />
          </Suspense>
        </div>
      </section>
    </main>
  );
}
