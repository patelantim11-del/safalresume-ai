"use client";
import { exportPreviewPdf } from "@/lib/exportPdf";

// CareerAssistant moved to dedicated /toolkit page
import CareerAssistant from "@/components/CareerAssistant";
import { Modal } from "@/components/ui/Modal";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { Download, FileText, Plus, Sparkles, Trash } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

// Minimal resume schema & helpers (keeps the form self-contained)
const resumeSchema = z.object({
  title: z.string().min(1).optional(),
  template: z.string().optional(),
  personalInfo: z.object({
    fullName: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
    location: z.string().optional(),
    jobTitle: z.string().optional(),
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
        company: z.string().optional(),
        position: z.string().optional(),
        location: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        current: z.boolean().optional(),
        description: z.string().optional(),
      }),
    )
    .default([]),
  education: z
    .array(
      z.object({
        id: z.string(),
        school: z.string().optional(),
        degree: z.string().optional(),
        field: z.string().optional(),
        location: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      }),
    )
    .default([]),
  skills: z
    .array(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        level: z.string().optional(),
      }),
    )
    .default([]),
  projects: z
    .array(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        description: z.string().optional(),
        link: z.string().optional(),
      }),
    )
    .default([]),
  certifications: z
    .array(z.object({ id: z.string(), value: z.string().optional() }))
    .default([]),
  achievements: z
    .array(z.object({ id: z.string(), value: z.string().optional() }))
    .default([]),
  languages: z
    .array(z.object({ id: z.string(), value: z.string().optional() }))
    .default([]),
  socialLinks: z
    .array(
      z.object({
        id: z.string(),
        label: z.string().optional(),
        url: z.string().optional(),
      }),
    )
    .default([]),
});

type ResumeFormValues = z.infer<typeof resumeSchema>;

function genId(prefix = "id") {
  try {
    return `${prefix}-${crypto.randomUUID()}`;
  } catch {
    return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
  }
}

function createExperience() {
  return {
    id: genId("experience"),
    company: "",
    position: "",
    location: "",
    startDate: "",
    endDate: "",
    current: false,
    description: "",
  };
}

function createEducation() {
  return {
    id: genId("education"),
    school: "",
    degree: "",
    field: "",
    location: "",
    startDate: "",
    endDate: "",
  };
}

function createSkill() {
  return { id: genId("skill"), name: "", level: "Intermediate" };
}

function createProject() {
  return { id: genId("project"), name: "", description: "", link: "" };
}

function createCertification() {
  return { id: genId("certification"), value: "" };
}

function createAchievement() {
  return { id: genId("achievement"), value: "" };
}

function createLanguage() {
  return { id: genId("language"), value: "" };
}

