"use client";

import { exportPreviewPdf } from "@/lib/exportPdf";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

const portfolioSchema = z.object({
  title: z.string().min(3),
  template: z.enum(["minimal", "creative", "professional"] as const),
  personalInfo: z.object({
    fullName: z.string().min(2),
    email: z.string().email(),
    phone: z.string().min(6),
    location: z.string().optional(),
    jobTitle: z.string().optional(),
    linkedin: z.string().optional(),
    github: z.string().optional(),
    website: z.string().optional(),
    photoUrl: z.string().optional(),
    summary: z.string().optional(),
  }),
  about: z.string().optional(),
  skills: z
    .array(z.object({ id: z.string(), name: z.string().min(1) }))
    .default([]),
  projects: z
    .array(
      z.object({
        id: z.string(),
        name: z.string().min(1),
        description: z.string().optional(),
        link: z.string().optional(),
        image: z.string().optional(),
        technologies: z.string().optional(),
      }),
    )
    .default([]),
  experience: z
    .array(
      z.object({
        id: z.string(),
        company: z.string().min(1),
        position: z.string().min(1),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        description: z.string().optional(),
      }),
    )
    .default([]),
  testimonials: z
    .array(
      z.object({
        id: z.string(),
        author: z.string().optional(),
        text: z.string().optional(),
        role: z.string().optional(),
      }),
    )
    .default([]),
  contact: z
    .array(
      z.object({
        id: z.string(),
        label: z.string().min(1),
        url: z.string().min(1),
      }),
    )
    .default([]),
});

type PortfolioValues = z.infer<typeof portfolioSchema>;

type Props = {
  initialData?: Partial<PortfolioValues> | null;
  onSave?: (values: PortfolioValues) => Promise<{ id?: string } | void>;
  multiStep?: boolean;
};

function createId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}

const defaultValues: PortfolioValues = {
  title: "Portfolio",
  template: "professional",
  personalInfo: {
    fullName: "",
    email: "",
    phone: "",
    location: "",
    jobTitle: "",
    linkedin: "",
    github: "",
    website: "",
    photoUrl: "",
    summary: "",
  },
  about: "",
  skills: [{ id: "skill-0", name: "" }],
  projects: [
    {
      id: "proj-0",
      name: "",
      description: "",
      link: "",
      image: "",
      technologies: "",
    },
  ],
  experience: [
    {
      id: "exp-0",
      company: "",
      position: "",
      startDate: "",
      endDate: "",
      description: "",
    },
  ],
  testimonials: [{ id: "test-0", author: "", text: "", role: "" }],
  contact: [{ id: "contact-0", label: "", url: "" }],
};

