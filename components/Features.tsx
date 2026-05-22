import { Compass, Cpu, FileText, ShieldCheck, Sparkles } from "lucide-react";

const featureItems = [
  {
    title: "AI Resume Builder",
    description:
      "Create polished, ATS-ready resumes with role-specific bullets and India-friendly formatting.",
    icon: FileText,
  },
  {
    title: "ATS Resume Score Checker",
    description:
      "Measure resume fit, fix gaps, and improve your score for portals, recruiters, and hiring systems.",
    icon: ShieldCheck,
  },
  {
    title: "Job Match & Keyword Finder",
    description:
      "Paste a job description to extract required skills, match your resume, and surface missing keywords.",
    icon: Compass,
  },
  {
    title: "AI Cover Letter Generator",
    description:
      "Draft personalized cover letters for startups, corporates, and government roles in minutes.",
    icon: Sparkles,
  },
  {
    title: "Interview Preparation",
    description:
      "Practice common questions, refine your answers, and build confidence for calls and interviews.",
    icon: Cpu,
  },
  {
    title: "Career Guidance",
    description:
      "Get career advice, skill mapping, and next-step coaching tailored for India's job market.",
    icon: Compass,
  },
];

export default function Features() {
  return (
    <section id="features" className="bg-slate-950/90 px-6 py-20 sm:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 max-w-2xl">
          <p className="text-sm uppercase tracking-[0.3em] text-sky-400">
            Career Toolkit
          </p>
          <h2 className="mt-4 text-4xl font-semibold text-white sm:text-5xl">
            Built for the next generation of Indian professionals.
          </h2>
          <p className="mt-4 max-w-xl text-lg leading-8 text-slate-400">
            From resumes and cover letters to ATS scoring, interview prep, and
            career planning — SafalResume AI is designed for every stage of your
            Indian career journey.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {featureItems.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="rounded-4xl border border-slate-800 bg-slate-900/90 p-8 shadow-xl shadow-slate-950/10"
              >
                <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-sky-500/10 text-sky-300">
                  <Icon size={24} />
                </div>
                <h3 className="text-xl font-semibold text-white">
                  {feature.title}
                </h3>
                <p className="mt-3 text-slate-400">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
