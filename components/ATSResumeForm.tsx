"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

const atsSchema = z.object({
  title: z.string().min(3),
  template: z.enum(["ats", "minimal", "classic"] as const),
  personalInfo: z.object({
    fullName: z.string().min(2),
    email: z.string().email(),
    phone: z.string().min(6),
    location: z.string().optional(),
    jobTitle: z.string().optional(),
    linkedin: z.string().optional(),
    github: z.string().optional(),
    website: z.string().optional(),
    summary: z.string().optional(),
  }),
  experience: z
    .array(
      z.object({
        id: z.string(),
        company: z.string().min(1),
        position: z.string().min(1),
        location: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        current: z.boolean().default(false),
        description: z.string().optional(),
      }),
    )
    .min(1),
  education: z
    .array(
      z.object({
        id: z.string(),
        school: z.string().min(1),
        degree: z.string().optional(),
        field: z.string().optional(),
        location: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      }),
    )
    .min(1),
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
      }),
    )
    .default([]),
  certifications: z
    .array(z.object({ id: z.string(), value: z.string().min(1) }))
    .default([]),
  achievements: z
    .array(z.object({ id: z.string(), value: z.string().min(1) }))
    .default([]),
  languages: z
    .array(z.object({ id: z.string(), value: z.string().min(1) }))
    .default([]),
  keywords: z
    .array(z.object({ id: z.string(), value: z.string().min(1) }))
    .default([]),
});

type ATSResumeValues = z.infer<typeof atsSchema>;

type Props = {
  initialData?: Partial<ATSResumeValues> | null;
  onSave?: (values: ATSResumeValues) => Promise<{ id?: string } | void>;
  multiStep?: boolean;
};

function createId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}

const defaultValues: ATSResumeValues = {
  title: "ATS Resume",
  template: "ats",
  personalInfo: {
    fullName: "",
    email: "",
    phone: "",
    location: "",
    jobTitle: "",
    linkedin: "",
    github: "",
    website: "",
    summary: "",
  },
  experience: [
    {
      id: "exp-0",
      company: "",
      position: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      description: "",
    },
  ],
  education: [
    {
      id: "edu-0",
      school: "",
      degree: "",
      field: "",
      location: "",
      startDate: "",
      endDate: "",
    },
  ],
  skills: [{ id: "skill-0", name: "" }],
  projects: [{ id: "proj-0", name: "", description: "", link: "" }],
  certifications: [{ id: "cert-0", value: "" }],
  achievements: [{ id: "ach-0", value: "" }],
  languages: [{ id: "lang-0", value: "" }],
  keywords: [{ id: "kw-0", value: "" }],
};

