"use client";

import { exportPreviewPdf } from "@/lib/exportPdf";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import {
  Award,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Copy,
  Download,
  Eye,
  EyeOff,
  FileText,
  Globe2,
  GraduationCap,
  GripVertical,
  History,
  Languages,
  LayoutTemplate,
  Link as LinkIcon,
  Mail,
  MapPin,
  PenLine,
  Phone,
  Plus,
  Redo2,
  Save,
  Share2,
  Sparkles,
  Star,
  Trash,
  Undo2,
  Wand2,
  ZoomIn,
  ZoomOut,
  type LucideIcon,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import {
  createElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

const templateIds = [
  "ats",
  "corporate",
  "executive",
  "modern",
  "fresher",
  "professional",
  "minimal",
  "aurora",
  "atlas",
  "brio",
  "canvas",
  "clarity",
  "crest",
  "ember",
  "folio",
  "graphite",
  "halo",
  "ivory",
  "keystone",
  "lattice",
  "meridian",
  "nova",
  "onyx",
  "pinnacle",
  "quartz",
  "ripple",
  "summit",
  "verve",
] as const;

const sectionIds = [
  "personal",
  "summary",
  "experience",
  "skills",
  "education",
  "projects",
  "certifications",
  "languages",
  "achievements",
  "interests",
] as const;

type AiAction = "summary" | "rewrite" | "skills" | "ats" | "review" | "grammar";

const aiActions: Array<[AiAction, string, LucideIcon]> = [
  ["summary", "AI Summary", Wand2],
  ["rewrite", "Rewrite Experience", Sparkles],
  ["skills", "Skill Suggestion", Star],
  ["ats", "ATS Score", CheckCircle2],
  ["review", "Resume Review", FileText],
  ["grammar", "Grammar Fix", PenLine],
];

type SectionId = (typeof sectionIds)[number];

const sectionLabels: Record<SectionId, string> = {
  personal: "Hero",
  summary: "Summary",
  experience: "Experience",
  skills: "Skills",
  education: "Education",
  projects: "Projects",
  certifications: "Certifications",
  languages: "Languages",
  achievements: "Achievements",
  interests: "Interests",
};

const sectionIcons: Record<SectionId, typeof FileText> = {
  personal: FileText,
  summary: PenLine,
  experience: BriefcaseBusiness,
  skills: Star,
  education: GraduationCap,
  projects: LayoutTemplate,
  certifications: Award,
  languages: Languages,
  achievements: CheckCircle2,
  interests: Sparkles,
};

const resumeSchema = z.object({
  title: z.string().min(1).optional(),
  template: z.enum(templateIds).optional(),
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
        level: z
          .enum(["Beginner", "Intermediate", "Advanced", "Expert"])
          .optional(),
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
  interests: z
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

type TemplateTone = {
  id: (typeof templateIds)[number];
  name: string;
  accent: string;
  accentSoft: string;
  ink: string;
  muted: string;
  paper: string;
  rail: string;
  layout: "classic" | "sidebar" | "split" | "band";
  photo: boolean;
};

const templates: TemplateTone[] = [
  {
    id: "ats",
    name: "ATS Prime",
    accent: "#0f172a",
    accentSoft: "#e2e8f0",
    ink: "#111827",
    muted: "#475569",
    paper: "#ffffff",
    rail: "#f8fafc",
    layout: "classic",
    photo: false,
  },
  {
    id: "corporate",
    name: "Corporate Blue",
    accent: "#1d4ed8",
    accentSoft: "#dbeafe",
    ink: "#0f172a",
    muted: "#475569",
    paper: "#ffffff",
    rail: "#f8fafc",
    layout: "band",
    photo: false,
  },
  {
    id: "executive",
    name: "Executive Slate",
    accent: "#334155",
    accentSoft: "#e2e8f0",
    ink: "#111827",
    muted: "#4b5563",
    paper: "#ffffff",
    rail: "#f1f5f9",
    layout: "split",
    photo: false,
  },
  {
    id: "modern",
    name: "Modern Cyan",
    accent: "#0891b2",
    accentSoft: "#cffafe",
    ink: "#0f172a",
    muted: "#475569",
    paper: "#ffffff",
    rail: "#ecfeff",
    layout: "sidebar",
    photo: true,
  },
  {
    id: "fresher",
    name: "Fresher Mint",
    accent: "#059669",
    accentSoft: "#d1fae5",
    ink: "#10231c",
    muted: "#4b635a",
    paper: "#ffffff",
    rail: "#f0fdf4",
    layout: "band",
    photo: true,
  },
  {
    id: "professional",
    name: "Professional",
    accent: "#2563eb",
    accentSoft: "#dbeafe",
    ink: "#111827",
    muted: "#475569",
    paper: "#ffffff",
    rail: "#f8fafc",
    layout: "classic",
    photo: false,
  },
  {
    id: "minimal",
    name: "Minimal Ink",
    accent: "#171717",
    accentSoft: "#eeeeee",
    ink: "#171717",
    muted: "#525252",
    paper: "#ffffff",
    rail: "#fafafa",
    layout: "classic",
    photo: false,
  },
  {
    id: "aurora",
    name: "Aurora",
    accent: "#7c3aed",
    accentSoft: "#ede9fe",
    ink: "#1f1b2d",
    muted: "#625b71",
    paper: "#ffffff",
    rail: "#faf5ff",
    layout: "sidebar",
    photo: true,
  },
  {
    id: "atlas",
    name: "Atlas",
    accent: "#0f766e",
    accentSoft: "#ccfbf1",
    ink: "#102422",
    muted: "#48615e",
    paper: "#ffffff",
    rail: "#f0fdfa",
    layout: "split",
    photo: false,
  },
  {
    id: "brio",
    name: "Brio",
    accent: "#be123c",
    accentSoft: "#ffe4e6",
    ink: "#26151a",
    muted: "#6a5158",
    paper: "#ffffff",
    rail: "#fff1f2",
    layout: "band",
    photo: true,
  },
  {
    id: "canvas",
    name: "Canvas",
    accent: "#ca8a04",
    accentSoft: "#fef3c7",
    ink: "#1f2937",
    muted: "#6b5e37",
    paper: "#ffffff",
    rail: "#fffbeb",
    layout: "split",
    photo: true,
  },
  {
    id: "clarity",
    name: "Clarity",
    accent: "#0284c7",
    accentSoft: "#e0f2fe",
    ink: "#0c1b26",
    muted: "#4d6475",
    paper: "#ffffff",
    rail: "#f0f9ff",
    layout: "classic",
    photo: false,
  },
  {
    id: "crest",
    name: "Crest",
    accent: "#4338ca",
    accentSoft: "#e0e7ff",
    ink: "#111827",
    muted: "#52566a",
    paper: "#ffffff",
    rail: "#eef2ff",
    layout: "sidebar",
    photo: true,
  },
  {
    id: "ember",
    name: "Ember",
    accent: "#c2410c",
    accentSoft: "#ffedd5",
    ink: "#231a14",
    muted: "#6b5b50",
    paper: "#ffffff",
    rail: "#fff7ed",
    layout: "band",
    photo: false,
  },
  {
    id: "folio",
    name: "Folio",
    accent: "#525252",
    accentSoft: "#f5f5f5",
    ink: "#171717",
    muted: "#525252",
    paper: "#ffffff",
    rail: "#fafafa",
    layout: "split",
    photo: false,
  },
  {
    id: "graphite",
    name: "Graphite",
    accent: "#111827",
    accentSoft: "#e5e7eb",
    ink: "#111827",
    muted: "#4b5563",
    paper: "#ffffff",
    rail: "#f3f4f6",
    layout: "sidebar",
    photo: false,
  },
  {
    id: "halo",
    name: "Halo",
    accent: "#9333ea",
    accentSoft: "#f3e8ff",
    ink: "#21142e",
    muted: "#62516c",
    paper: "#ffffff",
    rail: "#faf5ff",
    layout: "band",
    photo: true,
  },
  {
    id: "ivory",
    name: "Ivory",
    accent: "#a16207",
    accentSoft: "#fef9c3",
    ink: "#1f1f17",
    muted: "#676044",
    paper: "#ffffff",
    rail: "#fefce8",
    layout: "classic",
    photo: false,
  },
  {
    id: "keystone",
    name: "Keystone",
    accent: "#1e40af",
    accentSoft: "#dbeafe",
    ink: "#111827",
    muted: "#475569",
    paper: "#ffffff",
    rail: "#eff6ff",
    layout: "split",
    photo: true,
  },
  {
    id: "lattice",
    name: "Lattice",
    accent: "#047857",
    accentSoft: "#d1fae5",
    ink: "#10201a",
    muted: "#50635b",
    paper: "#ffffff",
    rail: "#ecfdf5",
    layout: "sidebar",
    photo: false,
  },
  {
    id: "meridian",
    name: "Meridian",
    accent: "#7f1d1d",
    accentSoft: "#fee2e2",
    ink: "#251616",
    muted: "#6c5555",
    paper: "#ffffff",
    rail: "#fef2f2",
    layout: "band",
    photo: false,
  },
  {
    id: "nova",
    name: "Nova",
    accent: "#0369a1",
    accentSoft: "#e0f2fe",
    ink: "#0f172a",
    muted: "#475569",
    paper: "#ffffff",
    rail: "#f0f9ff",
    layout: "sidebar",
    photo: true,
  },
  {
    id: "onyx",
    name: "Onyx",
    accent: "#27272a",
    accentSoft: "#e4e4e7",
    ink: "#18181b",
    muted: "#52525b",
    paper: "#ffffff",
    rail: "#f4f4f5",
    layout: "split",
    photo: false,
  },
  {
    id: "pinnacle",
    name: "Pinnacle",
    accent: "#155e75",
    accentSoft: "#cffafe",
    ink: "#102027",
    muted: "#4d636c",
    paper: "#ffffff",
    rail: "#ecfeff",
    layout: "band",
    photo: true,
  },
  {
    id: "quartz",
    name: "Quartz",
    accent: "#6d28d9",
    accentSoft: "#ede9fe",
    ink: "#1f1b2d",
    muted: "#5f5870",
    paper: "#ffffff",
    rail: "#f5f3ff",
    layout: "classic",
    photo: false,
  },
  {
    id: "ripple",
    name: "Ripple",
    accent: "#0e7490",
    accentSoft: "#cffafe",
    ink: "#10242a",
    muted: "#4b6269",
    paper: "#ffffff",
    rail: "#ecfeff",
    layout: "split",
    photo: true,
  },
  {
    id: "summit",
    name: "Summit",
    accent: "#365314",
    accentSoft: "#ecfccb",
    ink: "#182111",
    muted: "#56614a",
    paper: "#ffffff",
    rail: "#f7fee7",
    layout: "sidebar",
    photo: false,
  },
  {
    id: "verve",
    name: "Verve",
    accent: "#be185d",
    accentSoft: "#fce7f3",
    ink: "#28151f",
    muted: "#6a5260",
    paper: "#ffffff",
    rail: "#fdf2f8",
    layout: "band",
    photo: true,
  },
];

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

function createSkill(
  name = "",
  level: "Beginner" | "Intermediate" | "Advanced" | "Expert" = "Intermediate",
) {
  return { id: genId("skill"), name, level };
}

function createProject() {
  return { id: genId("project"), name: "", description: "", link: "" };
}

function createValue(prefix: string, value = "") {
  return { id: genId(prefix), value };
}

function createSocialLink() {
  return { id: genId("social"), label: "", url: "" };
}

const defaultValues: ResumeFormValues = {
  title: "Premium AI Resume",
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
  experience: [createExperience()],
  education: [createEducation()],
  skills: [createSkill()],
  projects: [createProject()],
  certifications: [createValue("certification")],
  achievements: [createValue("achievement")],
  languages: [createValue("language")],
  interests: [createValue("interest")],
  socialLinks: [createSocialLink()],
};

type ResumeFormProps = {
  resumeId?: string | null;
  initialData?: Partial<ResumeFormValues> | null;
  onSave?: (values: ResumeFormValues) => Promise<{ id?: string } | void>;
  multiStep?: boolean;
};

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function text(v: unknown) {
  return typeof v === "string" ? v.trim() : "";
}

function resumeToPlainText(values: ResumeFormValues) {
  const p = values.personalInfo;
  return [
    p.fullName,
    p.jobTitle,
    p.summary,
    ...values.experience.map(
      (item) => `${item.position} ${item.company} ${item.description}`,
    ),
    ...values.skills.map((skill) => skill.name),
    ...values.projects.map(
      (project) => `${project.name} ${project.description}`,
    ),
  ]
    .filter(Boolean)
    .join("\n");
}

function mergeResume(
  data: Partial<ResumeFormValues> | null | undefined,
): ResumeFormValues {
  return {
    ...defaultValues,
    ...data,
    template: templateIds.includes(
      data?.template as (typeof templateIds)[number],
    )
      ? data?.template
      : defaultValues.template,
    personalInfo: {
      ...defaultValues.personalInfo,
      ...(data?.personalInfo ?? {}),
    },
    experience: data?.experience?.length
      ? data.experience
      : [createExperience()],
    education: data?.education?.length ? data.education : [createEducation()],
    skills: data?.skills?.length ? data.skills : [createSkill()],
    projects: data?.projects?.length ? data.projects : [createProject()],
    certifications: data?.certifications ?? [],
    achievements: data?.achievements ?? [],
    languages: data?.languages ?? [],
    interests: data?.interests ?? [],
    socialLinks: data?.socialLinks ?? [],
  };
}

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

  const searchParams = useSearchParams();
  const createNew = searchParams.get("new") === "true";

  const [savedResumeId, setSavedResumeId] = useState<string | null>(
    propResumeId ?? null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [previewScale, setPreviewScale] = useState(0.78);
  const [isPreviewVisible, setIsPreviewVisible] = useState(true);
  const [sectionOrder, setSectionOrder] = useState<SectionId[]>([
    ...sectionIds,
  ]);
  const [draggedSection, setDraggedSection] = useState<SectionId | null>(null);
  const [aiBusy, setAiBusy] = useState<string | null>(null);
  const [atsScore, setAtsScore] = useState<number | null>(null);
  const [atsNotes, setAtsNotes] = useState<string[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [versions, setVersions] = useState<Array<Record<string, unknown>>>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const undoStack = useRef<string[]>([]);
  const redoStack = useRef<string[]>([]);
  const lastSnapshot = useRef("");
  const autoSaveTimer = useRef<number | null>(null);

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
  const interestFields = useFieldArray({
    name: "interests",
    control: form.control,
  });
  const socialFields = useFieldArray({
    name: "socialLinks",
    control: form.control,
  });

  const values = form.watch();
  const template = useMemo(
    () => templates.find((item) => item.id === values.template) ?? templates[5],
    [values.template],
  );

  const completion = useMemo(() => {
    const checks = [
      text(values.title).length > 2,
      text(values.personalInfo.fullName).length > 1,
      text(values.personalInfo.email).length > 4,
      text(values.personalInfo.phone).length > 7,
      text(values.personalInfo.jobTitle).length > 1,
      text(values.personalInfo.summary).length > 40,
      values.experience.some(
        (item) => text(item.company) || text(item.position),
      ),
      values.education.some((item) => text(item.school) || text(item.degree)),
      values.skills.some((item) => text(item.name)),
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [values]);

  const canUndo = undoStack.current.length > 0;
  const canRedo = redoStack.current.length > 0;

  const remember = useCallback(() => {
    const snapshot = JSON.stringify(form.getValues());
    if (snapshot !== lastSnapshot.current) {
      undoStack.current.push(lastSnapshot.current || snapshot);
      if (undoStack.current.length > 40) undoStack.current.shift();
      redoStack.current = [];
      lastSnapshot.current = snapshot;
    }
  }, [form]);

  useEffect(() => {
    async function loadResume() {
      if (initialData) {
        const merged = mergeResume(initialData);
        setSavedResumeId(propResumeId ?? null);
        form.reset(merged);
        lastSnapshot.current = JSON.stringify(merged);
        setToast({ type: "success", text: "Resume loaded." });
        setIsLoading(false);
        return;
      }

      if (!propResumeId || createNew) {
        form.reset(defaultValues);
        lastSnapshot.current = JSON.stringify(defaultValues);
        setSavedResumeId(null);
        setToast({ type: "info", text: "Fresh premium resume ready." });
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`/api/resumes/${propResumeId}`, {
          cache: "no-store",
        });
        const data = await response.json();
        if (!response.ok)
          throw new Error(data?.error || "Unable to load resume.");
        const merged = mergeResume(data.resume);
        setSavedResumeId(data.resume?.id ?? null);
        form.reset(merged);
        lastSnapshot.current = JSON.stringify(merged);
        setToast({ type: "success", text: "Resume loaded for editing." });
      } catch (error) {
        setToast({
          type: "error",
          text: error instanceof Error ? error.message : "Resume load failed.",
        });
      } finally {
        setIsLoading(false);
      }
    }

    loadResume();
  }, [createNew, form, initialData, propResumeId]);

  useEffect(() => {
    const subscription = form.watch(() => {
      window.clearTimeout(autoSaveTimer.current ?? undefined);
      autoSaveTimer.current = window.setTimeout(() => {
        const snapshot = JSON.stringify(form.getValues());
        if (snapshot !== lastSnapshot.current) {
          undoStack.current.push(lastSnapshot.current || snapshot);
          if (undoStack.current.length > 40) undoStack.current.shift();
          redoStack.current = [];
          lastSnapshot.current = snapshot;
        }
      }, 900) as unknown as number;
    });

    return () => {
      subscription.unsubscribe();
      window.clearTimeout(autoSaveTimer.current ?? undefined);
    };
  }, [form]);

  useEffect(() => {
    if (!onSave) return;
    const subscription = form.watch(() => {
      window.clearTimeout(autoSaveTimer.current ?? undefined);
      autoSaveTimer.current = window.setTimeout(async () => {
        try {
          await onSave(form.getValues());
          setLastSavedAt(Date.now());
          setToast({ type: "success", text: "Auto-saved." });
        } catch {
          setToast({ type: "error", text: "Auto-save failed." });
        }
      }, 3000) as unknown as number;
    });
    return () => subscription.unsubscribe();
  }, [form, onSave]);

  useEffect(() => {
    async function fetchVersions() {
      if (!historyOpen || !savedResumeId) return;
      setHistoryLoading(true);
      try {
        const response = await fetch(`/api/resumes/${savedResumeId}/versions`, {
          cache: "no-store",
        });
        const data = await response.json();
        setVersions(Array.isArray(data.versions) ? data.versions : []);
      } catch {
        setVersions([]);
      } finally {
        setHistoryLoading(false);
      }
    }
    fetchVersions();
  }, [historyOpen, savedResumeId]);

  function undo() {
    const previous = undoStack.current.pop();
    if (!previous) return;
    redoStack.current.push(JSON.stringify(form.getValues()));
    const parsed = JSON.parse(previous) as ResumeFormValues;
    form.reset(parsed);
    lastSnapshot.current = previous;
  }

  function redo() {
    const next = redoStack.current.pop();
    if (!next) return;
    undoStack.current.push(JSON.stringify(form.getValues()));
    const parsed = JSON.parse(next) as ResumeFormValues;
    form.reset(parsed);
    lastSnapshot.current = next;
  }

  function moveSection(section: SectionId, direction: -1 | 1) {
    setSectionOrder((order) => {
      const index = order.indexOf(section);
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= order.length) return order;
      const next = [...order];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      return next;
    });
  }

  function dropSection(target: SectionId) {
    if (!draggedSection || draggedSection === target) return;
    setSectionOrder((order) => {
      const next = order.filter((item) => item !== draggedSection);
      next.splice(next.indexOf(target), 0, draggedSection);
      return next;
    });
    setDraggedSection(null);
  }

  async function onSubmit(submittedValues: ResumeFormValues) {
    setIsSaving(true);
    setToast(null);
    try {
      const normalized = mergeResume(submittedValues);
      if (onSave) {
        await onSave(normalized);
      } else {
        const payload = savedResumeId
          ? { ...normalized, id: savedResumeId }
          : normalized;
        const response = await fetch("/api/resumes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await response.json().catch(() => null);
        if (!response.ok)
          throw new Error(
            data?.error ? JSON.stringify(data.error) : "Save failed.",
          );
        if (data?.resume?.id) setSavedResumeId(data.resume.id);
      }
      setLastSavedAt(Date.now());
      setToast({ type: "success", text: "Resume saved successfully." });
    } catch (error) {
      setToast({
        type: "error",
        text: error instanceof Error ? error.message : "Save failed.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  function downloadPdf() {
    exportPreviewPdf(form.getValues(), `${text(values.title) || "resume"}.pdf`);
  }

  function duplicateLocal() {
    remember();
    form.reset({
      ...form.getValues(),
      title: `Copy of ${form.getValues("title") || "Resume"}`,
    });
    setSavedResumeId(null);
    setToast({
      type: "info",
      text: "Duplicated locally. Save to add it to history.",
    });
  }

  function clearResume() {
    remember();
    form.reset(defaultValues);
    setSavedResumeId(null);
    setToast({ type: "info", text: "Editor cleared." });
  }

  async function runAi(action: AiAction) {
    setAiBusy(action);
    try {
      const current = form.getValues();
      const role = text(current.personalInfo.jobTitle) || "professional";
      if (action === "summary") {
        form.setValue(
          "personalInfo.summary",
          `Impact-focused ${role} with a record of delivering measurable outcomes, partnering across teams, and turning complex requirements into practical results. Known for clear communication, structured problem solving, and building momentum in fast-moving environments.`,
        );
        setToast({ type: "success", text: "AI summary drafted." });
      }
      if (action === "rewrite") {
        const first = current.experience[0];
        if (first) {
          form.setValue(
            "experience.0.description",
            `Owned high-priority initiatives from discovery through delivery, aligning stakeholders, improving execution quality, and translating business goals into measurable customer and operational impact.`,
          );
          setToast({ type: "success", text: "Experience bullet rewritten." });
        }
      }
      if (action === "skills") {
        const additions = [
          "Strategic Planning",
          "Cross-functional Leadership",
          "Data Analysis",
          "Stakeholder Management",
          "Process Improvement",
          "AI Productivity",
        ];
        additions.forEach((skill) => {
          if (
            !current.skills.some(
              (item) => text(item.name).toLowerCase() === skill.toLowerCase(),
            )
          ) {
            skillFields.append(createSkill(skill, "Advanced"));
          }
        });
        setToast({ type: "success", text: "Skill suggestions added." });
      }
      if (action === "grammar") {
        const summary = text(current.personalInfo.summary);
        if (summary) {
          form.setValue(
            "personalInfo.summary",
            summary.replace(/\s+/g, " ").replace(/\bi\b/g, "I"),
          );
        }
        setToast({ type: "success", text: "Grammar pass applied." });
      }
      if (action === "ats" || action === "review") {
        const resumeText = resumeToPlainText(current);
        let score = Math.min(
          98,
          Math.max(62, completion + (current.skills.length > 5 ? 8 : 0)),
        );
        let notes = [
          "Use role-specific keywords from the job description in summary and experience.",
          "Keep headings simple and ATS-readable.",
          "Add quantified outcomes to the top three experience bullets.",
        ];
        try {
          const response = await fetch("/api/ai/ats-analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ resumeText }),
          });
          if (response.ok) {
            const data = await response.json();
            score = typeof data.score === "number" ? data.score : score;
            notes = [
              ...(data.suggestions ?? []),
              ...(data.formattingIssues ?? []),
            ].slice(0, 5);
          }
        } catch {
          // Local heuristic remains the fallback.
        }
        setAtsScore(score);
        setAtsNotes(notes);
        setToast({
          type: "success",
          text: action === "ats" ? "ATS score ready." : "AI review ready.",
        });
      }
    } finally {
      setAiBusy(null);
    }
  }

  const fieldClass =
    "mt-2 w-full rounded-xl border border-slate-700/80 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20";
  const labelClass =
    "block text-xs font-semibold uppercase tracking-[0.16em] text-slate-300";

  function FormShell({
    id,
    children,
  }: {
    id: SectionId;
    children: React.ReactNode;
  }) {
    const Icon = sectionIcons[id];
    return (
      <motion.section
        layout
        id={`builder-${id}`}
        className="rounded-2xl border border-white/10 bg-slate-900/72 p-5 shadow-2xl shadow-slate-950/20 backdrop-blur"
      >
        <div className="mb-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/7 text-cyan-200">
              <Icon size={18} />
            </span>
            <div>
              <h3 className="text-lg font-semibold text-white">
                {sectionLabels[id]}
              </h3>
              <p className="text-xs text-slate-400">
                A4-safe, ATS-friendly content block
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              title="Move section up"
              onClick={() => moveSection(id, -1)}
              className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white"
            >
              <ChevronUp size={16} />
            </button>
            <button
              type="button"
              title="Move section down"
              onClick={() => moveSection(id, 1)}
              className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white"
            >
              <ChevronDown size={16} />
            </button>
          </div>
        </div>
        {children}
      </motion.section>
    );
  }

  function renderEditorSection(id: SectionId) {
    if (multiStep && currentStep !== sectionOrder.indexOf(id)) return null;
    if (id === "personal") {
      return (
        <FormShell id={id} key={id}>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              ["Full name", "personalInfo.fullName"],
              ["Role / headline", "personalInfo.jobTitle"],
              ["Email", "personalInfo.email"],
              ["Phone", "personalInfo.phone"],
              ["Location", "personalInfo.location"],
              ["Website", "personalInfo.website"],
              ["LinkedIn", "personalInfo.linkedin"],
              ["GitHub", "personalInfo.github"],
              ["Profile photo URL", "personalInfo.photoUrl"],
            ].map(([label, name]) => (
              <label
                key={name}
                className={cx(
                  labelClass,
                  name === "personalInfo.photoUrl" && "md:col-span-2",
                )}
              >
                {label}
                <input
                  {...form.register(name as keyof ResumeFormValues)}
                  className={fieldClass}
                />
              </label>
            ))}
          </div>
          <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950/45 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-slate-100">
                Additional social links
              </p>
              <button
                type="button"
                onClick={() => socialFields.append(createSocialLink())}
                className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold text-slate-100"
              >
                <Plus size={14} /> Add link
              </button>
            </div>
            <div className="space-y-3">
              {socialFields.fields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid gap-2 md:grid-cols-[180px_1fr_auto]"
                >
                  <input
                    {...form.register(`socialLinks.${index}.label`)}
                    placeholder="Label"
                    className={fieldClass}
                  />
                  <input
                    {...form.register(`socialLinks.${index}.url`)}
                    placeholder="https://..."
                    className={fieldClass}
                  />
                  <button
                    type="button"
                    onClick={() => socialFields.remove(index)}
                    className="mt-2 rounded-xl border border-slate-700 px-3 text-rose-200"
                  >
                    <Trash size={15} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </FormShell>
      );
    }
    if (id === "summary") {
      return (
        <FormShell id={id} key={id}>
          <label className={labelClass}>
            Professional summary
            <textarea
              {...form.register("personalInfo.summary")}
              rows={6}
              className={cx(fieldClass, "min-h-40 resize-y leading-7")}
            />
          </label>
        </FormShell>
      );
    }
    if (id === "experience") {
      return (
        <FormShell id={id} key={id}>
          <div className="space-y-4">
            {experienceFields.fields.map((field, index) => (
              <div
                key={field.id}
                className="rounded-xl border border-slate-800 bg-slate-950/55 p-4"
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <label className={labelClass}>
                    Position
                    <input
                      {...form.register(`experience.${index}.position`)}
                      className={fieldClass}
                    />
                  </label>
                  <label className={labelClass}>
                    Company
                    <input
                      {...form.register(`experience.${index}.company`)}
                      className={fieldClass}
                    />
                  </label>
                  <label className={labelClass}>
                    Location
                    <input
                      {...form.register(`experience.${index}.location`)}
                      className={fieldClass}
                    />
                  </label>
                  <label className={labelClass}>
                    Start date
                    <input
                      {...form.register(`experience.${index}.startDate`)}
                      className={fieldClass}
                    />
                  </label>
                  <label className={labelClass}>
                    End date
                    <input
                      {...form.register(`experience.${index}.endDate`)}
                      className={fieldClass}
                    />
                  </label>
                  <label className="mt-8 flex items-center gap-3 text-sm text-slate-200">
                    <input
                      type="checkbox"
                      {...form.register(`experience.${index}.current`)}
                    />{" "}
                    Current role
                  </label>
                  <label className={cx(labelClass, "md:col-span-2")}>
                    Impact bullets
                    <textarea
                      {...form.register(`experience.${index}.description`)}
                      rows={5}
                      className={cx(fieldClass, "resize-y leading-7")}
                    />
                  </label>
                </div>
                <button
                  type="button"
                  onClick={() => experienceFields.remove(index)}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-rose-200 hover:bg-rose-500/10"
                >
                  <Trash size={15} /> Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => experienceFields.append(createExperience())}
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950"
            >
              <Plus size={16} /> Add experience
            </button>
          </div>
        </FormShell>
      );
    }
    if (id === "education") {
      return (
        <FormShell id={id} key={id}>
          <div className="space-y-4">
            {educationFields.fields.map((field, index) => (
              <div
                key={field.id}
                className="grid gap-4 rounded-xl border border-slate-800 bg-slate-950/55 p-4 md:grid-cols-2"
              >
                <label className={labelClass}>
                  School
                  <input
                    {...form.register(`education.${index}.school`)}
                    className={fieldClass}
                  />
                </label>
                <label className={labelClass}>
                  Degree
                  <input
                    {...form.register(`education.${index}.degree`)}
                    className={fieldClass}
                  />
                </label>
                <label className={labelClass}>
                  Field
                  <input
                    {...form.register(`education.${index}.field`)}
                    className={fieldClass}
                  />
                </label>
                <label className={labelClass}>
                  Location
                  <input
                    {...form.register(`education.${index}.location`)}
                    className={fieldClass}
                  />
                </label>
                <label className={labelClass}>
                  Start date
                  <input
                    {...form.register(`education.${index}.startDate`)}
                    className={fieldClass}
                  />
                </label>
                <label className={labelClass}>
                  End date
                  <input
                    {...form.register(`education.${index}.endDate`)}
                    className={fieldClass}
                  />
                </label>
                <button
                  type="button"
                  onClick={() => educationFields.remove(index)}
                  className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-rose-200 hover:bg-rose-500/10"
                >
                  <Trash size={15} /> Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => educationFields.append(createEducation())}
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950"
            >
              <Plus size={16} /> Add education
            </button>
          </div>
        </FormShell>
      );
    }
    if (id === "skills") {
      return (
        <FormShell id={id} key={id}>
          <div className="grid gap-3 sm:grid-cols-2">
            {skillFields.fields.map((field, index) => (
              <div
                key={field.id}
                className="grid grid-cols-[1fr_132px_auto] gap-2"
              >
                <input
                  {...form.register(`skills.${index}.name`)}
                  placeholder="Skill"
                  className={fieldClass}
                />
                <select
                  {...form.register(`skills.${index}.level`)}
                  className={fieldClass}
                >
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                  <option>Expert</option>
                </select>
                <button
                  type="button"
                  onClick={() => skillFields.remove(index)}
                  className="mt-2 rounded-xl border border-slate-700 px-3 text-rose-200"
                >
                  <Trash size={15} />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => skillFields.append(createSkill())}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950"
          >
            <Plus size={16} /> Add skill
          </button>
        </FormShell>
      );
    }
    if (id === "projects") {
      return (
        <FormShell id={id} key={id}>
          <div className="space-y-4">
            {projectFields.fields.map((field, index) => (
              <div
                key={field.id}
                className="grid gap-4 rounded-xl border border-slate-800 bg-slate-950/55 p-4 md:grid-cols-2"
              >
                <label className={labelClass}>
                  Project
                  <input
                    {...form.register(`projects.${index}.name`)}
                    className={fieldClass}
                  />
                </label>
                <label className={labelClass}>
                  Link
                  <input
                    {...form.register(`projects.${index}.link`)}
                    className={fieldClass}
                  />
                </label>
                <label className={cx(labelClass, "md:col-span-2")}>
                  Description
                  <textarea
                    {...form.register(`projects.${index}.description`)}
                    rows={4}
                    className={fieldClass}
                  />
                </label>
                <button
                  type="button"
                  onClick={() => projectFields.remove(index)}
                  className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-rose-200 hover:bg-rose-500/10"
                >
                  <Trash size={15} /> Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => projectFields.append(createProject())}
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950"
            >
              <Plus size={16} /> Add project
            </button>
          </div>
        </FormShell>
      );
    }

    const arrays = {
      certifications: {
        fields: certificationFields.fields,
        append: () => certificationFields.append(createValue("certification")),
        remove: certificationFields.remove,
        name: "certifications",
      },
      achievements: {
        fields: achievementFields.fields,
        append: () => achievementFields.append(createValue("achievement")),
        remove: achievementFields.remove,
        name: "achievements",
      },
      languages: {
        fields: languageFields.fields,
        append: () => languageFields.append(createValue("language")),
        remove: languageFields.remove,
        name: "languages",
      },
      interests: {
        fields: interestFields.fields,
        append: () => interestFields.append(createValue("interest")),
        remove: interestFields.remove,
        name: "interests",
      },
    } as const;
    const data = arrays[id as keyof typeof arrays];
    if (data) {
      return (
        <FormShell id={id} key={id}>
          <div className="space-y-3">
            {data.fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-[1fr_auto] gap-2">
                <input
                  {...form.register(`${data.name}.${index}.value` as const)}
                  className={fieldClass}
                />
                <button
                  type="button"
                  onClick={() => data.remove(index)}
                  className="mt-2 rounded-xl border border-slate-700 px-3 text-rose-200"
                >
                  <Trash size={15} />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={data.append}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950"
          >
            <Plus size={16} /> Add {sectionLabels[id].toLowerCase()}
          </button>
        </FormShell>
      );
    }
    return null;
  }

  if (isLoading) {
    return (
      <div className="grid gap-6 lg:grid-cols-[1fr_520px]">
        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-44 animate-pulse rounded-2xl bg-slate-900/80"
            />
          ))}
        </div>
        <div className="h-[720px] animate-pulse rounded-2xl bg-slate-900/80" />
      </div>
    );
  }

  return (
    <div className="grid gap-6 2xl:grid-cols-[250px_minmax(0,1fr)_620px]">
      <aside className="hidden 2xl:block">
        <div className="sticky top-6 rounded-2xl border border-white/10 bg-white/6 p-4 backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">
            Sections
          </p>
          <div className="mt-4 space-y-2">
            {sectionOrder.map((id, index) => {
              const Icon = sectionIcons[id];
              return (
                <button
                  key={id}
                  type="button"
                  draggable
                  onDragStart={() => setDraggedSection(id)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => dropSection(id)}
                  onClick={() => {
                    setCurrentStep(index);
                    document
                      .getElementById(`builder-${id}`)
                      ?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className={cx(
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition",
                    currentStep === index
                      ? "bg-cyan-400 text-slate-950"
                      : "text-slate-300 hover:bg-white/10",
                  )}
                >
                  <GripVertical size={14} />
                  <Icon size={16} />
                  {sectionLabels[id]}
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="min-w-0 space-y-5"
      >
        <div className="sticky top-4 z-30 rounded-2xl border border-white/10 bg-slate-950/86 p-4 shadow-2xl shadow-slate-950/30 backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">
                Premium builder
              </p>
              <h2 className="text-2xl font-semibold text-white">
                World-class AI resume studio
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={undo}
                disabled={!canUndo}
                title="Undo"
                className="rounded-xl border border-white/10 p-3 text-slate-200 disabled:opacity-40"
              >
                <Undo2 size={17} />
              </button>
              <button
                type="button"
                onClick={redo}
                disabled={!canRedo}
                title="Redo"
                className="rounded-xl border border-white/10 p-3 text-slate-200 disabled:opacity-40"
              >
                <Redo2 size={17} />
              </button>
              <button
                type="button"
                onClick={duplicateLocal}
                title="Duplicate"
                className="rounded-xl border border-white/10 p-3 text-slate-200"
              >
                <Copy size={17} />
              </button>
              <button
                type="button"
                onClick={clearResume}
                title="Delete draft"
                className="rounded-xl border border-rose-400/30 p-3 text-rose-200"
              >
                <Trash size={17} />
              </button>
              <button
                type="button"
                onClick={() => setHistoryOpen((open) => !open)}
                title="History"
                className="rounded-xl border border-white/10 p-3 text-slate-200"
              >
                <History size={17} />
              </button>
              <button
                type="button"
                onClick={() =>
                  setToast({
                    type: "info",
                    text: savedResumeId
                      ? `Share link: /dashboard/resumes/view/${savedResumeId}`
                      : "Save the resume before sharing.",
                  })
                }
                title="Share resume"
                className="rounded-xl border border-white/10 p-3 text-slate-200"
              >
                <Share2 size={17} />
              </button>
              <button
                type="button"
                onClick={downloadPdf}
                title="Download PDF"
                className="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-950"
              >
                <Download size={17} />
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 disabled:opacity-60"
              >
                <Save size={17} /> {isSaving ? "Saving" : "Save"}
              </button>
            </div>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-[1fr_260px_160px]">
            <label className={labelClass}>
              Resume title
              <input {...form.register("title")} className={fieldClass} />
            </label>
            <label className={labelClass}>
              Template
              <select {...form.register("template")} className={fieldClass}>
                {templates.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
            <div>
              <p className={labelClass}>Completion</p>
              <div className="mt-4 h-3 rounded-full bg-slate-800">
                <div
                  className="h-3 rounded-full bg-cyan-400 transition-all"
                  style={{ width: `${completion}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-slate-400">{completion}% ready</p>
              {lastSavedAt ? (
                <p className="mt-1 text-xs text-slate-500">
                  Saved {new Date(lastSavedAt).toLocaleTimeString()}
                </p>
              ) : null}
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {aiActions.map(([action, label, Icon]) => (
              <button
                key={action}
                type="button"
                onClick={() => runAi(action)}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/7 px-3 py-2 text-sm text-slate-200 hover:bg-white/12"
              >
                {createElement(Icon, { size: 15 })}{" "}
                {aiBusy === action ? "Working..." : label}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence>
          {toast ? (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className={cx(
                "rounded-xl border px-4 py-3 text-sm",
                toast.type === "error"
                  ? "border-rose-400/30 bg-rose-500/10 text-rose-100"
                  : toast.type === "success"
                    ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-100"
                    : "border-cyan-400/30 bg-cyan-500/10 text-cyan-100",
              )}
            >
              {toast.text}
            </motion.div>
          ) : null}
        </AnimatePresence>

        {historyOpen ? (
          <div className="rounded-2xl border border-white/10 bg-slate-900/75 p-5">
            <h3 className="text-lg font-semibold text-white">Resume history</h3>
            <div className="mt-3 text-sm text-slate-300">
              {historyLoading
                ? "Loading versions..."
                : versions.length
                  ? versions.map((item, index) => (
                      <p key={String(item.id ?? index)}>
                        Version {index + 1} -{" "}
                        {String(item.createdAt ?? item.updatedAt ?? "Saved")}
                      </p>
                    ))
                  : "No saved versions yet."}
            </div>
          </div>
        ) : null}

        {atsScore !== null ? (
          <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  AI ATS Score
                </h3>
                <p className="text-sm text-cyan-100">Score: {atsScore}/100</p>
              </div>
              <CheckCircle2 className="text-cyan-200" />
            </div>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-200">
              {atsNotes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="space-y-5">{sectionOrder.map(renderEditorSection)}</div>

        {multiStep ? (
          <div className="flex justify-between rounded-2xl border border-white/10 bg-slate-900/75 p-4">
            <button
              type="button"
              onClick={() => setCurrentStep((step) => Math.max(0, step - 1))}
              className="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-200"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() =>
                setCurrentStep((step) =>
                  Math.min(sectionOrder.length - 1, step + 1),
                )
              }
              className="rounded-xl bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950"
            >
              Next
            </button>
          </div>
        ) : null}
      </form>

      {isPreviewVisible ? (
        <aside className="min-w-0">
          <div className="sticky top-6 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-white/10 bg-white/6 p-3 backdrop-blur">
              <div className="flex items-center gap-2 text-sm text-slate-200">
                <Eye size={16} /> Live preview
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() =>
                    setPreviewScale((scale) =>
                      Math.max(0.48, +(scale - 0.06).toFixed(2)),
                    )
                  }
                  title="Zoom out"
                  className="rounded-lg p-2 text-slate-200 hover:bg-white/10"
                >
                  <ZoomOut size={16} />
                </button>
                <span className="w-12 text-center text-xs text-slate-300">
                  {Math.round(previewScale * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setPreviewScale((scale) =>
                      Math.min(1.25, +(scale + 0.06).toFixed(2)),
                    )
                  }
                  title="Zoom in"
                  className="rounded-lg p-2 text-slate-200 hover:bg-white/10"
                >
                  <ZoomIn size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setIsPreviewVisible(false)}
                  title="Hide preview"
                  className="rounded-lg p-2 text-slate-200 hover:bg-white/10"
                >
                  <EyeOff size={16} />
                </button>
              </div>
            </div>
            <div className="overflow-auto rounded-2xl border border-white/10 bg-slate-950/70 p-4">
              <div
                style={{
                  transform: `scale(${previewScale})`,
                  transformOrigin: "top left",
                  width: `${210 / previewScale}mm`,
                  minHeight: `${297 / previewScale}mm`,
                }}
              >
                <ResumePreview
                  values={values}
                  template={template}
                  sectionOrder={sectionOrder}
                />
              </div>
            </div>
          </div>
        </aside>
      ) : (
        <button
          type="button"
          onClick={() => setIsPreviewVisible(true)}
          className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 shadow-xl"
        >
          <Eye size={16} /> Show preview
        </button>
      )}
    </div>
  );
}

function ResumePreview({
  values,
  template,
  sectionOrder,
}: {
  values: ResumeFormValues;
  template: TemplateTone;
  sectionOrder: SectionId[];
}) {
  const p = values.personalInfo;
  const contact: Array<[LucideIcon, string]> = [
    [Mail, p.email],
    [Phone, p.phone],
    [MapPin, p.location],
    [Globe2, p.website],
    [LinkIcon, p.linkedin],
  ].filter((item): item is [LucideIcon, string] => Boolean(text(item[1])));
  const hasPhoto = template.photo && text(p.photoUrl);

  const renderSection = (id: SectionId) => {
    if (id === "personal") return null;
    if (id === "summary" && text(p.summary))
      return (
        <PreviewSection key={id} title="Profile" template={template}>
          <p>{p.summary}</p>
        </PreviewSection>
      );
    if (
      id === "experience" &&
      values.experience.some(
        (item) => text(item.company) || text(item.position),
      )
    ) {
      return (
        <PreviewSection key={id} title="Experience" template={template}>
          {values.experience.map((item) => (
            <TimelineItem
              key={item.id}
              title={item.position}
              subtitle={item.company}
              meta={`${item.startDate || ""} - ${item.current ? "Present" : item.endDate || ""}${item.location ? ` | ${item.location}` : ""}`}
              body={item.description}
              template={template}
            />
          ))}
        </PreviewSection>
      );
    }
    if (
      id === "education" &&
      values.education.some((item) => text(item.school) || text(item.degree))
    ) {
      return (
        <PreviewSection key={id} title="Education" template={template}>
          {values.education.map((item) => (
            <TimelineItem
              key={item.id}
              title={item.degree || item.field}
              subtitle={item.school}
              meta={`${item.startDate || ""} - ${item.endDate || ""}${item.location ? ` | ${item.location}` : ""}`}
              body={item.field}
              template={template}
            />
          ))}
        </PreviewSection>
      );
    }
    if (id === "skills" && values.skills.some((item) => text(item.name))) {
      return (
        <PreviewSection key={id} title="Skills" template={template}>
          <div className="resume-chip-grid">
            {values.skills
              .filter((item) => text(item.name))
              .map((item) => (
                <span
                  key={item.id}
                  className="resume-chip"
                  style={{
                    background: template.accentSoft,
                    color: template.accent,
                  }}
                >
                  {item.name}
                </span>
              ))}
          </div>
        </PreviewSection>
      );
    }
    if (id === "projects" && values.projects.some((item) => text(item.name))) {
      return (
        <PreviewSection key={id} title="Projects" template={template}>
          {values.projects.map((item) => (
            <TimelineItem
              key={item.id}
              title={item.name}
              subtitle={item.link}
              meta=""
              body={item.description}
              template={template}
            />
          ))}
        </PreviewSection>
      );
    }
    const map = {
      certifications: values.certifications,
      languages: values.languages,
      achievements: values.achievements,
      interests: values.interests,
    } as const;
    const list = map[id as keyof typeof map];
    if (list?.some((item) => text(item.value))) {
      return (
        <PreviewSection key={id} title={sectionLabels[id]} template={template}>
          <ul className="resume-list">
            {list
              .filter((item) => text(item.value))
              .map((item) => (
                <li key={item.id}>{item.value}</li>
              ))}
          </ul>
        </PreviewSection>
      );
    }
    return null;
  };

  return (
    <article
      id="resume-preview"
      data-resume-preview
      className={`resume-document resume-${template.layout}`}
      style={
        {
          "--resume-accent": template.accent,
          "--resume-accent-soft": template.accentSoft,
          "--resume-ink": template.ink,
          "--resume-muted": template.muted,
          "--resume-paper": template.paper,
          "--resume-rail": template.rail,
        } as React.CSSProperties
      }
    >
      <header className="resume-hero">
        <div>
          <p className="resume-role">{p.jobTitle || "Professional Title"}</p>
          <h1>{p.fullName || "Your Name"}</h1>
          <div className="resume-contact">
            {contact.map(([Icon, value]) => (
              <span key={String(value)}>
                <Icon size={12} /> {String(value)}
              </span>
            ))}
          </div>
        </div>
        {hasPhoto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="resume-photo" src={p.photoUrl} alt="" />
        ) : null}
      </header>
      <main className="resume-content">{sectionOrder.map(renderSection)}</main>
    </article>
  );
}

function PreviewSection({
  title,
  template,
  children,
}: {
  title: string;
  template: TemplateTone;
  children: React.ReactNode;
}) {
  return (
    <section className="resume-section">
      <h2 style={{ color: template.accent }}>{title}</h2>
      <div>{children}</div>
    </section>
  );
}

function TimelineItem({
  title,
  subtitle,
  meta,
  body,
  template,
}: {
  title?: string;
  subtitle?: string;
  meta?: string;
  body?: string;
  template: TemplateTone;
}) {
  if (!text(title) && !text(subtitle) && !text(body)) return null;
  return (
    <div className="resume-timeline-item">
      <span className="resume-dot" style={{ background: template.accent }} />
      <div>
        <h3>{title}</h3>
        {subtitle ? <p className="resume-subtitle">{subtitle}</p> : null}
        {meta ? <p className="resume-meta">{meta}</p> : null}
        {body ? <p className="resume-body-copy">{body}</p> : null}
      </div>
    </div>
  );
}