export default function PortfolioForm({
  initialData = null,
  onSave,
  multiStep = true,
}: Props) {
  const form = useForm<PortfolioValues>({
    resolver: zodResolver(portfolioSchema),
    defaultValues,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(0);
  const autoSaveTimer = useRef<number | null>(null);

  const skillsFields = useFieldArray({ name: "skills", control: form.control });
  const projectFields = useFieldArray({
    name: "projects",
    control: form.control,
  });
  const experienceFields = useFieldArray({
    name: "experience",
    control: form.control,
  });
  const testimonialFields = useFieldArray({
    name: "testimonials",
    control: form.control,
  });
  const contactFields = useFieldArray({
    name: "contact",
    control: form.control,
  });

  useEffect(() => {
    if (initialData) {
      form.reset({ ...defaultValues, ...initialData } as any);
    }
    setMounted(true);
  }, [initialData, form]);

  useEffect(() => {
    if (!onSave) return;
    const subscription = form.watch(() => {
      if (autoSaveTimer.current) window.clearTimeout(autoSaveTimer.current);
      autoSaveTimer.current = window.setTimeout(async () => {
        try {
          setIsSaving(true);
          await onSave(form.getValues());
        } catch {
        } finally {
          setIsSaving(false);
        }
      }, 2500) as unknown as number;
    });
    return () => {
      subscription.unsubscribe?.();
      if (autoSaveTimer.current) window.clearTimeout(autoSaveTimer.current);
    };
  }, [form, onSave]);

  async function onSubmit(values: PortfolioValues) {
    setIsSaving(true);
    try {
      await onSave?.(values);
    } finally {
      setIsSaving(false);
    }
  }

  function nextStep() {
    setStep((current) => Math.min(5, current + 1));
  }

  function prevStep() {
    setStep((current) => Math.max(0, current - 1));
  }

  const preview = form.watch();
  const stepLabels = [
    "Personal",
    "About & Skills",
    "Projects",
    "Experience",
    "Testimonials",
    "Contact",
  ];

  const stepContent = (
    <>
      {step === 0 && (
        <section className="space-y-4 rounded-3xl border border-slate-800 bg-slate-950/90 p-6">
          <h3 className="text-xl font-semibold text-white">
            Personal Information
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <input
              {...form.register("personalInfo.fullName")}
              placeholder="Full name"
              className="rounded-3xl bg-slate-900 px-4 py-3 text-white"
            />
            <input
              {...form.register("personalInfo.jobTitle")}
              placeholder="Job title"
              className="rounded-3xl bg-slate-900 px-4 py-3 text-white"
            />
            <input
              {...form.register("personalInfo.email")}
              placeholder="Email"
              className="rounded-3xl bg-slate-900 px-4 py-3 text-white"
            />
            <input
              {...form.register("personalInfo.phone")}
              placeholder="Phone"
              className="rounded-3xl bg-slate-900 px-4 py-3 text-white"
            />
            <input
              {...form.register("personalInfo.location")}
              placeholder="Location"
              className="rounded-3xl bg-slate-900 px-4 py-3 text-white"
            />
            <input
              {...form.register("personalInfo.website")}
              placeholder="Website URL"
              className="rounded-3xl bg-slate-900 px-4 py-3 text-white"
            />
            <input
              {...form.register("personalInfo.linkedin")}
              placeholder="LinkedIn"
              className="rounded-3xl bg-slate-900 px-4 py-3 text-white"
            />
            <input
              {...form.register("personalInfo.github")}
              placeholder="GitHub"
              className="rounded-3xl bg-slate-900 px-4 py-3 text-white"
            />
            <input
              {...form.register("personalInfo.photoUrl")}
              placeholder="Profile photo URL"
              className="rounded-3xl bg-slate-900 px-4 py-3 text-white sm:col-span-2"
            />
          </div>
        </section>
      )}

      {step === 1 && (
        <section className="space-y-4 rounded-3xl border border-slate-800 bg-slate-950/90 p-6">
          <h3 className="text-xl font-semibold text-white">About & Skills</h3>
          <textarea
            {...form.register("about")}
            placeholder="About you..."
            rows={5}
            className="w-full rounded-3xl bg-slate-900 px-4 py-3 text-white"
          />
          <div className="border-t border-slate-700 pt-4">
            <div className="flex items-center justify-between gap-4 mb-4">
              <h4 className="text-sm font-semibold text-white">Skills</h4>
              <button
                type="button"
                onClick={() =>
                  skillsFields.append({ id: createId("skill"), name: "" })
                }
                className="rounded-3xl bg-slate-800 px-4 py-3 text-white"
              >
                Add skill
              </button>
            </div>
            <div className="grid gap-3">
              {skillsFields.fields.map((field, index) => (
                <div key={field.id} className="flex gap-2">
                  <input
                    {...form.register(`skills.${index}.name`)}
                    placeholder="Skill"
                    className="flex-1 rounded-3xl bg-slate-950 px-4 py-3 text-white"
                  />
                  <button
                    type="button"
                    onClick={() => skillsFields.remove(index)}
                    className="rounded-3xl bg-slate-800 px-4 py-3 text-white"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {step === 2 && (
        <section className="space-y-4 rounded-3xl border border-slate-800 bg-slate-950/90 p-6">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-xl font-semibold text-white">Projects</h3>
            <button
              type="button"
              onClick={() =>
                projectFields.append({
                  id: createId("proj"),
                  name: "",
                  description: "",
                  link: "",
                  image: "",
                  technologies: "",
                })
              }
              className="rounded-3xl bg-slate-800 px-4 py-3 text-white"
            >
              Add project
            </button>
          </div>
          <div className="space-y-4">
            {projectFields.fields.map((field, index) => (
              <div key={field.id} className="rounded-3xl bg-slate-900 p-4">
                <input
                  {...form.register(`projects.${index}.name`)}
                  placeholder="Project name"
                  className="w-full rounded-3xl bg-slate-950 px-4 py-3 text-white"
                />
                <textarea
                  {...form.register(`projects.${index}.description`)}
                  placeholder="Description"
                  rows={2}
                  className="mt-4 w-full rounded-3xl bg-slate-950 px-4 py-3 text-white"
                />
                <input
                  {...form.register(`projects.${index}.link`)}
                  placeholder="Project link"
                  className="mt-4 w-full rounded-3xl bg-slate-950 px-4 py-3 text-white"
                />
                <input
                  {...form.register(`projects.${index}.image`)}
                  placeholder="Project image URL"
                  className="mt-4 w-full rounded-3xl bg-slate-950 px-4 py-3 text-white"
                />
                <input
                  {...form.register(`projects.${index}.technologies`)}
                  placeholder="Technologies used"
                  className="mt-4 w-full rounded-3xl bg-slate-950 px-4 py-3 text-white"
                />
                <button
                  type="button"
                  onClick={() => projectFields.remove(index)}
                  className="mt-4 rounded-2xl bg-slate-800 px-4 py-2 text-sm text-white"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {step === 3 && (
        <section className="space-y-4 rounded-3xl border border-slate-800 bg-slate-950/90 p-6">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-xl font-semibold text-white">Experience</h3>
            <button
              type="button"
              onClick={() =>
                experienceFields.append({
                  id: createId("exp"),
                  company: "",
                  position: "",
                  startDate: "",
                  endDate: "",
                  description: "",
                })
              }
              className="rounded-3xl bg-slate-800 px-4 py-3 text-white"
            >
              Add experience
            </button>
          </div>
          <div className="space-y-4">
            {experienceFields.fields.map((field, index) => (
              <div key={field.id} className="rounded-3xl bg-slate-900 p-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <input
                    {...form.register(`experience.${index}.company`)}
                    placeholder="Company"
                    className="rounded-3xl bg-slate-950 px-4 py-3 text-white"
                  />
                  <input
                    {...form.register(`experience.${index}.position`)}
                    placeholder="Position"
                    className="rounded-3xl bg-slate-950 px-4 py-3 text-white"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2 mt-4">
                  <input
                    type="month"
                    {...form.register(`experience.${index}.startDate`)}
                    className="rounded-3xl bg-slate-950 px-4 py-3 text-white"
                  />
                  <input
                    type="month"
                    {...form.register(`experience.${index}.endDate`)}
                    className="rounded-3xl bg-slate-950 px-4 py-3 text-white"
                  />
                </div>
                <textarea
                  {...form.register(`experience.${index}.description`)}
                  placeholder="Description"
                  rows={2}
                  className="mt-4 w-full rounded-3xl bg-slate-950 px-4 py-3 text-white"
                />
                <button
                  type="button"
                  onClick={() => experienceFields.remove(index)}
                  className="mt-4 rounded-2xl bg-slate-800 px-4 py-2 text-sm text-white"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {step === 4 && (
        <section className="space-y-4 rounded-3xl border border-slate-800 bg-slate-950/90 p-6">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-xl font-semibold text-white">Testimonials</h3>
            <button
              type="button"
              onClick={() =>
                testimonialFields.append({
                  id: createId("test"),
                  author: "",
                  text: "",
                  role: "",
                })
              }
              className="rounded-3xl bg-slate-800 px-4 py-3 text-white"
            >
              Add testimonial
            </button>
          </div>
          <div className="space-y-4">
            {testimonialFields.fields.map((field, index) => (
              <div key={field.id} className="rounded-3xl bg-slate-900 p-4">
                <textarea
                  {...form.register(`testimonials.${index}.text`)}
                  placeholder="Testimonial text"
                  rows={2}
                  className="w-full rounded-3xl bg-slate-950 px-4 py-3 text-white"
                />
                <input
                  {...form.register(`testimonials.${index}.author`)}
                  placeholder="Author name"
                  className="mt-4 w-full rounded-3xl bg-slate-950 px-4 py-3 text-white"
                />
                <input
                  {...form.register(`testimonials.${index}.role`)}
                  placeholder="Author role"
                  className="mt-4 w-full rounded-3xl bg-slate-950 px-4 py-3 text-white"
                />
                <button
                  type="button"
                  onClick={() => testimonialFields.remove(index)}
                  className="mt-4 rounded-2xl bg-slate-800 px-4 py-2 text-sm text-white"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {step === 5 && (
        <section className="space-y-4 rounded-3xl border border-slate-800 bg-slate-950/90 p-6">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-xl font-semibold text-white">Contact Links</h3>
            <button
              type="button"
              onClick={() =>
                contactFields.append({
                  id: createId("contact"),
                  label: "",
                  url: "",
                })
              }
              className="rounded-3xl bg-slate-800 px-4 py-3 text-white"
            >
              Add link
            </button>
          </div>
          <div className="space-y-3">
            {contactFields.fields.map((field, index) => (
              <div key={field.id} className="flex gap-2">
                <input
                  {...form.register(`contact.${index}.label`)}
                  placeholder="Label (e.g., Email)"
                  className="flex-1 rounded-3xl bg-slate-950 px-4 py-3 text-white"
                />
                <input
                  {...form.register(`contact.${index}.url`)}
                  placeholder="URL or address"
                  className="flex-1 rounded-3xl bg-slate-950 px-4 py-3 text-white"
                />
                <button
                  type="button"
                  onClick={() => contactFields.remove(index)}
                  className="rounded-3xl bg-slate-800 px-4 py-3 text-white"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );

  const previewPane = (
    <div className="rounded-3xl border border-slate-800 bg-slate-950/90 p-6 text-white">
      <h3 className="text-xl font-semibold">Portfolio Preview</h3>
      <div className="mt-4 space-y-4 text-sm text-slate-300">
        <p className="text-lg font-semibold text-white">
          {preview.personalInfo.fullName || "Your Name"}
        </p>
        <p className="text-slate-400">
          {preview.personalInfo.jobTitle || "Job Title"}
        </p>
        <p className="line-clamp-2">{preview.about || "About section..."}</p>
        <div>
          <p className="font-semibold text-white">
            Projects: {preview.projects.filter((p) => p.name).length}
          </p>
        </div>
        <div>
          <p className="font-semibold text-white">Skills</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {preview.skills
              .filter((item) => item.name)
              .slice(0, 5)
              .map((skill) => (
                <span
                  key={skill.id}
                  className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-200"
                >
                  {skill.name}
                </span>
              ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr,0.85fr]">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm text-slate-200">
            Portfolio title
            <input
              {...form.register("title")}
              className="mt-2 w-full rounded-3xl bg-slate-900 px-4 py-3 text-white"
            />
          </label>
          <label className="block text-sm text-slate-200">
            Template
            <select
              {...form.register("template")}
              className="mt-2 w-full rounded-3xl bg-slate-900 px-4 py-3 text-white"
            >
              <option value="minimal">Minimal</option>
              <option value="creative">Creative</option>
              <option value="professional">Professional</option>
            </select>
          </label>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-sky-400">
                Portfolio
              </p>
              <h2 className="text-3xl font-semibold text-white">
                Showcase Your Work
              </h2>
            </div>
            <div className="text-slate-400">
              {multiStep
                ? `Step ${step + 1} of ${stepLabels.length}`
                : "Full form"}
            </div>
          </div>
          {stepContent}
          <div className="flex items-center justify-between gap-3 pt-4">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={prevStep}
                disabled={!multiStep || step === 0}
                className="rounded-3xl bg-slate-800 px-4 py-3 text-white disabled:opacity-50"
              >
                Back
              </button>
              <button
                type="button"
                onClick={nextStep}
                disabled={!multiStep || step === stepLabels.length - 1}
                className="rounded-3xl bg-slate-800 px-4 py-3 text-white disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => exportPreviewPdf()}
                className="rounded-3xl bg-sky-500 px-4 py-3 text-white"
              >
                Export PDF
              </button>
              <button
                type="submit"
                className="rounded-3xl bg-emerald-500 px-4 py-3 text-white"
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      </form>

      <aside className="space-y-6">
        {previewPane}
        {mounted && (
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 text-slate-300">
            <p className="text-sm">
              Your portfolio showcases your best work and skills to potential
              clients and employers.
            </p>
          </div>
        )}
      </aside>
    </div>
  );
}
