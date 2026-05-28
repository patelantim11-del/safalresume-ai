"use client";

import CareerAssistant from "@/components/CareerAssistant";
import { resumeTemplates } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Download, FileText, Plus, Sparkles, Trash } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

const resumeSchema = z.object({
  title: z.string().min(3),
  template: z.enum(resumeTemplates),
  personalInfo: z.object({
    fullName: z.string().min(2),
    email: z.string().email(),
    phone: z.string().min(8),
    location: z.string().min(2),
    jobTitle: z.string().min(2),
    website: z.string().optional(),
    linkedin: z.string().optional(),
    github: z.string().optional(),
    photoUrl: z.string().optional(),
    summary: z.string().optional(),
  }),
  experience: z
    .array(
      z.object({
        id: z.string(),
        company: z.string(),
        position: z.string(),
        location: z.string(),
        startDate: z.string(),
        endDate: z.string(),
        current: z.boolean(),
        description: z.string(),
      }),
    )
    .min(1),
  education: z
    .array(
      z.object({
        id: z.string(),
        school: z.string(),
        degree: z.string(),
        field: z.string(),
        location: z.string(),
        startDate: z.string(),
        endDate: z.string(),
      }),
    )
    .min(1),
  skills: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        level: z.enum(["Beginner", "Intermediate", "Advanced", "Expert"]),
      }),
    )
    .min(1),
  projects: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        description: z.string(),
        link: z.string().optional(),
      }),
    )
    .min(1),
  certifications: z
    .array(
      z.object({
        id: z.string(),
        value: z.string(),
      }),
    )
    .default([]),
  achievements: z
    .array(
      z.object({
        id: z.string(),
        value: z.string(),
      }),
    )
    .default([]),
  languages: z
    .array(
      z.object({
        id: z.string(),
        value: z.string(),
      }),
    )
    .default([]),
  socialLinks: z
    .array(
      z.object({
        id: z.string(),
        label: z.string(),
        url: z.string().optional(),
      }),
    )
    .default([]),
});

type ResumeFormValues = z.infer<typeof resumeSchema>;

function generateFieldId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}

function createExperience(id = generateFieldId("experience")) {
  return {
    id,
    company: "",
    position: "",
    location: "",
    startDate: "",
    endDate: "",
    current: false,
    description: "",
  };
}

function createEducation(id = generateFieldId("education")) {
  return {
    id,
    school: "",
    degree: "",
    field: "",
    location: "",
    startDate: "",
    endDate: "",
  };
}

function createSkill(id = generateFieldId("skill")) {
  return { id, name: "", level: "Intermediate" as const };
}

function createProject(id = generateFieldId("project")) {
  return { id, name: "", description: "", link: "" };
}

function createCertification(id = generateFieldId("certification")) {
  return { id, value: "" };
}

function createAchievement(id = generateFieldId("achievement")) {
  return { id, value: "" };
}

function createLanguage(id = generateFieldId("language")) {
  return { id, value: "" };
}

function createSocialLink(id = generateFieldId("social")) {
  return { id, label: "", url: "" };
}

const defaultValues: ResumeFormValues = {
  title: "Professional AI Resume",
  template: "professional",
  personalInfo: {
    fullName: "",
    email: "",
    phone: "",
    location: "",
    jobTitle: "",
    website: "",
    linkedin: "",
    github: "",
    photoUrl: "",
    summary: "",
  },
  experience: [
    {
      id: "experience-0",
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
      id: "education-0",
      school: "",
      degree: "",
      field: "",
      location: "",
      startDate: "",
      endDate: "",
    },
  ],
  skills: [{ id: "skill-0", name: "", level: "Intermediate" }],
  projects: [{ id: "project-0", name: "", description: "", link: "" }],
  certifications: [{ id: "certification-0", value: "" }],
  achievements: [{ id: "achievement-0", value: "" }],
  languages: [{ id: "language-0", value: "" }],
  socialLinks: [{ id: "social-0", label: "", url: "" }],
};

