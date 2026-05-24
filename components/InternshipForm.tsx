"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { FileText, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

const internshipSchema = z.object({
  title: z.string().min(3),
  template: z.enum(["fresher", "modern", "professional"] as const),
  personalInfo: z.object({
    fullName: z.string().min(2),
    email: z.string().email(),
    phone: z.string().min(6),
    location: z.string().optional(),
    linkedin: z.string().optional(),
    github: z.string().optional(),
  }),
  careerObjective: z.string().optional(),
  education: z
    .array(
      z.object({
        id: z.string(),
        school: z.string(),
        degree: z.string().optional(),
        field: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        grade: z.string().optional(),
      }),
    )
    .min(1),
  skills: z.array(z.object({ id: z.string(), name: z.string() })).default([]),
  academicProjects: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        description: z.string().optional(),
        link: z.string().optional(),
      }),
    )
    .default([]),
  internships: z
    .array(
      z.object({
        id: z.string(),
        company: z.string(),
        role: z.string(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        description: z.string().optional(),
      }),
    )
    .default([]),
  certifications: z
    .array(z.object({ id: z.string(), value: z.string() }))
    .default([]),
  achievements: z
    .array(z.object({ id: z.string(), value: z.string() }))
    .default([]),
  languages: z
    .array(z.object({ id: z.string(), value: z.string() }))
    .default([]),
});

type InternshipFormValues = z.infer<typeof internshipSchema>;

function id(prefix = "id") {
  return `${prefix}-${crypto.randomUUID()}`;
}

const defaults: InternshipFormValues = {
  title: "Internship Resume",
  template: "fresher",
  personalInfo: {
    fullName: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    github: "",
  },
  careerObjective: "",
  education: [
    {
      id: "edu-0",
      school: "",
      degree: "",
      field: "",
      startDate: "",
      endDate: "",
      grade: "",
    },
  ],
  skills: [{ id: "skill-0", name: "" }],
  academicProjects: [{ id: "proj-0", name: "", description: "", link: "" }],
  internships: [],
  certifications: [],
  achievements: [],
  languages: [],
};

type Props = {
  initialData?: Partial<InternshipFormValues> | null;
  onSave?: (values: InternshipFormValues) => Promise<{ id?: string } | void>;
  multiStep?: boolean;
};

