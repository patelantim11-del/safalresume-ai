const faqs = [
  {
    question: "Can I save multiple resumes?",
    answer:
      "Yes. The platform stores your resume drafts so you can update them any time.",
  },
  {
    question: "Do templates support ATS formatting?",
    answer:
      "Absolutely. All templates are optimized for applicant tracking systems and recruiter review.",
  },
  {
    question: "How do AI features work?",
    answer:
      "The AI tools analyze your profile and suggest polished summaries, skills, experience descriptions, and project language.",
  },
  {
    question: "Is payment secure?",
    answer:
      "Payments are processed through Razorpay with industry-standard encryption and webhook validation.",
  },
];

export default function FAQ() {
  return (
    <section id="faq" className="bg-slate-900 px-6 py-20 sm:px-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12">
          <p className="text-sm uppercase tracking-[0.3em] text-sky-400">FAQ</p>
          <h2 className="mt-4 text-4xl font-semibold text-white sm:text-5xl">
            Frequently asked questions
          </h2>
        </div>
        <div className="grid gap-5">
          {faqs.map((item) => (
            <div
              key={item.question}
              className="rounded-4xl border border-slate-800 bg-slate-950/90 p-8"
            >
              <h3 className="text-xl font-semibold text-white">
                {item.question}
              </h3>
              <p className="mt-3 text-slate-400">{item.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
