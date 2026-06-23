"use client";
import { useState } from "react";
import Link from "next/link";

const plans = [
  {
    name: "Starter",
    monthlyPrice: "Free",
    annualPrice: "Free",
    description: "Perfect for freshers and first-time job seekers.",
    perks: [
      "1 Resume download/month",
      "AI Resume Builder",
      "Basic ATS Check (3/month)",
      "Cover Letter (1/month)",
      "Standard templates",
    ],
    cta: "Get Started Free",
    href: "/auth/signup",
    featured: false,
  },
  {
    name: "Pro",
    monthlyPrice: "₹299",
    annualPrice: "₹199",
    description: "For active job seekers who need unlimited power.",
    perks: [
      "Unlimited resume downloads",
      "All AI features unlimited",
      "Advanced ATS Analyzer",
      "Cover Letter + SOP + LOR",
      "All premium templates",
      "Version history",
      "Priority support",
    ],
    cta: "Start Pro — ₹299/mo",
    href: "/auth/signup?plan=pro",
    featured: true,
  },
  {
    name: "Career",
    monthlyPrice: "₹599",
    annualPrice: "₹399",
    description: "Complete career growth toolkit for professionals.",
    perks: [
      "Everything in Pro",
      "Career Assistant (unlimited)",
      "Interview Preparation AI",
      "LinkedIn Profile Optimizer",
      "1-on-1 career coaching",
      "Government job resume",
      "Dedicated support",
    ],
    cta: "Start Career Plan",
    href: "/auth/signup?plan=career",
    featured: false,
  },
];

export default function Pricing() {
  const [annual, setAnnual] = useState(false);

  return (
    <section id="pricing" className="relative bg-slate-950 px-6 py-24 sm:px-10">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />

      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-1.5 text-sm font-medium text-cyan-300">
            ✦ Pricing
          </span>
          <h2 className="mt-5 text-4xl font-bold text-white sm:text-5xl">
            Plans for every{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
              career stage
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-slate-400">
            From campus placements to senior roles — pick what fits your journey.
          </p>

          {/* Toggle */}
          <div className="mt-8 inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/60 p-1.5">
            <button
              onClick={() => setAnnual(false)}
              className={`rounded-xl px-5 py-2 text-sm font-medium transition-all ${
                !annual ? "bg-white text-slate-950 shadow-sm" : "text-slate-400 hover:text-white"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`rounded-xl px-5 py-2 text-sm font-medium transition-all ${
                annual ? "bg-white text-slate-950 shadow-sm" : "text-slate-400 hover:text-white"
              }`}
            >
              Annual
              <span className="ml-2 rounded-full bg-green-500/15 px-2 py-0.5 text-xs text-green-400">
                Save 33%
              </span>
            </button>
          </div>
        </div>

        {/* Cards */}
        <div className="grid gap-4 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-2xl border p-6 transition-all duration-300 ${
                plan.featured
                  ? "border-violet-500/50 bg-gradient-to-b from-violet-950/80 to-slate-900/80 shadow-2xl shadow-violet-500/20 scale-[1.02]"
                  : "border-white/5 bg-slate-900/60 hover:border-white/10"
              }`}
            >
              {plan.featured && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-gradient-to-r from-violet-600 to-cyan-600 px-4 py-1 text-xs font-bold text-white shadow-lg">
                    ✦ Most Popular
                  </span>
                </div>
              )}

              <div>
                <p className={`text-sm font-semibold uppercase tracking-widest ${plan.featured ? "text-violet-400" : "text-slate-500"}`}>
                  {plan.name}
                </p>
                <div className="mt-3 flex items-end gap-1">
                  <span className="text-4xl font-bold text-white">
                    {annual ? plan.annualPrice : plan.monthlyPrice}
                  </span>
                  {plan.monthlyPrice !== "Free" && (
                    <span className="mb-1 text-slate-400">/mo</span>
                  )}
                </div>
                {annual && plan.monthlyPrice !== "Free" && (
                  <p className="mt-1 text-xs text-slate-500">
                    Billed annually · was {plan.monthlyPrice}/mo
                  </p>
                )}
                <p className="mt-3 text-sm text-slate-400">{plan.description}</p>
              </div>

              <ul className="mt-6 flex-1 space-y-3">
                {plan.perks.map((perk) => (
                  <li key={perk} className="flex items-start gap-2.5 text-sm text-slate-300">
                    <span className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-xs ${plan.featured ? "bg-violet-500/20 text-violet-300" : "bg-white/5 text-slate-400"}`}>
                      ✓
                    </span>
                    {perk}
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={`mt-8 block rounded-xl py-3 text-center text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] ${
                  plan.featured
                    ? "bg-gradient-to-r from-violet-600 to-cyan-600 text-white shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50"
                    : "border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <p className="mt-8 text-center text-sm text-slate-600">
          No credit card required for free plan · Cancel anytime · Payments via Razorpay 🔒
        </p>
      </div>
    </section>
  );
}