type ResumeFormProps = {
  resumeId?: string | null;
  initialData?: Partial<ResumeFormValues> | null;
  onSave?: (values: ResumeFormValues) => Promise<{ id?: string } | void>;
  multiStep?: boolean;
};

export default function ResumeForm({
  resumeId: propResumeId,
  initialData = null,
  onSave,
  multiStep = false,
}: ResumeFormProps) {
  const form = useForm<ResumeFormValues>({
    resolver: zodResolver(resumeSchema),
    defaultValues,
  });

  const [savedResumeId, setSavedResumeId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  const [currentStep, setCurrentStep] = useState(0);
  const autoSaveTimer = useRef<number | null>(null);

  const searchParams = useSearchParams();
  const createNew = searchParams.get("new") === "true";

  const experienceFields = useFieldArray({
    name: "experience",
    control: form.control,
  });
  const educationFields = useFieldArray({
    name: "education",
    control: form.control,
  });
  const skillFields = useFieldArray({ name: "skills", control: form.control });
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
  const socialFields = useFieldArray({
    name: "socialLinks",
    control: form.control,
  });

  useEffect(() => {
    async function loadResume() {
      if (initialData) {
        setSavedResumeId(propResumeId ?? null);
        form.reset({
          ...defaultValues,
          ...initialData,
        } as any);
        setIsLoading(false);
        setStatusMessage({ type: "success", text: "Loaded initial data." });
        return;
      }

      if (!propResumeId || createNew) {
        setSavedResumeId(null);
        setIsLoading(false);
        setStatusMessage({
          type: "info",
          text: createNew
            ? "Create a new resume from scratch."
            : "Start a new resume or edit one from the dashboard.",
        });
        return;
      }

      setIsLoading(true);
      setStatusMessage({ type: "info", text: "Loading resume..." });

      try {
        const response = await fetch(`/api/resumes/${propResumeId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.error || "Unable to load the requested resume.",
          );
        }

        const resume = data?.resume;
        if (!resume) {
          throw new Error("Resume not found.");
        }

        setSavedResumeId(resume.id ?? null);
        form.reset({
          title: resume.title ?? defaultValues.title,
          template: resume.template ?? defaultValues.template,
          personalInfo: {
            ...defaultValues.personalInfo,
            ...(resume.personalInfo ?? {}),
          },
          experience:
            resume.experience?.length > 0
              ? resume.experience
              : [createExperience()],
          education:
            resume.education?.length > 0
              ? resume.education
              : [createEducation()],
          skills: resume.skills?.length > 0 ? resume.skills : [createSkill()],
          projects:
            resume.projects?.length > 0 ? resume.projects : [createProject()],
          certifications: resume.certifications ?? [],
          achievements: resume.achievements ?? [],
          languages: resume.languages ?? [],
          socialLinks: resume.socialLinks ?? [],
        });
        setStatusMessage({
          type: "success",
          text: "Resume loaded for editing.",
        });
      } catch (error: any) {
        setStatusMessage({
          type: "error",
          text: `Failed to load resume: ${error?.message ?? String(error)}`,
        });
      } finally {
        setIsLoading(false);
      }
    }

    loadResume();
  }, [form, propResumeId, createNew, initialData]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Autosave when values change (debounced)
  useEffect(() => {
    if (!onSave) return;
    const subscription = form.watch(() => {
      if (autoSaveTimer.current) window.clearTimeout(autoSaveTimer.current);
      autoSaveTimer.current = window.setTimeout(async () => {
        try {
          const values = form.getValues();
          await onSave(values as ResumeFormValues);
          setStatusMessage({ type: "info", text: "Auto-saved" });
        } catch {
          setStatusMessage({ type: "error", text: "Auto-save failed" });
        }
      }, 3000) as unknown as number;
    });
    return () => {
      subscription.unsubscribe?.();
      if (autoSaveTimer.current) window.clearTimeout(autoSaveTimer.current);
    };
  }, [form, onSave]);

  const previewValues = form.watch();

  const templateStyle = useMemo(() => {
    switch (previewValues.template) {
      case "modern":
        return "border-sky-500 bg-slate-950 text-slate-100";
      case "executive":
        return "border-slate-700 bg-slate-900 text-slate-100";
      case "minimal":
        return "border-slate-700 bg-white text-slate-950";
      case "ats":
        return "border-cyan-500 bg-slate-950 text-slate-100";
      case "corporate":
        return "border-slate-700 bg-slate-900 text-slate-100";
      case "fresher":
        return "border-emerald-500 bg-slate-950 text-slate-100";
      default:
        return "border-slate-700 bg-slate-950 text-slate-100";
    }
  }, [previewValues.template]);

  function generateSummary() {
    const { jobTitle, location } = form.getValues("personalInfo");
    const summary = `Results-driven ${jobTitle || "professional"} from ${location || "your city"} with strong experience in leadership, strategy, and delivery.`;
    form.setValue("personalInfo.summary", summary);
  }

  function suggestSkills() {
    const suggestions = [
      "Leadership",
      "Project Management",
      "Communication",
      "Problem Solving",
      "Stakeholder Management",
    ];
    suggestions.forEach((skill) => {
      if (
        !form
          .getValues("skills")
          .some((item) => item.name.toLowerCase() === skill.toLowerCase())
      ) {
        skillFields.append({
          id: crypto.randomUUID(),
          name: skill,
          level: "Advanced",
        });
      }
    });
  }

  function enhanceExperience() {
    if (!experienceFields.fields.length) {
      return;
    }

    form.setValue(
      "experience.0.description",
      "Led cross-functional teams to deliver high-impact initiatives, optimizing operations across product, engineering, and marketing teams.",
    );
  }

  function generateProjectDescription() {
    if (!projectFields.fields.length) {
      return;
    }

    const projectName = form.getValues("projects.0.name") || "Product launch";
    form.setValue(
      "projects.0.description",
      `Designed and executed ${projectName} with measurable business impact, improving customer engagement and delivery velocity.`,
    );
  }

  async function onSubmit(values: ResumeFormValues) {
    setIsSaving(true);
    setStatusMessage(null);

    try {
      if (onSave) {
        await onSave(values);
        setStatusMessage({
          type: "success",
          text: "Saved via parent handler.",
        });
      } else {
        const payload = savedResumeId
          ? { ...values, id: savedResumeId }
          : values;
        const response = await fetch("/api/resumes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        let data: any = null;
        try {
          data = await response.json();
        } catch {}

        if (!response.ok) {
          const errMsg =
            data?.error ||
            data?.message ||
            JSON.stringify(data) ||
            "Unknown error";
          setStatusMessage({ type: "error", text: `Save failed: ${errMsg}` });
          return;
        }

        const resumeId = data?.resume?.id;
        if (resumeId) {
          setSavedResumeId(resumeId);
        }

        setStatusMessage({
          type: "success",
          text: "Resume saved successfully.",
        });
      }
    } catch (err: any) {
      setStatusMessage({
        type: "error",
        text: `Save failed: ${err?.message ?? String(err)}`,
      });
    } finally {
      setIsSaving(false);
    }
  }

  function downloadPdf() {
    window.print();
  }

  function StepButtons() {
    const steps = [
      "Personal",
      "Experience",
      "Education",
      "Skills & Projects",
      "Certifications",
      "Languages & Socials",
      "Preview",
    ];

    async function next() {
      // validate current step fields
      try {
        let ok = true;
        switch (currentStep) {
          case 0:
            ok = await form.trigger("personalInfo");
            break;
          case 1:
            ok = await form.trigger("experience");
            break;
          case 2:
            ok = await form.trigger("education");
            break;
          case 3:
            ok = await form.trigger(["skills", "projects"] as any);
            break;
          case 4:
            ok = await form.trigger(["certifications", "achievements"] as any);
            break;
          case 5:
            ok = await form.trigger(["languages", "socialLinks"] as any);
            break;
          default:
            ok = true;
        }
        if (!ok) return;
        setCurrentStep((s) => Math.min(steps.length - 1, s + 1));
      } catch (err) {
        console.error(err);
      }
    }

    return (
      <div className="flex items-center gap-3 justify-between">
        <div className="flex gap-2">
          {currentStep > 0 && (
            <button
              type="button"
              onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
              className="rounded-3xl px-4 py-2 bg-slate-800 text-sm text-white"
            >
              Back
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          {currentStep < 6 ? (
            <button
              type="button"
              onClick={next}
              className="rounded-3xl px-6 py-3 bg-sky-500 text-sm font-semibold"
            >
              Next: {steps[currentStep + 1]}
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSaving || isLoading}
              className={`inline-flex items-center justify-center rounded-3xl px-6 py-3 text-sm font-semibold text-slate-950 transition ${
                isSaving || isLoading
                  ? "cursor-not-allowed bg-slate-600"
                  : "bg-sky-500 hover:bg-sky-400"
              }`}
            >
              <FileText size={18} /> {isSaving ? "Saving..." : "Save resume"}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 rounded-4xl border border-slate-800 bg-slate-900/90 p-8 shadow-xl shadow-slate-950/20"
      >
        <div className="space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-sky-400">
                Resume Builder
              </p>
              <h2 className="text-3xl font-semibold text-white">
                Complete resume details
              </h2>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={generateSummary}
                className="inline-flex items-center gap-2 rounded-2xl bg-slate-800 px-4 py-2 text-sm text-slate-200 transition hover:bg-slate-700"
              >
                <Sparkles size={16} /> Generate summary
              </button>
              <button
                type="button"
                onClick={suggestSkills}
                className="inline-flex items-center gap-2 rounded-2xl bg-slate-800 px-4 py-2 text-sm text-slate-200 transition hover:bg-slate-700"
              >
                Suggest skills
              </button>
            </div>
          </div>
          {statusMessage ? (
            <div
              className={`rounded-3xl border px-4 py-3 text-sm ${
                statusMessage.type === "success"
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                  : statusMessage.type === "error"
                    ? "border-rose-500/30 bg-rose-500/10 text-rose-200"
                    : "border-slate-700 bg-slate-900 text-slate-300"
              }`}
            >
              {statusMessage.text}
            </div>
          ) : null}
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm text-slate-200">
              Resume title
              <input
                {...form.register("title")}
                className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-sky-500"
              />
            </label>
            <label className="block text-sm text-slate-200">
              Template
              <select
                {...form.register("template")}
                className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-sky-500"
              >
                <option value="ats">ATS Template</option>
                <option value="corporate">Corporate Template</option>
                <option value="executive">Executive</option>
                <option value="modern">Modern</option>
                <option value="fresher">Fresher Template</option>
                <option value="professional">Professional</option>
                <option value="minimal">Minimal</option>
              </select>
            </label>
          </div>
        </div>

        {(!multiStep || currentStep === 0) && (
          <section className="space-y-4 rounded-3xl border border-slate-800 bg-slate-950/90 p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-white">
                  Personal information
                </p>
                <p className="text-sm text-slate-400">
                  Enter your contact details and professional profile.
                </p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm text-slate-200">
                Full name
                <input
                  {...form.register("personalInfo.fullName")}
                  className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-sky-500"
                />
              </label>
              <label className="block text-sm text-slate-200">
                Job title
                <input
                  {...form.register("personalInfo.jobTitle")}
                  className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-sky-500"
                />
              </label>
              <label className="block text-sm text-slate-200">
                Email
                <input
                  type="email"
                  {...form.register("personalInfo.email")}
                  className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-sky-500"
                />
              </label>
              <label className="block text-sm text-slate-200">
                Phone
                <input
                  {...form.register("personalInfo.phone")}
                  className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-sky-500"
                />
              </label>
              <label className="block text-sm text-slate-200">
                Location
                <input
                  {...form.register("personalInfo.location")}
                  className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-sky-500"
                />
              </label>
              <label className="block text-sm text-slate-200">
                Website
                <input
                  {...form.register("personalInfo.website")}
                  className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-sky-500"
                />
              </label>
              <label className="block text-sm text-slate-200">
                LinkedIn
                <input
                  {...form.register("personalInfo.linkedin")}
                  className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-sky-500"
                />
              </label>
              <label className="block text-sm text-slate-200">
                GitHub
                <input
                  {...form.register("personalInfo.github")}
                  className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-sky-500"
                />
              </label>
              <label className="block text-sm text-slate-200 sm:col-span-2">
                Profile photo URL
                <input
                  {...form.register("personalInfo.photoUrl")}
                  placeholder="https://..."
                  className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-sky-500"
                />
              </label>
              <label className="block text-sm text-slate-200 sm:col-span-2">
                Summary
                <textarea
                  rows={4}
                  {...form.register("personalInfo.summary")}
                  className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-sky-500"
                />
              </label>
            </div>
          </section>
        )}

        {(!multiStep || currentStep === 1) && (
          <section className="space-y-4 rounded-3xl border border-slate-800 bg-slate-950/90 p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-white">
                  Work experience
                </p>
                <p className="text-sm text-slate-400">
                  Describe your most relevant roles.
                </p>
              </div>
              <button
                type="button"
                onClick={enhanceExperience}
                className="rounded-2xl bg-slate-800 px-4 py-2 text-sm text-slate-200 transition hover:bg-slate-700"
              >
                Enhance experience
              </button>
            </div>
            <div className="space-y-4">
              {experienceFields.fields.map((field, index) => (
                <div
                  key={field.id}
                  className="rounded-3xl border border-slate-800 bg-slate-900/90 p-4"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="font-semibold text-white">
                      Experience {index + 1}
                    </p>
                    <button
                      type="button"
                      onClick={() => experienceFields.remove(index)}
                      className="inline-flex items-center gap-2 rounded-2xl bg-slate-800 px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-700"
                    >
                      <Trash size={14} /> Remove
                    </button>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <input
                      {...form.register(`experience.${index}.company`)}
                      placeholder="Company"
                      className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-sky-500"
                    />
                    <input
                      {...form.register(`experience.${index}.position`)}
                      placeholder="Position"
                      className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-sky-500"
                    />
                    <input
                      {...form.register(`experience.${index}.location`)}
                      placeholder="Location"
                      className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-sky-500"
                    />
                    <div className="grid gap-4 sm:grid-cols-2">
                      <input
                        type="month"
                        {...form.register(`experience.${index}.startDate`)}
                        className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-sky-500"
                      />
                      <input
                        type="month"
                        {...form.register(`experience.${index}.endDate`)}
                        className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-sky-500"
                      />
                    </div>
                    <label className="flex items-center gap-3 text-sm text-slate-300">
                      <input
                        type="checkbox"
                        {...form.register(`experience.${index}.current`)}
                        className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-sky-500"
                      />
                      Current role
                    </label>
                  </div>
                  <textarea
                    {...form.register(`experience.${index}.description`)}
                    placeholder="Description"
                    rows={4}
                    className="mt-4 w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-sky-500"
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={() => experienceFields.append(createExperience())}
                className="inline-flex items-center gap-2 rounded-2xl bg-slate-800 px-4 py-2 text-sm text-slate-200 transition hover:bg-slate-700"
              >
                <Plus size={16} /> Add experience
              </button>
            </div>
          </section>
        )}

        <section className="space-y-4 rounded-3xl border border-slate-800 bg-slate-950/90 p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-white">Education</p>
              <p className="text-sm text-slate-400">
                Share your academic qualifications.
              </p>
            </div>
          </div>
          <div className="space-y-4">
            {educationFields.fields.map((field, index) => (
              <div
                key={field.id}
                className="rounded-3xl border border-slate-800 bg-slate-900/90 p-4"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="font-semibold text-white">
                    Education {index + 1}
                  </p>
                  <button
                    type="button"
                    onClick={() => educationFields.remove(index)}
                    className="inline-flex items-center gap-2 rounded-2xl bg-slate-800 px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-700"
                  >
                    <Trash size={14} /> Remove
                  </button>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <input
                    {...form.register(`education.${index}.school`)}
                    placeholder="School / University"
                    className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-sky-500"
                  />
                  <input
                    {...form.register(`education.${index}.degree`)}
                    placeholder="Degree"
                    className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-sky-500"
                  />
                  <input
                    {...form.register(`education.${index}.field`)}
                    placeholder="Field of study"
                    className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-sky-500"
                  />
                  <input
                    {...form.register(`education.${index}.location`)}
                    placeholder="Location"
                    className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-sky-500"
                  />
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <input
                    type="month"
                    {...form.register(`education.${index}.startDate`)}
                    className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-sky-500"
                  />
                  <input
                    type="month"
                    {...form.register(`education.${index}.endDate`)}
                    className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-sky-500"
                  />
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => educationFields.append(createEducation())}
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-800 px-4 py-2 text-sm text-slate-200 transition hover:bg-slate-700"
            >
              <Plus size={16} /> Add education
            </button>
          </div>
        </section>

        <section className="space-y-4 rounded-3xl border border-slate-800 bg-slate-950/90 p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-white">
                Skills & projects
              </p>
              <p className="text-sm text-slate-400">
                Highlight core abilities and achievements.
              </p>
            </div>
            <button
              type="button"
              onClick={generateProjectDescription}
              className="rounded-2xl bg-slate-800 px-4 py-2 text-sm text-slate-200 transition hover:bg-slate-700"
            >
              Auto project details
            </button>
          </div>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {skillFields.fields.map((field, index) => (
                <div
                  key={field.id}
                  className="space-y-2 rounded-3xl border border-slate-800 bg-slate-900/90 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-white">
                      Skill {index + 1}
                    </p>
                    <button
                      type="button"
                      onClick={() => skillFields.remove(index)}
                      className="rounded-2xl bg-slate-800 px-3 py-2 text-xs text-slate-300 transition hover:bg-slate-700"
                    >
                      Remove
                    </button>
                  </div>
                  <input
                    {...form.register(`skills.${index}.name`)}
                    placeholder="Skill name"
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-sky-500"
                  />
                  <select
                    {...form.register(`skills.${index}.level`)}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-sky-500"
                  >
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                    <option>Expert</option>
                  </select>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => skillFields.append(createSkill())}
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-800 px-4 py-2 text-sm text-slate-200 transition hover:bg-slate-700"
            >
              <Plus size={16} /> Add skill
            </button>
          </div>
          <div className="space-y-4">
            {projectFields.fields.map((field, index) => (
              <div
                key={field.id}
                className="rounded-3xl border border-slate-800 bg-slate-900/90 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-white">
                    Project {index + 1}
                  </p>
                  <button
                    type="button"
                    onClick={() => projectFields.remove(index)}
                    className="rounded-2xl bg-slate-800 px-3 py-2 text-xs text-slate-300 transition hover:bg-slate-700"
                  >
                    Remove
                  </button>
                </div>
                <input
                  {...form.register(`projects.${index}.name`)}
                  placeholder="Project name"
                  className="mt-4 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-sky-500"
                />
                <textarea
                  {...form.register(`projects.${index}.description`)}
                  placeholder="Project description"
                  rows={4}
                  className="mt-4 w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-sky-500"
                />
                <input
                  {...form.register(`projects.${index}.link`)}
                  placeholder="Project link"
                  className="mt-4 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-sky-500"
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() => projectFields.append(createProject())}
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-800 px-4 py-2 text-sm text-slate-200 transition hover:bg-slate-700"
            >
              <Plus size={16} /> Add project
            </button>
          </div>
        </section>

        <section className="grid gap-4 rounded-3xl border border-slate-800 bg-slate-950/90 p-6 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-white">
                  Certifications
                </p>
                <p className="text-sm text-slate-400">
                  List certificates that support your field.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  certificationFields.append(createCertification())
                }
                className="rounded-2xl bg-slate-800 px-4 py-2 text-sm text-slate-200 transition hover:bg-slate-700"
              >
                Add
              </button>
            </div>
            <div className="space-y-3">
              {certificationFields.fields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-3">
                  <input
                    {...form.register(`certifications.${index}.value`)}
                    placeholder="Certification"
                    className="flex-1 rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-sky-500"
                  />
                  <button
                    type="button"
                    onClick={() => certificationFields.remove(index)}
                    className="rounded-2xl bg-slate-800 px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-700"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-white">Achievements</p>
                <p className="text-sm text-slate-400">
                  Add measurable results and awards.
                </p>
              </div>
              <button
                type="button"
                onClick={() => achievementFields.append(createAchievement())}
                className="rounded-2xl bg-slate-800 px-4 py-2 text-sm text-slate-200 transition hover:bg-slate-700"
              >
                Add
              </button>
            </div>
            <div className="space-y-3">
              {achievementFields.fields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-3">
                  <input
                    {...form.register(`achievements.${index}.value`)}
                    placeholder="Achievement"
                    className="flex-1 rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-sky-500"
                  />
                  <button
                    type="button"
                    onClick={() => achievementFields.remove(index)}
                    className="rounded-2xl bg-slate-800 px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-700"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-800 bg-slate-950/90 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-white">
                Languages & socials
              </p>
              <p className="text-sm text-slate-400">
                Complete your profile with language and social links.
              </p>
            </div>
            <button
              type="button"
              onClick={downloadPdf}
              className="inline-flex items-center gap-2 rounded-2xl bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
            >
              <Download size={16} /> Download PDF
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-white">Languages</p>
                <button
                  type="button"
                  onClick={() => languageFields.append(createLanguage())}
                  className="rounded-2xl bg-slate-800 px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-700"
                >
                  Add
                </button>
              </div>
              <div className="space-y-3">
                {languageFields.fields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-3">
                    <input
                      {...form.register(`languages.${index}.value`)}
                      placeholder="Language"
                      className="flex-1 rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-sky-500"
                    />
                    <button
                      type="button"
                      onClick={() => languageFields.remove(index)}
                      className="rounded-2xl bg-slate-800 px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-700"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-white">Social links</p>
                <button
                  type="button"
                  onClick={() => socialFields.append(createSocialLink())}
                  className="rounded-2xl bg-slate-800 px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-700"
                >
                  Add
                </button>
              </div>
              <div className="space-y-3">
                {socialFields.fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="space-y-3 rounded-3xl border border-slate-800 bg-slate-900/90 p-4"
                  >
                    <input
                      {...form.register(`socialLinks.${index}.label`)}
                      placeholder="Label"
                      className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-sky-500"
                    />
                    <input
                      {...form.register(`socialLinks.${index}.url`)}
                      placeholder="URL"
                      className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-sky-500"
                    />
                    <button
                      type="button"
                      onClick={() => socialFields.remove(index)}
                      className="rounded-2xl bg-slate-800 px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-700"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Step navigation or submit */}
        {multiStep ? (
          <StepButtons />
        ) : (
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
            <button
              type="submit"
              disabled={isSaving || isLoading}
              className={`inline-flex items-center justify-center rounded-3xl px-6 py-3 text-sm font-semibold text-slate-950 transition ${
                isSaving || isLoading
                  ? "cursor-not-allowed bg-slate-600"
                  : "bg-sky-500 hover:bg-sky-400"
              }`}
            >
              <FileText size={18} /> {isSaving ? "Saving..." : "Save resume"}
            </button>
            <p className="text-sm text-slate-400">
              Preview and download the resume once your details are complete.
            </p>
          </div>
        )}
      </form>

      <aside className="space-y-6 rounded-4xl border border-slate-800 bg-slate-950/90 p-6 shadow-xl shadow-slate-950/20">
        <CareerAssistant
          resume={previewValues}
          onApplySummary={generateSummary}
          onAddAchievement={(achievement) =>
            achievementFields.append({
              id: crypto.randomUUID(),
              value: achievement,
            })
          }
        />

        <div className="flex items-center gap-3">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-3xl bg-slate-800 text-sky-400">
            <Sparkles size={20} />
          </span>
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-sky-400">
              Instant preview
            </p>
            <h3 className="text-2xl font-semibold text-white">
              Preview your resume layout
            </h3>
          </div>
        </div>
        {isMounted ? (
          <div
            className={`overflow-hidden rounded-[1.75rem] border ${templateStyle}`}
          >
            <div className="p-8">
              <div className="space-y-2 border-b border-slate-800 pb-5">
                <p className="text-sm uppercase tracking-[0.3em] text-sky-300">
                  {previewValues.title}
                </p>
                <h2 className="text-3xl font-semibold">
                  {previewValues.personalInfo.fullName || "Your Name"}
                </h2>
                <p className="text-slate-300">
                  {previewValues.personalInfo.jobTitle || "Job Title"}
                </p>
              </div>

              <div className="mt-6 flex flex-col gap-4 text-slate-300">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">
                    Summary
                  </p>
                  <p className="mt-2 text-sm leading-7">
                    {previewValues.personalInfo.summary ||
                      "Write a concise professional summary to capture recruiter attention."}
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">
                      Contact
                    </p>
                    <p className="mt-2 text-sm">
                      {previewValues.personalInfo.email || "email@example.com"}
                    </p>
                    <p className="mt-1 text-sm">
                      {previewValues.personalInfo.phone || "+91 98765 43210"}
                    </p>
                    <p className="mt-1 text-sm">
                      {previewValues.personalInfo.location || "City, Country"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">
                      Links
                    </p>
                    <p className="mt-2 text-sm">
                      {previewValues.personalInfo.website || "Portfolio link"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">
                    Experience
                  </p>
                  <div className="mt-3 space-y-4">
                    {previewValues.experience.slice(0, 2).map((experience) => (
                      <div key={experience.id}>
                        <p className="font-semibold text-slate-100">
                          {experience.position || "Position"} at{" "}
                          {experience.company || "Company"}
                        </p>
                        <p className="text-sm text-slate-400">
                          {experience.startDate || "Start"} -{" "}
                          {experience.current
                            ? "Present"
                            : experience.endDate || "End"}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-slate-300">
                          {experience.description ||
                            "Write a concise accomplishment-oriented summary of your role."}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">
                      Skills
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {previewValues.skills.slice(0, 6).map((skill) => (
                        <span
                          key={skill.id}
                          className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-200"
                        >
                          {skill.name || "Skill"}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">
                      Languages
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2 text-sm text-slate-300">
                      {previewValues.languages
                        .filter((item) => Boolean(item?.value))
                        .map((language, index) => (
                          <span
                            key={`${language?.value}-${index}`}
                            className="rounded-full bg-slate-800 px-3 py-1"
                          >
                            {language.value}
                          </span>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-[1.75rem] border border-slate-800 bg-slate-950/80 p-8 text-sm text-slate-400">
            Preview will appear once the builder is mounted.
          </div>
        )}
      </aside>
    </div>
  );
}
