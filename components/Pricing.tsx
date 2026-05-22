const pricingPlans = [
  {
    name: "Starter",
    price: "Free",
    description:
      "Build one resume, generate cover letters, and get started with ATS basics.",
    perks: [
      "One resume",
      "AI resume builder",
      "Basic cover letter support",
      "Starter ATS check",
    ],
  },
  {
    name: "Pro",
    price: "₹499/mo",
    description:
      "Unlimited resumes, advanced ATS scoring, cover letters, and interview prep.",
    perks: [
      "Unlimited resumes",
      "AI cover letter generator",
      "ATS score insights",
      "Interview preparation",
    ],
    featured: true,
  },
  {
    name: "Career",
    price: "₹999/mo",
    description:
      "Complete career toolkit with guidance, priority support, and premium resources.",
    perks: [
      "Career guidance",
      "Priority support",
      "Interview coaching",
      "Premium templates",
    ],
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="bg-slate-950 px-6 py-20 sm:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 max-w-2xl">
          <p className="text-sm uppercase tracking-[0.3em] text-sky-400">
            Plans
          </p>
          <h2 className="mt-4 text-4xl font-semibold text-white sm:text-5xl">
            Plans built for every stage of your Indian career.
          </h2>
          <p className="mt-4 max-w-xl text-lg leading-8 text-slate-400">
            Choose the right toolkit for campus hires, working professionals,
            and career switchers.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {pricingPlans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-4xl border p-8 shadow-xl ${
                plan.featured
                  ? "border-sky-500 bg-slate-900/95 text-white"
                  : "border-slate-800 bg-slate-900/85 text-slate-200"
              }`}
            >
              <p className="text-sm uppercase tracking-[0.3em] text-sky-300">
                {plan.name}
              </p>
              <h3 className="mt-4 text-4xl font-semibold">{plan.price}</h3>
              <p className="mt-3 text-slate-400">{plan.description}</p>
              <ul className="mt-6 space-y-3 text-slate-300">
                {plan.perks.map((perk) => (
                  <li key={perk} className="flex items-center gap-3">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-sky-400">
                      ✓
                    </span>
                    {perk}
                  </li>
                ))}
              </ul>
              <button
                className={`mt-8 inline-flex w-full items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold transition ${
                  plan.featured
                    ? "bg-sky-500 text-slate-950 hover:bg-sky-400"
                    : "bg-slate-800 text-slate-100 hover:bg-slate-700"
                }`}
              >
                Choose {plan.name}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