export default function ATSResumeForm({
  initialData = null,
  onSave,
  multiStep = true,
}: Props) {
  const form = useForm<ATSResumeValues>({
    resolver: zodResolver(atsSchema),
    defaultValues,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(0);
  const autoSaveTimer = useRef<number | null>(null);

  const experienceFields = useFieldArray({
    name: "experience",
    control: form.control,
  });
  const educationFields = useFieldArray({
    name: "education",
    control: form.control,
  });
  const skillsFields = useFieldArray({ name: "skills", control: form.control });
  const projectFields = useFieldArray({
    name: "projects",
    control: form.control,
  });
  const certificationFields = useFieldArray({
    name: "certifications",
    control: form.control,
  });
  const achievementFields = useFieldArray({
    name: "achievements",
    control: form.control,
  });
  const languageFields = useFieldArray({
    name: "languages",
    control: form.control,
  });
  const keywordFields = useFieldArray({
    name: "keywords",
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

  async function onSubmit(values: ATSResumeValues) {
    setIsSaving(true);
    try {
      await onSave?.(values);
    } finally {
      setIsSaving(false);
    }
  }

  function nextStep() {
    setStep((current) => Math.min(6, current + 1));
  }

  function prevStep() {
    setStep((current) => Math.max(0, current - 1));
  }

  const preview = form.watch();
  const stepLabels = [
    "Personal",
    "Experience",
    "Education",
    "Skills",
    "Keywords",
    "Certifications",
    "Summary",
  ];

  const stepContent = (
    <>
      {step === 0 && (
        <section className="space-y-4 rounded-3xl border border-slate-800 bg-slate-950/90 p-6">
          <h3 className="text-xl font-semibold text-white">
            Personal Information (ATS-optimized)
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
              placeholder="Phone (standard format)"
              className="rounded-3xl bg-slate-900 px-4 py-3 text-white"
            />
            <input
              {...form.register("personalInfo.location")}
              placeholder="City, State"
              className="rounded-3xl bg-slate-900 px-4 py-3 text-white sm:col-span-2"
            />
            <textarea
              {...form.register("personalInfo.summary")}
              placeholder="Professional summary (ATS-friendly keywords)"
              rows={4}
              className="rounded-3xl bg-slate-900 px-4 py-3 text-white sm:col-span-2"
            />
          </div>
        </section>
      )}

      {step === 1 && (
        <section className="space-y-4 rounded-3xl border border-slate-800 bg-slate-950/90 p-6">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-xl font-semibold text-white">
              Work Experience
            </h3>
            <button
              type="button"
              onClick={() =>
                experienceFields.append({
                  id: createId("exp"),
                  company: "",
                  position: "",
                  location: "",
                  startDate: "",
                  endDate: "",
                  current: false,
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
                    disabled={form.watch(`experience.${index}.current`)}
                    className="rounded-3xl bg-slate-950 px-4 py-3 text-white"
                  />
                </div>
                <label className="mt-4 flex items-center gap-2 text-white">
                  <input
                    type="checkbox"
                    {...form.register(`experience.${index}.current`)}
                    className="rounded"
                  />
                  <span>Current position</span>
                </label>
                <textarea
                  {...form.register(`experience.${index}.description`)}
                  placeholder="Achievements & responsibilities (use keywords)"
                  rows={3}
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

      {step === 2 && (
        <section className="space-y-4 rounded-3xl border border-slate-800 bg-slate-950/90 p-6">
          <h3 className="text-xl font-semibold text-white">Education</h3>
          <div className="space-y-4">
            {educationFields.fields.map((field, index) => (
              <div key={field.id} className="rounded-3xl bg-slate-900 p-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <input
                    {...form.register(`education.${index}.school`)}
                    placeholder="School / College"
                    className="rounded-3xl bg-slate-950 px-4 py-3 text-white"
                  />
                  <input
                    {...form.register(`education.${index}.degree`)}
                    placeholder="Degree"
                    className="rounded-3xl bg-slate-950 px-4 py-3 text-white"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2 mt-4">
                  <input
                    {...form.register(`education.${index}.field`)}
                    placeholder="Field of study"
                    className="rounded-3xl bg-slate-950 px-4 py-3 text-white"
                  />
                  <input
                    {...form.register(`education.${index}.location`)}
                    placeholder="Location"
                    className="rounded-3xl bg-slate-950 px-4 py-3 text-white"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2 mt-4">
                  <input
                    type="month"
                    {...form.register(`education.${index}.startDate`)}
                    className="rounded-3xl bg-slate-950 px-4 py-3 text-white"
                  />
                  <input
                    type="month"
                    {...form.register(`education.${index}.endDate`)}
                    className="rounded-3xl bg-slate-950 px-4 py-3 text-white"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => educationFields.remove(index)}
                  className="mt-4 rounded-2xl bg-slate-800 px-4 py-2 text-sm text-white"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                educationFields.append({
                  id: createId("edu"),
                  school: "",
                  degree: "",
                  field: "",
                  location: "",
                  startDate: "",
                  endDate: "",
                })
              }
              className="rounded-3xl bg-slate-800 px-4 py-3 text-white"
            >
              Add education
            </button>
          </div>
        </section>
      )}

      {step === 3 && (
        <section className="space-y-4 rounded-3xl border border-slate-800 bg-slate-950/90 p-6">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-xl font-semibold text-white">
              Skills (ATS-scannable)
            </h3>
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
                  placeholder="Skill (e.g., JavaScript, Project Management)"
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
        </section>
      )}

      {step === 4 && (
        <section className="space-y-4 rounded-3xl border border-slate-800 bg-slate-950/90 p-6">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-xl font-semibold text-white">ATS Keywords</h3>
            <button
              type="button"
              onClick={() =>
                keywordFields.append({
                  id: createId("kw"),
                  value: "",
                })
              }
              className="rounded-3xl bg-slate-800 px-4 py-3 text-white"
            >
              Add keyword
            </button>
          </div>
          <p className="text-sm text-slate-400">
            Add keywords from job descriptions to improve ATS matching
          </p>
          <div className="grid gap-3">
            {keywordFields.fields.map((field, index) => (
              <div key={field.id} className="flex gap-2">
                <input
                  {...form.register(`keywords.${index}.value`)}
                  placeholder="Keyword (e.g., Six Sigma, Agile)"
                  className="flex-1 rounded-3xl bg-slate-950 px-4 py-3 text-white"
                />
                <button
                  type="button"
                  onClick={() => keywordFields.remove(index)}
                  className="rounded-3xl bg-slate-800 px-4 py-3 text-white"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {step === 5 && (
        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-800 bg-slate-950/90 p-6">
            <h3 className="text-xl font-semibold text-white">Certifications</h3>
            <div className="space-y-3 mt-4">
              {certificationFields.fields.map((field, index) => (
                <div key={field.id} className="flex gap-2">
                  <input
                    {...form.register(`certifications.${index}.value`)}
                    placeholder="Certification"
                    className="flex-1 rounded-3xl bg-slate-950 px-4 py-3 text-white"
                  />
                  <button
                    type="button"
                    onClick={() => certificationFields.remove(index)}
                    className="rounded-2xl bg-slate-800 px-4 py-3 text-white"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  certificationFields.append({
                    id: createId("cert"),
                    value: "",
                  })
                }
                className="rounded-3xl bg-slate-800 px-4 py-3 text-white"
              >
                Add cert
              </button>
            </div>
          </div>
          <div className="rounded-3xl border border-slate-800 bg-slate-950/90 p-6">
            <h3 className="text-xl font-semibold text-white">Languages</h3>
            <div className="space-y-3 mt-4">
              {languageFields.fields.map((field, index) => (
                <div key={field.id} className="flex gap-2">
                  <input
                    {...form.register(`languages.${index}.value`)}
                    placeholder="Language"
                    className="flex-1 rounded-3xl bg-slate-950 px-4 py-3 text-white"
                  />
                  <button
                    type="button"
                    onClick={() => languageFields.remove(index)}
                    className="rounded-2xl bg-slate-800 px-4 py-3 text-white"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  languageFields.append({ id: createId("lang"), value: "" })
                }
                className="rounded-3xl bg-slate-800 px-4 py-3 text-white"
              >
                Add language
              </button>
            </div>
          </div>
        </section>
      )}

      {step === 6 && (
        <section className="space-y-4 rounded-3xl border border-slate-800 bg-slate-950/90 p-6">
          <h3 className="text-xl font-semibold text-white">
            Projects & Achievements
          </h3>
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
                  placeholder="Description (with keywords)"
                  rows={3}
                  className="mt-4 w-full rounded-3xl bg-slate-950 px-4 py-3 text-white"
                />
                <input
                  {...form.register(`projects.${index}.link`)}
                  placeholder="Project link"
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
            <button
              type="button"
              onClick={() =>
                projectFields.append({
                  id: createId("proj"),
                  name: "",
                  description: "",
                  link: "",
                })
              }
              className="rounded-3xl bg-slate-800 px-4 py-3 text-white"
            >
              Add project
            </button>
          </div>
        </section>
      )}
    </>
  );

  const previewPane = (
    <div className="rounded-3xl border border-slate-800 bg-slate-950/90 p-6 text-white">
      <h3 className="text-xl font-semibold">ATS Preview</h3>
      <div className="mt-4 space-y-4 text-sm text-slate-300">
        <p className="text-lg font-semibold text-white">
          {preview.personalInfo.fullName || "Name"}
        </p>
        <p className="text-slate-400">
          {preview.personalInfo.email || "email"} |{" "}
          {preview.personalInfo.phone || "phone"}
        </p>
        <div>
          <p className="font-semibold text-white">
            Keywords Detected: {preview.keywords.filter((k) => k.value).length}
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
                  className="rounded bg-slate-800 px-2 py-1 text-xs text-slate-200"
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
            Resume title
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
              <option value="ats">ATS-Optimized</option>
              <option value="minimal">Minimal</option>
              <option value="classic">Classic</option>
            </select>
          </label>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-sky-400">
                ATS Resume
              </p>
              <h2 className="text-3xl font-semibold text-white">
                Optimize for Scanners
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
                onClick={() => window.print()}
                className="rounded-3xl bg-sky-500 px-4 py-3 text-white"
              >
                Export PDF
              </button>
              <button
                type="submit"
                className="rounded-3xl bg-emerald-500 px-4 py-3 text-white"
              >
                Save
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
              ATS scanner preview. Verify all critical info is plaintext and
              parseable.
            </p>
          </div>
        )}
      </aside>
    </div>
  );
}
