"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

const rotatingWords = ["ATS Systems", "Top Recruiters", "Dream Companies", "Indian Job Portals"];

export default function Hero() {
  const [wordIndex, setWordIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setWordIndex((i) => (i + 1) % rotatingWords.length);
        setFade(true);
      }, 300);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative overflow-hidden bg-slate-950">
      {/* Background glow effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-violet-600/20 blur-[120px]" />
        <div className="absolute -right-40 top-20 h-96 w-96 rounded-full bg-cyan-600/15 blur-[120px]" />
        <div className="absolute bottom-0 left-1/2 h-64 w-96 -translate-x-1/2 rounded-full bg-violet-800/10 blur-[100px]" />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-6 py-24 sm:px-10 lg:py-32">
        {/* Eyebrow */}
        <div className="mb-8 flex justify-center lg:justify-start">
          <span className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-sm font-medium text-violet-300">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse" />
            Powered by AI · Built for India 🇮🇳
          </span>
        </div>

        <div className="flex flex-col gap-16 lg:flex-row lg:items-center lg:justify-between">
          {/* Left — Text content */}
          <div className="max-w-2xl text-center lg:text-left">
            <h1 className="text-5xl font-bold leading-[1.1] tracking-tight text-white sm:text-6xl lg:text-7xl">
              Resumes That Beat{" "}
              <span
                className={`bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent transition-opacity duration-300 ${
                  fade ? "opacity-100" : "opacity-0"
                }`}
              >
                {rotatingWords[wordIndex]}
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-400 mx-auto lg:mx-0">
              AI-powered resume builder with ATS optimization, cover letters, SOP, LOR,
              and career tools — designed for Indian freshers and professionals.
            </p>

            {/* Trust badges */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm text-slate-500 lg:justify-start">
              {["🔒 Google Sign In", "⚡ ATS Optimized", "📄 Free PDF Export", "🤖 GPT-4 Powered"].map((badge) => (
                <span key={badge} className="flex items-center gap-1.5">
                  {badge}
                </span>
              ))}
            </div>

            {/* CTAs */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
              <Link
                href="/dashboard"
                className="group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-cyan-600 px-8 py-4 text-sm font-semibold text-white shadow-xl shadow-violet-500/30 transition-all hover:shadow-violet-500/50 hover:scale-[1.02] active:scale-[0.98]"
              >
                Build My Resume — Free
                <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
              <Link
                href="/#features"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-sm font-semibold text-slate-300 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10 hover:text-white"
              >
                See Features
              </Link>
            </div>

            {/* Social proof */}
            <div className="mt-10 flex items-center justify-center gap-3 lg:justify-start">
              <div className="flex -space-x-2">
                {["🎓", "👨‍💼", "👩‍💻", "🧑‍🎓", "👩‍🔬"].map((emoji, i) => (
                  <div
                    key={i}
                    className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-slate-950 bg-slate-800 text-sm"
                  >
                    {emoji}
                  </div>
                ))}
              </div>
              <p className="text-sm text-slate-400">
                <span className="font-semibold text-white">10,000+</span> resumes built
              </p>
            </div>
          </div>

          {/* Right — Feature cards */}
          <div className="relative mx-auto w-full max-w-md lg:mx-0">
            {/* Main card */}
            <div className="relative rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-2xl backdrop-blur-sm">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-widest text-cyan-400">
                  SafalResume AI
                </span>
                <span className="rounded-full bg-green-500/15 px-3 py-1 text-xs font-medium text-green-400">
                  ✓ ATS Score: 94%
                </span>
              </div>

              {/* Document types grid */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[
                  { emoji: "📄", label: "Resume" },
                  { emoji: "🎓", label: "Fresher" },
                  { emoji: "💼", label: "Pro" },
                  { emoji: "🏢", label: "Internship" },
                  { emoji: "🎨", label: "Portfolio" },
                  { emoji: "📋", label: "SOP/LOR" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex flex-col items-center gap-1.5 rounded-2xl border border-white/5 bg-slate-800/60 px-2 py-3 text-center"
                  >
                    <span className="text-xl">{item.emoji}</span>
                    <span className="text-[11px] text-slate-400">{item.label}</span>
                  </div>
                ))}
              </div>

              {/* AI Features list */}
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">AI Career Toolkit</p>
                {[
                  "✦ AI Resume Builder & Optimizer",
                  "✦ ATS Score Checker",
                  "✦ Cover Letter Generator",
                  "✦ Career Assistant Chat",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 rounded-xl bg-slate-800/50 px-3 py-2.5 text-sm text-slate-300"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Floating badge */}
            <div className="absolute -right-4 -top-4 rounded-2xl border border-violet-500/30 bg-violet-900/80 px-4 py-2 text-sm font-semibold text-violet-300 backdrop-blur-sm shadow-lg">
              🇮🇳 Made for India
            </div>
            <div className="absolute -bottom-4 -left-4 rounded-2xl border border-cyan-500/30 bg-slate-900/90 px-4 py-2 text-sm font-semibold text-cyan-300 backdrop-blur-sm shadow-lg">
              ⚡ Instant PDF Export
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
