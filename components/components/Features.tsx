import { Compass, Cpu, FileText, ShieldCheck, Sparkles, BookOpen } from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "AI Resume Builder",
    description: "Create polished, ATS-ready resumes with role-specific bullet points and India-friendly formatting. Supports 6 resume types.",
    badge: "Most Used",
    color: "violet",
  },
  {
    icon: ShieldCheck,
    title: "ATS Score Checker",
    description: "Measure resume fit, fix gaps, and improve your score for Naukri, LinkedIn, and hiring systems used by top Indian companies.",
    badge: null,
    color: "cyan",
  },
  {
    icon: Compass,
    title: "Job Match & Keywords",
    description: "Paste a job description to extract required skills, match your resume, and surface missing keywords instantly.",
    badge: null,
    color: "fuchsia",
  },
  {
    icon: Sparkles,
    title: "AI Cover Letter",
    description: "Draft personalized cover letters for startups, MNCs, and government roles in minutes. Multiple tones supported.",
    badge: null,
    color: "violet",
  },
  {
    icon: BookOpen,
    title: "SOP & LOR Generator",
    description: "Generate Statements of Purpose and Letters of Recommendation for colleges and universities with AI guidance.",
    badge: "Unique ✦",
    color: "cyan",
  },
  {
    icon: Cpu,
    title: "Career Assistant",
    description: "Get personalized career advice, skill mapping, and next-step coaching tailored for the Indian job market.",
    badge: null,
    color: "fuchsia",
  },
];

const colorMap: Record<string, { bg: string; icon: string; badge: string }> = {
  violet: {
    bg: "bg-violet-500/10 border-violet-500/20",
    icon: "text-violet-400",
    badge: "bg-violet-500/15 text-violet-300 border-violet-500/20",
  },
  cyan: {
    bg: "bg-cyan-500/10 border-cyan-500/20",
    icon: "text-cyan-400",
    badge: "bg-cyan-500/15 text-cyan-300 border-cyan-500/20",
  },
  fuchsia: {
    bg: "bg-fuchsia-500/10 border-fuchsia-500/20",
    icon: "text-fuchsia-400",
    badge: "bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/20",
  },
};

export default function Features() {
  return (
    <section id="features" className="relative bg-slate-950 px-6 py-24 sm:px-10">
      {/* Subtle top border glow */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />

      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-16 max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-1.5 text-sm font-medium text-violet-300">
            ✦ Career Toolkit
          </span>
          <h2 className="mt-5 text-4xl font-bold leading-tight text-white sm:text-5xl">
            Built for the next generation of{" "}
            <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
              Indian professionals
            </span>
          </h2>
          <p className="mt-4 text-lg leading-8 text-slate-400">
            From resumes to ATS scoring, cover letters, and career coaching — everything you need, in one place.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            const colors = colorMap[feature.color];
            const isLarge = i === 0; // First card is larger

            return (
              <div
                key={feature.title}
                className={`group relative rounded-2xl border border-white/5 bg-slate-900/60 p-6 transition-all duration-300 hover:border-white/10 hover:bg-slate-900/80 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/30 ${
                  isLarge ? "sm:col-span-2 lg:col-span-1" : ""
                }`}
              >
                {/* Icon */}
                <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl border ${colors.bg}`}>
                  <Icon size={22} className={colors.icon} />
                </div>

                {/* Badge */}
                {feature.badge && (
                  <span className={`absolute right-4 top-4 rounded-full border px-2.5 py-1 text-xs font-semibold ${colors.badge}`}>
                    {feature.badge}
                  </span>
                )}

                <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-400">{feature.description}</p>

                {/* Hover arrow */}
                <div className="mt-4 flex items-center gap-1 text-sm font-medium text-slate-500 transition-all duration-300 group-hover:text-slate-300">
                  Learn more
                  <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            );
          })}
        </div>

        {/* Stats row */}
        <div className="mt-12 grid grid-cols-2 gap-4 rounded-2xl border border-white/5 bg-slate-900/40 p-6 sm:grid-cols-4">
          {[
            { value: "10,000+", label: "Resumes Created" },
            { value: "94%", label: "Avg ATS Score" },
            { value: "6+", label: "Resume Types" },
            { value: "Free", label: "To Get Started" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl font-bold text-white sm:text-3xl">{stat.value}</p>
              <p className="mt-1 text-sm text-slate-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
