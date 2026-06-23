import Link from "next/link";

const links = {
  Product: [
    { label: "Resume Builder", href: "/resume" },
    { label: "ATS Checker", href: "/dashboard/ats-analyzer" },
    { label: "Cover Letter", href: "/dashboard/cover-letter" },
    { label: "Templates", href: "/resume" },
    { label: "Career Assistant", href: "/dashboard" },
  ],
  Documents: [
    { label: "Fresher Resume", href: "/resume" },
    { label: "Professional Resume", href: "/resume" },
    { label: "Internship Resume", href: "/resume" },
    { label: "SOP Generator", href: "/resume" },
    { label: "LOR Generator", href: "/resume" },
  ],
  Company: [
    { label: "About", href: "/" },
    { label: "Blog", href: "/blog" },
    { label: "Pricing", href: "/#pricing" },
    { label: "Privacy Policy", href: "/" },
    { label: "Terms of Service", href: "/" },
  ],
};

export default function Footer() {
  return (
    <footer className="relative border-t border-white/5 bg-slate-950 px-6 py-16 sm:px-10">
      {/* Top glow */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-700/50 to-transparent" />

      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 group w-fit">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 shadow-lg">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 2h7l3 3v9H3V2z" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
                  <path d="M10 2v3h3" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
                  <path d="M5 7h6M5 9.5h4" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
              </div>
              <span className="text-lg font-bold text-white">
                Safal<span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">Resume</span>
                <span className="ml-1 text-slate-500 font-normal text-sm">AI</span>
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-7 text-slate-500">
              AI-powered resume builder designed for Indian job seekers. Build, optimize, and download professional resumes in minutes.
            </p>
            <div className="mt-6 flex items-center gap-1.5">
              <span className="text-sm text-slate-600">Made with</span>
              <span className="text-red-400">♥</span>
              <span className="text-sm text-slate-600">in India 🇮🇳</span>
            </div>
          </div>

          {/* Links */}
          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-500">
                {category}
              </p>
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="text-sm text-slate-400 transition-colors hover:text-white"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 sm:flex-row">
          <p className="text-xs text-slate-600">
            © 2026 SafalResume AI. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1 text-xs text-green-400">
              ● All systems operational
            </span>
            <span className="text-xs text-slate-600">v2.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