export default function InternshipForm({
  initialData = null,
  onSave,
  multiStep = true,
}: Props) {
  const form = useForm<InternshipFormValues>({
    resolver: zodResolver(internshipSchema),
    defaultValues: defaults,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const autoSaveTimer = useRef<number | null>(null);

  const educationFields = useFieldArray({
    name: "education",
    control: form.control,
  });
  const skillsFields = useFieldArray({ name: "skills", control: form.control });
  const projectsFields = useFieldArray({
    name: "academicProjects",
    control: form.control,
  });
  const internshipsFields = useFieldArray({
    name: "internships",
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

  useEffect(() => {
    if (initialData) {
      form.reset({ ...defaults, ...initialData } as any);
    }
    setIsMounted(true);
  }, [initialData, form]);

  // autosave debounce
  useEffect(() => {
    if (!onSave) return;
    const sub = form.watch(() => {
      if (autoSaveTimer.current) window.clearTimeout(autoSaveTimer.current);
      autoSaveTimer.current = window.setTimeout(async () => {
        try {
          const values = form.getValues();
          setIsSaving(true);
          await onSave(values as InternshipFormValues);
        } catch (e) {
        } finally {
          setIsSaving(false);
        }
      }, 3000) as unknown as number;
    });
    return () => {
      sub.unsubscribe?.();
      if (autoSaveTimer.current) window.clearTimeout(autoSaveTimer.current);
    };
  }, [form, onSave]);

  async function onSubmit(values: InternshipFormValues) {
    setIsSaving(true);
    try {
      if (onSave) {
        await onSave(values);
      }
    } catch (e) {
    } finally {
      setIsSaving(false);
    }
  }

  const preview = form.watch();

  function StepButtons() {
    const steps = [
      "Personal",
      "Objective",
      "Education",
      "Skills",
      "Projects",
      "Internships",
      "Extras",
      "Preview",
    ];
    const [step, setStep] = useState(0);

    async function next() {
      let ok = true;
      try {
        switch (step) {
          case 0:
            ok = await form.trigger("personalInfo");
            break;
          case 1:
            ok = await form.trigger("careerObjective");
            break;
          case 2:
            ok = await form.trigger("education");
            break;
          case 3:
            ok = await form.trigger("skills");
            break;
          default:
            ok = true;
        }
      } catch (err) {
        ok = true;
      }
      if (!ok) return;
      setStep((s) => Math.min(steps.length - 1, s + 1));
    }

    return (
      <div className="flex items-center justify-between">
        <div>
          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              className="rounded-3xl px-4 py-2 bg-slate-800 text-white"
            >
              Back
            </button>
          )}
        </div>
        <div>
          {step < steps.length - 1 ? (
            <button
              type="button"
              onClick={next}
              className="rounded-3xl px-6 py-3 bg-sky-500 text-white"
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              className="rounded-3xl px-6 py-3 bg-sky-500 text-white"
            >
              Save
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr,0.9fr]">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm text-slate-200">
            Title
            <input
              {...form.register("title")}
              className="mt-2 w-full rounded-2xl bg-slate-950 px-4 py-2 text-white"
            />
          </label>
          <label className="block text-sm text-slate-200">
            Template
            <select
              {...form.register("template")}
              className="mt-2 w-full rounded-2xl bg-slate-950 px-4 py-2 text-white"
            >
              <option value="fresher">Fresher</option>
              <option value="modern">Modern</option>
              <option value="professional">Professional</option>
            </select>
          </label>
        </div>

        <section className="rounded-2xl border p-4 bg-slate-900">
          <h3 className="text-white font-semibold">Personal Information</h3>
          <div className="grid gap-4 sm:grid-cols-2 mt-3">
            <input
              {...form.register("personalInfo.fullName")}
              placeholder="Full name"
              className="rounded-2xl bg-slate-950 px-4 py-2 text-white"
            />
            <input
              {...form.register("personalInfo.email")}
              placeholder="Email"
              className="rounded-2xl bg-slate-950 px-4 py-2 text-white"
            />
            <input
              {...form.register("personalInfo.phone")}
              placeholder="Phone"
              className="rounded-2xl bg-slate-950 px-4 py-2 text-white"
            />
            <input
              {...form.register("personalInfo.location")}
              placeholder="Location"
              className="rounded-2xl bg-slate-950 px-4 py-2 text-white"
            />
            <input
              {...form.register("personalInfo.linkedin")}
              placeholder="LinkedIn"
              className="rounded-2xl bg-slate-950 px-4 py-2 text-white"
            />
            <input
              {...form.register("personalInfo.github")}
              placeholder="GitHub"
              className="rounded-2xl bg-slate-950 px-4 py-2 text-white"
            />
          </div>
        </section>

        <section className="rounded-2xl border p-4 bg-slate-900">
          <h3 className="text-white font-semibold">Career Objective</h3>
          <textarea
            {...form.register("careerObjective")}
            rows={4}
            className="mt-2 w-full rounded-2xl bg-slate-950 px-4 py-2 text-white"
          />
        </section>

        <section className="rounded-2xl border p-4 bg-slate-900">
          <h3 className="text-white font-semibold">Education</h3>
          <div className="space-y-3 mt-3">
            {educationFields.fields.map((f, idx) => (
              <div key={f.id} className="p-3 rounded-2xl bg-slate-800">
                <div className="grid gap-2 sm:grid-cols-2">
                  <input
                    {...form.register(`education.${idx}.school`)}
                    placeholder="School / College"
                    className="rounded-2xl bg-slate-950 px-3 py-2 text-white"
                  />
                  <input
                    {...form.register(`education.${idx}.degree`)}
                    placeholder="Degree"
                    className="rounded-2xl bg-slate-950 px-3 py-2 text-white"
                  />
                </div>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  <input
                    {...form.register(`education.${idx}.field`)}
                    placeholder="Field"
                    className="rounded-2xl bg-slate-950 px-3 py-2 text-white"
                  />
                  <input
                    {...form.register(`education.${idx}.grade`)}
                    placeholder="Grade / GPA"
                    className="rounded-2xl bg-slate-950 px-3 py-2 text-white"
                  />
                </div>
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => educationFields.remove(idx)}
                    className="rounded-2xl px-3 py-1 bg-slate-700 text-white"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                educationFields.append({
                  id: id("edu"),
                  school: "",
                  degree: "",
                  field: "",
                  startDate: "",
                  endDate: "",
                  grade: "",
                })
              }
              className="rounded-2xl px-4 py-2 bg-slate-800 text-white inline-flex items-center gap-2"
            >
              {" "}
              <Plus size={14} /> Add education
            </button>
          </div>
        </section>

        <section className="rounded-2xl border p-4 bg-slate-900">
          <h3 className="text-white font-semibold">Skills</h3>
          <div className="space-y-2 mt-3">
            {skillsFields.fields.map((f, idx) => (
              <div key={f.id} className="flex gap-2">
                <input
                  {...form.register(`skills.${idx}.name`)}
                  placeholder="Skill"
                  className="rounded-2xl bg-slate-950 px-3 py-2 text-white flex-1"
                />
                <button
                  type="button"
                  onClick={() => skillsFields.remove(idx)}
                  className="rounded-2xl px-3 py-1 bg-slate-700 text-white"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => skillsFields.append({ id: id("skill"), name: "" })}
              className="rounded-2xl px-4 py-2 bg-slate-800 text-white inline-flex items-center gap-2"
            >
              {" "}
              <Plus size={14} /> Add skill
            </button>
          </div>
        </section>

        <section className="rounded-2xl border p-4 bg-slate-900">
          <h3 className="text-white font-semibold">Academic Projects</h3>
          <div className="space-y-3 mt-3">
            {projectsFields.fields.map((f, idx) => (
              <div key={f.id} className="p-3 rounded-2xl bg-slate-800">
                <input
                  {...form.register(`academicProjects.${idx}.name`)}
                  placeholder="Project name"
                  className="rounded-2xl bg-slate-950 px-3 py-2 text-white w-full"
                />
                <textarea
                  {...form.register(`academicProjects.${idx}.description`)}
                  placeholder="Description"
                  rows={3}
                  className="mt-2 rounded-2xl bg-slate-950 px-3 py-2 text-white w-full"
                />
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => projectsFields.remove(idx)}
                    className="rounded-2xl px-3 py-1 bg-slate-700 text-white"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                projectsFields.append({
                  id: id("proj"),
                  name: "",
                  description: "",
                  link: "",
                })
              }
              className="rounded-2xl px-4 py-2 bg-slate-800 text-white inline-flex items-center gap-2"
            >
              {" "}
              <Plus size={14} /> Add project
            </button>
          </div>
        </section>

        <section className="rounded-2xl border p-4 bg-slate-900">
          <h3 className="text-white font-semibold">Internships / Training</h3>
          <div className="space-y-3 mt-3">
            {internshipsFields.fields.map((f, idx) => (
              <div key={f.id} className="p-3 rounded-2xl bg-slate-800">
                <input
                  {...form.register(`internships.${idx}.company`)}
                  placeholder="Company"
                  className="rounded-2xl bg-slate-950 px-3 py-2 text-white w-full"
                />
                <input
                  {...form.register(`internships.${idx}.role`)}
                  placeholder="Role"
                  className="rounded-2xl bg-slate-950 px-3 py-2 text-white w-full mt-2"
                />
                <textarea
                  {...form.register(`internships.${idx}.description`)}
                  placeholder="Description"
                  rows={2}
                  className="mt-2 rounded-2xl bg-slate-950 px-3 py-2 text-white w-full"
                />
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => internshipsFields.remove(idx)}
                    className="rounded-2xl px-3 py-1 bg-slate-700 text-white"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                internshipsFields.append({
                  id: id("intern"),
                  company: "",
                  role: "",
                  startDate: "",
                  endDate: "",
                  description: "",
                })
              }
              className="rounded-2xl px-4 py-2 bg-slate-800 text-white inline-flex items-center gap-2"
            >
              {" "}
              <Plus size={14} /> Add internship
            </button>
          </div>
        </section>

        <section className="rounded-2xl border p-4 bg-slate-900">
          <h3 className="text-white font-semibold">
            Certifications & Achievements
          </h3>
          <div className="grid gap-3 mt-3">
            {certificationFields.fields.map((f, idx) => (
              <div key={f.id} className="flex gap-2">
                <input
                  {...form.register(`certifications.${idx}.value`)}
                  placeholder="Certification"
                  className="rounded-2xl bg-slate-950 px-3 py-2 text-white flex-1"
                />
                <button
                  type="button"
                  onClick={() => certificationFields.remove(idx)}
                  className="rounded-2xl px-3 py-1 bg-slate-700 text-white"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                certificationFields.append({ id: id("cert"), value: "" })
              }
              className="rounded-2xl px-4 py-2 bg-slate-800 text-white inline-flex items-center gap-2"
            >
              {" "}
              <Plus size={14} /> Add
            </button>

            {achievementFields.fields.map((f, idx) => (
              <div key={f.id} className="flex gap-2">
                <input
                  {...form.register(`achievements.${idx}.value`)}
                  placeholder="Achievement"
                  className="rounded-2xl bg-slate-950 px-3 py-2 text-white flex-1"
                />
                <button
                  type="button"
                  onClick={() => achievementFields.remove(idx)}
                  className="rounded-2xl px-3 py-1 bg-slate-700 text-white"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                achievementFields.append({ id: id("ach"), value: "" })
              }
              className="rounded-2xl px-4 py-2 bg-slate-800 text-white inline-flex items-center gap-2"
            >
              {" "}
              <Plus size={14} /> Add
            </button>
          </div>
        </section>

        <section className="rounded-2xl border p-4 bg-slate-900">
          <h3 className="text-white font-semibold">Languages</h3>
          <div className="space-y-2 mt-3">
            {languageFields.fields.map((f, idx) => (
              <div key={f.id} className="flex gap-2">
                <input
                  {...form.register(`languages.${idx}.value`)}
                  placeholder="Language"
                  className="rounded-2xl bg-slate-950 px-3 py-2 text-white flex-1"
                />
                <button
                  type="button"
                  onClick={() => languageFields.remove(idx)}
                  className="rounded-2xl px-3 py-1 bg-slate-700 text-white"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                languageFields.append({ id: id("lang"), value: "" })
              }
              className="rounded-2xl px-4 py-2 bg-slate-800 text-white inline-flex items-center gap-2"
            >
              {" "}
              <Plus size={14} /> Add
            </button>
          </div>
        </section>

        {multiStep ? (
          <StepButtons />
        ) : (
          <div className="flex justify-end">
            <button
              type="submit"
              className="rounded-3xl px-6 py-3 bg-sky-500 text-white inline-flex items-center gap-2"
            >
              <FileText /> Save
            </button>
          </div>
        )}
      </form>

      <aside className="rounded-2xl border p-4 bg-slate-900">
        <h4 className="text-white font-semibold mb-2">Live Preview</h4>
        {isMounted ? (
          <div className="overflow-hidden rounded-xl border border-slate-800 p-4 bg-slate-950 text-white text-sm">
            <h3 className="text-lg font-semibold">
              {preview.title || "Internship Resume"}
            </h3>
            <p className="mt-1">
              {preview.personalInfo?.fullName || "Your Name"}
            </p>
            <p className="text-sm mt-2">
              {preview.careerObjective || "Career Objective goes here."}
            </p>
            <div className="mt-3">
              <p className="font-semibold">Education</p>
              {preview.education?.slice(0, 2).map((e: any) => (
                <div key={e.id} className="text-sm text-slate-300">
                  <div>
                    {e.school} {e.degree ? `• ${e.degree}` : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-slate-400">
            Preview will appear when mounted.
          </div>
        )}
      </aside>
    </div>
  );
}