function createSocialLink() {
  return { id: genId("social"), label: "", url: "" };
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
    mode: "onChange",
  });

  const [savedResumeId, setSavedResumeId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  // theme reserved for future (light/dark) toggling (placeholder)

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
          setLastSavedAt(Date.now());
          setStatusMessage({ type: "success", text: "Auto-saved" });
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

  const builderSteps = [
    "Personal",
    "Experience",
    "Education",
    "Skills & Projects",
    "Certifications",
    "Languages & Socials",
    "Preview",
  ];

  const formRef = useRef<HTMLFormElement | null>(null);
  const sectionRefs = useRef<Array<HTMLElement | null>>([]);
  const previewRef = useRef<HTMLElement | null>(null);

  const [historyOpen, setHistoryOpen] = useState(false);
  const [versions, setVersions] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<any | null>(null);
  const [restoring, setRestoring] = useState(false);

  const [previewScale, setPreviewScale] = useState(1);
  const [isPreviewVisible, setIsPreviewVisible] = useState(true);

  function scrollToStep(index: number) {
    setCurrentStep(index);
    const el =
      sectionRefs.current[index] || previewRef.current || formRef.current;
    try {
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch {
      // ignore
    }
  }

  function zoomIn() {
    setPreviewScale((s) => Math.min(1.75, +(s + 0.1).toFixed(2)));
  }
  function zoomOut() {
    setPreviewScale((s) => Math.max(0.5, +(s - 0.1).toFixed(2)));
  }
  function fitPage() {
    setPreviewScale(1);
  }

  // (collapse feature reserved for future)

  const completion = useMemo(() => {
    const values = form.getValues();
    const checks: boolean[] = [];
    checks.push(Boolean(values.title && values.title.trim().length >= 3));
    checks.push(Boolean(values.personalInfo?.fullName?.trim()));
    checks.push(Boolean(values.personalInfo?.email?.trim()));
    checks.push(Boolean(values.personalInfo?.jobTitle?.trim()));
    checks.push(
      Array.isArray(values.experience) && values.experience.length > 0,
    );
    checks.push(Array.isArray(values.education) && values.education.length > 0);
    checks.push(
      Array.isArray(values.skills) &&
        values.skills.some((s) => s.name && s.name.trim()),
    );
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [form]);

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

  // IntersectionObserver: track which section is visible to highlight left nav
  useEffect(() => {
    const els = sectionRefs.current.filter(Boolean) as Element[];
    if (!els.length) return;
    let observer: IntersectionObserver | null = null;
    try {
      observer = new IntersectionObserver(
        (entries) => {
          const visible = entries
            .filter((e) => e.isIntersecting)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
          if (visible.length) {
            const idx = els.indexOf(visible[0].target as Element);
            if (idx >= 0) setCurrentStep(idx);
          }
        },
        { threshold: [0.25, 0.5, 0.75] },
      );

      els.forEach((el) => observer?.observe(el));
    } catch {
      // ignore
    }

    return () => {
      if (observer) els.forEach((el) => observer?.unobserve(el));
      observer = null;
    };
  }, [sectionRefs]);

  // Simple UI actions
  function handleDuplicate() {
    const values = form.getValues();
    form.reset({ ...values, title: `Copy of ${values.title}` } as any);
    setSavedResumeId(null);
    setStatusMessage({ type: "info", text: "Duplicated locally." });
  }

  function handleDelete() {
    form.reset(defaultValues as any);
    setSavedResumeId(null);
    setStatusMessage({
      type: "info",
      text: "Cleared locally. (No server delete)",
    });
  }

  function handleHistory() {
    if (!savedResumeId) {
      setStatusMessage({
        type: "info",
        text: "No saved resume to show history.",
      });
      return;
    }
    // open modal and fetch versions
    setHistoryOpen(true);
  }

  useEffect(() => {
    async function fetchVersions() {
      if (!historyOpen) return;
      if (!savedResumeId) return;
      setHistoryLoading(true);
      try {
        const res = await fetch(`/api/resumes/${savedResumeId}/versions`);
        if (!res.ok) {
          setStatusMessage({
            type: "error",
            text: "Unable to fetch versions.",
          });
          setVersions([]);
          return;
        }
        const data = await res.json();
        setVersions(Array.isArray(data.versions) ? data.versions : []);
      } catch {
        setStatusMessage({ type: "error", text: "Failed to fetch versions." });
      } finally {
        setHistoryLoading(false);
      }
    }

    fetchVersions();
  }, [historyOpen, savedResumeId]);

  async function restoreVersion(version: any) {
    if (!savedResumeId) return;
    if (!version) return;
    const ok = confirm(
      "Restore this version? This will overwrite current content.",
    );
    if (!ok) return;
    setRestoring(true);
    try {
      const res = await fetch(`/api/resumes/${savedResumeId}/versions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          versionId: version.id ?? version._id ?? version.versionId,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setStatusMessage({
          type: "error",
          text: `Restore failed: ${data?.error || res.statusText}`,
        });
        return;
      }
      const data = await res.json();
      const resume = data?.resume;
      if (resume) {
        form.reset({
          title: resume.title ?? defaultValues.title,
          template: resume.template ?? defaultValues.template,
          personalInfo: {
            ...defaultValues.personalInfo,
            ...(resume.personalInfo ?? {}),
          },
          experience: resume.experience?.length
            ? resume.experience
            : [createExperience()],
          education: resume.education?.length
            ? resume.education
            : [createEducation()],
          skills: resume.skills?.length ? resume.skills : [createSkill()],
          projects: resume.projects?.length
            ? resume.projects
            : [createProject()],
          certifications: resume.certifications ?? [],
          achievements: resume.achievements ?? [],
          languages: resume.languages ?? [],
          socialLinks: resume.socialLinks ?? [],
        } as any);
        setStatusMessage({ type: "success", text: "Version restored." });
        setHistoryOpen(false);
      }
    } catch {
      setStatusMessage({
        type: "error",
        text: "Restore failed due to network error.",
      });
    } finally {
      setRestoring(false);
    }
  }

  function generateSummary() {
    const personal = form.getValues("personalInfo") || {};
    const jobTitle = (personal as any).jobTitle;
    const location = (personal as any).location;
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
    const currentSkills = form.getValues("skills") || [];
    suggestions.forEach((skill) => {
      const exists = currentSkills.some(
        (item: any) => (item?.name || "").toLowerCase() === skill.toLowerCase(),
      );
      if (!exists) {
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
    return (async () => {
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
          if (resumeId) setSavedResumeId(resumeId);

          setStatusMessage({
            type: "success",
            text: "Resume saved successfully.",
          });
        }
        setLastSavedAt(Date.now());
      } catch (err: any) {
        setStatusMessage({
          type: "error",
          text: `Save failed: ${err?.message ?? String(err)}`,
        });
      } finally {
        setIsSaving(false);
      }
    })();
  }

  function downloadPdf() {
    // Export only the preview using html2pdf helper
    exportPreviewPdf();
  }

  const formatTime = useCallback((ts: number | null) => {
    if (!ts) return "-";
    const d = new Date(ts);
    return d.toLocaleString();
  }, []);

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
    <div className="grid gap-8 xl:grid-cols-[220px_1fr_0.9fr]">
      {/* Left navigation (hidden on small screens) */}
      <nav className="hidden xl:block">
        <div className="sticky top-8 space-y-4">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-sky-400">
              Sections
            </p>
            <div className="mt-3 space-y-2">
              {builderSteps.map((step, idx) => (
                <button
                  key={step}
                  onClick={() => scrollToStep(idx)}
                  className={`w-full text-left rounded-xl px-3 py-2 text-sm transition-colors ${
                    currentStep === idx
                      ? "bg-sky-500 text-white"
                      : "text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  {step}
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>
      <form
        ref={(el) => {
          formRef.current = el;
        }}
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 rounded-4xl border border-slate-800 bg-slate-900/90 p-8 shadow-xl shadow-slate-950/20"
      >
        {/* Top sticky action bar */}
        <div className="sticky top-6 z-20 -mx-8 mb-4 rounded-t-4xl bg-gradient-to-b from-slate-900/80 to-transparent px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => form.handleSubmit(onSubmit)()}
                className="inline-flex items-center gap-2 rounded-2xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white"
              >
                <FileText size={16} /> Save
              </button>
              <button
                type="button"
                onClick={downloadPdf}
                className="inline-flex items-center gap-2 rounded-2xl bg-slate-800 px-3 py-2 text-sm text-slate-200"
              >
                <Download size={14} /> PDF
              </button>
              <button
                type="button"
                onClick={handleHistory}
                className="inline-flex items-center gap-2 rounded-2xl bg-slate-800 px-3 py-2 text-sm text-slate-200"
              >
                History
              </button>
              <button
                type="button"
                onClick={handleDuplicate}
                className="inline-flex items-center gap-2 rounded-2xl bg-slate-800 px-3 py-2 text-sm text-slate-200"
              >
                Duplicate
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="inline-flex items-center gap-2 rounded-2xl bg-rose-700 px-3 py-2 text-sm text-white"
              >
                Delete
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2">
                <button
                  type="button"
                  onClick={zoomOut}
                  className="rounded-2xl bg-slate-800 px-3 py-2 text-sm text-slate-200"
                >
                  -
                </button>
                <div className="text-sm text-slate-200">
                  {Math.round(previewScale * 100)}%
                </div>
                <button
                  type="button"
                  onClick={zoomIn}
                  className="rounded-2xl bg-slate-800 px-3 py-2 text-sm text-slate-200"
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={fitPage}
                  className="rounded-2xl bg-slate-800 px-3 py-2 text-sm text-slate-200"
                >
                  Fit
                </button>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden sm:block">
                  <div className="w-40 rounded-full bg-slate-800/50 px-2 py-1">
                    <div className="h-2 rounded-full bg-slate-700">
                      <div
                        className="h-2 rounded-full bg-sky-500"
                        style={{ width: `${completion}%` }}
                      />
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPreviewVisible((v) => !v)}
                  className="rounded-2xl bg-slate-800 px-3 py-2 text-sm text-slate-200"
                >
                  {isPreviewVisible ? "Hide" : "Show"} Preview
                </button>
              </div>
            </div>
          </div>
        </div>
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
          <AnimatePresence>
            {statusMessage ? (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
                className={`rounded-3xl border px-4 py-3 text-sm ${
                  statusMessage.type === "success"
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                    : statusMessage.type === "error"
                      ? "border-rose-500/30 bg-rose-500/10 text-rose-200"
                      : "border-slate-700 bg-slate-900 text-slate-300"
                }`}
              >
                {statusMessage.text}
              </motion.div>
            ) : null}
          </AnimatePresence>
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
          <section
            ref={(el) => {
              sectionRefs.current[0] = el;
            }}
            className="space-y-4 rounded-3xl border border-slate-800 bg-slate-950/90 p-6"
          >
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
          <section
            ref={(el) => {
              sectionRefs.current[1] = el;
            }}
            className="space-y-4 rounded-3xl border border-slate-800 bg-slate-950/90 p-6"
          >
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

        <section
          ref={(el) => {
            sectionRefs.current[2] = el;
          }}
          className="space-y-4 rounded-3xl border border-slate-800 bg-slate-950/90 p-6"
        >
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

        <section
          ref={(el) => {
            sectionRefs.current[3] = el;
          }}
          className="space-y-4 rounded-3xl border border-slate-800 bg-slate-950/90 p-6"
        >
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

        <section
          ref={(el) => {
            sectionRefs.current[4] = el;
          }}
          className="grid gap-4 rounded-3xl border border-slate-800 bg-slate-950/90 p-6 lg:grid-cols-2"
        >
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

        <section
          ref={(el) => {
            sectionRefs.current[5] = el;
          }}
          className="rounded-3xl border border-slate-800 bg-slate-950/90 p-6"
        >
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

      {/* Mobile bottom toolbar for quick actions */}
      <AnimatePresence>
        {isMounted && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="fixed bottom-4 left-1/2 z-40 mx-auto -translate-x-1/2 w-[92%] rounded-3xl bg-slate-900/80 p-3 shadow-lg xl:hidden"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  aria-label="Toggle preview"
                  onClick={() => setIsPreviewVisible((v) => !v)}
                  className="rounded-2xl bg-slate-800 px-3 py-2 text-sm text-slate-200"
                >
                  {isPreviewVisible ? "Hide" : "Show"} Preview
                </button>
                <button
                  aria-label="Save resume"
                  onClick={() => form.handleSubmit(onSubmit)()}
                  className="rounded-2xl bg-sky-500 px-3 py-2 text-sm text-white"
                >
                  Save
                </button>
              </div>
              <div className="text-sm text-slate-300">
                {lastSavedAt
                  ? `Saved ${formatTime(lastSavedAt)}`
                  : "Not saved yet"}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <aside
        ref={(el) => {
          previewRef.current = el;
        }}
        aria-live="polite"
        className="space-y-6 rounded-4xl border border-slate-800 bg-slate-950/90 p-6 shadow-xl shadow-slate-950/20"
      >
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
        <div
          id="resume-preview"
          style={{ display: isPreviewVisible ? undefined : "none" }}
          className={`overflow-hidden rounded-[1.75rem] border ${templateStyle}`}
        >
          {isMounted ? (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.25 }}
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
                        {previewValues.personalInfo.email ||
                          "email@example.com"}
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
                      {previewValues.experience
                        .slice(0, 2)
                        .map((experience) => (
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
            </motion.div>
          ) : (
            <div className="p-8 text-sm text-slate-400">
              Preview will appear once the builder is mounted.
            </div>
          )}
        </div>
      </aside>
      <Modal
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        title="Resume Versions"
      >
        <div className="space-y-4">
          {historyLoading ? (
            <div className="space-y-2">
              <div className="h-4 w-3/4 rounded bg-slate-800/50" />
              <div className="h-4 w-1/2 rounded bg-slate-800/50" />
            </div>
          ) : null}

          {!historyLoading && versions.length === 0 && (
            <p className="text-slate-400 text-center py-8">
              No saved versions yet.
            </p>
          )}

          {!historyLoading &&
            versions.map((version, idx) => (
              <div
                key={version.id ?? version._id ?? idx}
                className="p-4 rounded-2xl border border-slate-700 bg-slate-900/40"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-white">
                      Version {versions.length - idx}
                    </p>
                    <p className="text-xs text-slate-400">
                      {new Date(
                        version.timestamp || version.createdAt || Date.now(),
                      ).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedVersion(version)}
                      className="rounded-2xl bg-slate-800 px-3 py-2 text-sm text-slate-200"
                    >
                      Preview
                    </button>
                    <button
                      onClick={() => restoreVersion(version)}
                      disabled={restoring}
                      className="rounded-2xl bg-sky-500 px-3 py-2 text-sm text-white"
                    >
                      {restoring ? "Restoring..." : "Restore"}
                    </button>
                  </div>
                </div>
                {version.changes && (
                  <p className="text-sm text-slate-300 mt-2 line-clamp-3">
                    {version.changes}
                  </p>
                )}
              </div>
            ))}

          {selectedVersion && (
            <div className="mt-4 rounded-2xl border border-slate-700 bg-slate-900/40 p-4">
              <p className="text-sm font-semibold text-white">Preview</p>
              <div className="mt-2 text-sm text-slate-300 max-h-64 overflow-auto">
                <pre className="whitespace-pre-wrap">
                  {JSON.stringify(
                    selectedVersion.content || selectedVersion,
                    null,
                    2,
                  )}
                </pre>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
