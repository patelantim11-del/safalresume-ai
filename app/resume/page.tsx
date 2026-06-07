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
      <section className="mx-auto max-w-[1600px] px-4 py-4 sm:px-6 lg:px-8">
        <div className="mb-4 border-b border-slate-800 pb-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-sky-400">
                Resume Builder
              </p>
              <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">
                Fill in your resume details
              </h1>
            </div>
            <p className="max-w-xl text-sm text-slate-400">
              Fill in your details, preview your layout, and export ATS-friendly
              PDF resumes instantly.
            </p>
          </div>
        </div>
        <div>
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
