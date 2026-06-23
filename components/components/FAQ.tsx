"use client";
import { useState } from "react";

const faqs = [
  {
    question: "Is SafalResume AI free to use?",
    answer: "Yes! You can build and download 1 resume per month completely free. No credit card needed to get started. Upgrade to Pro or Career plans for unlimited access.",
  },
  {
    question: "Are the resumes really ATS-optimized?",
    answer: "Absolutely. All our templates are tested against ATS systems used by Indian companies including Naukri, LinkedIn, and major MNCs. Our AI also checks keyword density and formatting automatically.",
  },
  {
    question: "What resume types does SafalResume AI support?",
    answer: "We support 6+ resume types: Fresher Resume, Professional Resume, Internship Resume, ATS Resume, Portfolio Resume, and specialized formats for SOP and LOR documents.",
  },
  {
    question: "How does the AI resume builder work?",
    answer: "You fill a smart form with your details, and our AI (powered by GPT-4) generates professional bullet points, summaries, and skill suggestions tailored to your job title and industry.",
  },
  {
    question: "Can I save and edit my resume later?",
    answer: "Yes. All your resumes are saved securely with version history. Sign in with Google and access your resumes from any device, anytime.",
  },
  {
    question: "Is payment secure?",
    answer: "Yes. All payments are processed through Razorpay with industry-standard encryption. We never store your payment details on our servers.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="relative bg-slate-950 px-6 py-24 sm:px-10">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-fuchsia-500/40 to-transparent" />

      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-fuchsia-500/20 bg-fuchsia-500/10 px-4 py-1.5 text-sm font-medium text-fuchsia-300">
            ✦ FAQ
          </span>
          <h2 className="mt-5 text-4xl font-bold text-white sm:text-5xl">
            Frequently asked questions
          </h2>
          <p className="mt-4 text-lg text-slate-400">
            Everything you need to know about SafalResume AI.
          </p>
        </div>

        {/* Accordion */}
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={faq.question}
              className={`rounded-2xl border transition-all duration-200 ${
                openIndex === i
                  ? "border-violet-500/30 bg-slate-900/80"
                  : "border-white/5 bg-slate-900/40 hover:border-white/10"
              }`}
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
              >
                <span className="text-base font-medium text-white">{faq.question}</span>
                <span
                  className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border text-sm transition-all duration-200 ${
                    openIndex === i
                      ? "border-violet-500/50 bg-violet-500/20 text-violet-300 rotate-45"
                      : "border-white/10 bg-white/5 text-slate-400"
                  }`}
                >
                  +
                </span>
              </button>
              {openIndex === i && (
                <div className="px-6 pb-5">
                  <p className="text-sm leading-7 text-slate-400">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 rounded-2xl border border-white/5 bg-slate-900/40 p-8 text-center">
          <p className="text-lg font-semibold text-white">Still have questions?</p>
          <p className="mt-2 text-sm text-slate-400">
            Our team is here to help. Reach out and we will get back to you within 24 hours.
          </p>
          <a
            href="mailto:support@safalresume.com"
            className="mt-4 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-2.5 text-sm font-medium text-slate-300 transition-all hover:bg-white/10 hover:text-white"
          >
            Contact Support
          </a>
        </div>
      </div>
    </section>
  );
}
