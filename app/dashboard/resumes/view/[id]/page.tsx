import AutoPrint from "@/components/AutoPrint";
import { verifyToken } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { RESUMES_COLLECTION, type ResumeModel } from "@/models/resume";
import { ObjectId } from "mongodb";
import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

function buildContactLine(personalInfo: any) {
  return [
    personalInfo.email ? `📧 ${personalInfo.email}` : null,
    personalInfo.phone ? `📞 ${personalInfo.phone}` : null,
    personalInfo.location ? `📍 ${personalInfo.location}` : null,
    personalInfo.linkedin ? "LinkedIn" : null,
    personalInfo.github ? "GitHub" : null,
    personalInfo.website ? "Portfolio" : null,
  ]
    .filter(Boolean)
    .join(" | ");
}

function formatDateRange(start: string, end: string, current: boolean) {
  const startLabel = start ?? "";
  const endLabel = current ? "Present" : (end ?? "");
  return `${startLabel} — ${endLabel}`;
}

function getEducationYear(start?: string, end?: string) {
  const dateValue = end || start;
  if (!dateValue) return "Year";
  const year = new Date(dateValue).getFullYear();
  return Number.isNaN(year) ? "Year" : year.toString();
}

export default async function ResumeViewPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ print?: string }>;
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const token = (await cookies()).get("resume-auth")?.value;
  const payload = token ? verifyToken(token) : null;

  if (!payload) {
    redirect("/auth/login");
  }

  if (!ObjectId.isValid(resolvedParams.id)) {
    redirect("/dashboard/resumes");
  }

  const client = await connectToDatabase();
  const db = client.db();
  const resume = await db.collection(RESUMES_COLLECTION).findOne({
    _id: new ObjectId(resolvedParams.id),
    userId: payload.id,
  });

  if (!resume) {
    redirect("/dashboard/resumes");
  }

  const normalized = {
    ...(resume as any),
    id: resume._id?.toString(),
    _id: undefined,
    createdAt: resume.createdAt ?? resume.updatedAt,
    personalInfo: {
      photoUrl: "",
      linkedin: "",
      github: "",
      ...resume.personalInfo,
    },
  } as ResumeModel & { id: string };

  const shouldPrint = resolvedSearchParams?.print === "true";
  const contactLine = buildContactLine(normalized.personalInfo || {});

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {shouldPrint ? <AutoPrint /> : null}
      <section className="mx-auto max-w-5xl bg-white px-10 py-12 text-slate-950 print:bg-white print:text-slate-950">
        <div className="no-print mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-sky-400">
              Resume preview
            </p>
            <h1 className="mt-3 text-[36px] font-black tracking-tight text-slate-950">
              {normalized.personalInfo?.fullName || "Candidate Name"}
            </h1>
            <p className="mt-2 text-xl font-semibold uppercase tracking-[0.16em] text-slate-700">
              {normalized.personalInfo?.jobTitle || "Professional Title"}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard/resumes"
              className="rounded-3xl border border-slate-700 bg-slate-900 px-5 py-3 text-sm text-slate-100 transition hover:border-sky-500"
            >
              Back to resumes
            </Link>
            <Link
              href={`/resume?resumeId=${normalized.id}`}
              className="rounded-3xl border border-slate-700 bg-slate-900 px-5 py-3 text-sm text-slate-100 transition hover:border-sky-500"
            >
              Edit resume
            </Link>
          </div>
        </div>

        <article id="resume-preview" className="resume-document text-slate-950">
          <header className="space-y-6 border-b border-slate-200 pb-6">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-4">
                <h1 className="text-[34px] font-bold tracking-tight text-slate-950">
                  {normalized.personalInfo?.fullName || "Candidate Name"}
                </h1>
                <p className="text-lg font-semibold uppercase tracking-[0.16em] text-slate-700">
                  {normalized.personalInfo?.jobTitle || "Professional Title"}
                </p>
              </div>
              {normalized.personalInfo?.photoUrl ? (
                <div className="relative h-28 w-28 overflow-hidden rounded-full border border-slate-200">
                  <Image
                    src={normalized.personalInfo.photoUrl}
                    alt={`${normalized.personalInfo?.fullName} photo`}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : null}
            </div>
            <p className="text-sm leading-7 text-slate-700">
              {contactLine ||
                "📧 email | 📞 phone | 📍 location | LinkedIn | GitHub | Portfolio"}
            </p>
          </header>

          <div className="resume-body space-y-8 pt-8">
            <section className="resume-section">
              <h2 className="section-heading">Professional Summary</h2>
              <p className="mt-4 text-sm leading-7 text-slate-700">
                {normalized.personalInfo?.summary ||
                  "Results-driven software engineer with experience building scalable web applications and strong expertise in system design, performance optimization, and collaboration."}
              </p>
            </section>

            <section className="resume-section">
              <h2 className="section-heading">Work Experience</h2>
              <div className="mt-6 space-y-6">
                {normalized.experience?.map((item: any) => (
                  <div key={item.id} className="experience-item space-y-3">
                    <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                      <span className="text-base font-semibold text-slate-950">
                        {item.company || "Company"}
                      </span>
                      <span>•</span>
                      <span>{item.location || "Location"}</span>
                      <span>•</span>
                      <span>
                        {formatDateRange(
                          item.startDate,
                          item.endDate,
                          item.current,
                        )}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-slate-700">
                      {item.position || "Position"}
                    </p>
                    <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7 text-slate-700">
                      {item.description
                        ?.split("\n")
                        .filter(Boolean)
                        .map((line: string, index: number) => (
                          <li key={index}>{line}</li>
                        ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            <section className="resume-section">
              <h2 className="section-heading">Education</h2>
              <div className="mt-6 space-y-4">
                {normalized.education?.map((item: any) => (
                  <div key={item.id} className="education-item space-y-2">
                    <p className="text-base font-semibold text-slate-950">
                      {item.degree || "Degree"}
                    </p>
                    <p className="text-sm text-slate-600">
                      {item.school || "Institution"}
                    </p>
                    <p className="text-sm text-slate-600">
                      {getEducationYear(item.startDate, item.endDate)}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className="resume-section">
              <h2 className="section-heading">Skills</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {normalized.skills?.length
                  ? normalized.skills.map((skill: any) => (
                      <span
                        key={skill.id}
                        className="inline-flex rounded-full border border-slate-300 bg-slate-100 px-3 py-1 text-sm text-slate-700"
                      >
                        {skill.name || "Skill"}
                      </span>
                    ))
                  : ["React", "Next.js", "Node.js", "MongoDB"].map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex rounded-full border border-slate-300 bg-slate-100 px-3 py-1 text-sm text-slate-700"
                      >
                        {skill}
                      </span>
                    ))}
              </div>
            </section>

            <section className="resume-section">
              <h2 className="section-heading">Projects</h2>
              <div className="mt-6 space-y-5">
                {normalized.projects?.map((item: any) => (
                  <div key={item.id} className="project-item space-y-2">
                    <p className="text-base font-semibold text-slate-950">
                      {item.name || "Project Name"}
                    </p>
                    <p className="text-sm leading-7 text-slate-700">
                      {item.description ||
                        "Project details and impact statement."}
                    </p>
                    {item.link ? (
                      <p className="text-sm text-slate-600">{item.link}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            </section>

            <section className="resume-section grid gap-8 lg:grid-cols-[1fr_0.72fr]">
              <div className="space-y-8">
                <div>
                  <h2 className="section-heading">Certifications</h2>
                  <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-7 text-slate-700">
                    {normalized.certifications?.map((item: any) => (
                      <li key={item.id}>
                        {item.value || "Certification name"}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="space-y-8">
                <div>
                  <h2 className="section-heading">Languages</h2>
                  <p className="mt-4 text-sm leading-7 text-slate-700">
                    {normalized.languages
                      ?.map((item: any) => item.value)
                      .filter(Boolean)
                      .join(", ") || "English, Hindi"}
                  </p>
                </div>
              </div>
            </section>
          </div>
        </article>
      </section>
    </div>
  );
}
