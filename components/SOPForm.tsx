"use client";

import { exportPreviewPdf } from "@/lib/exportPdf";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const sopSchema = z.object({
  title: z.string().min(3),
  template: z.enum(["academic", "professional", "concise"] as const),
  applicantName: z.string().min(2),
  programName: z.string().min(2),
  universityName: z.string().min(2),
  currentBackground: z.string().min(20),
  motivation: z.string().min(20),
  strengths: z.string().min(20),
  longTermGoals: z.string().min(20),
  whyThisProgram: z.string().min(20),
});

type SOPValues = z.infer<typeof sopSchema>;

type Props = {
  initialData?: Partial<SOPValues> | null;
  onSave?: (values: SOPValues) => Promise<{ id?: string } | void>;
  multiStep?: boolean;
};

const defaultValues: SOPValues = {
  title: "Statement of Purpose",
  template: "academic",
  applicantName: "",
  programName: "",
  universityName: "",
  currentBackground: "",
  motivation: "",
  strengths: "",
  longTermGoals: "",
  whyThisProgram: "",
};

export default function SOPForm({
  initialData = null,
  onSave,
  multiStep = true,
}: Props) {
  const form = useForm<SOPValues>({
    resolver: zodResolver(sopSchema),
    defaultValues,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(0);
  const autoSaveTimer = useRef<number | null>(null);

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

  async function onSubmit(values: SOPValues) {
    setIsSaving(true);
    try {
      await onSave?.(values);
    } finally {
      setIsSaving(false);
    }
  }

  function nextStep() {
    setStep((current) => Math.min(3, current + 1));
  }

  function prevStep() {
    setStep((current) => Math.max(0, current - 1));
  }

  const preview = form.watch();
  const stepLabels = [
    "Program Details",
    "Background & Goals",
    "Strengths & Why This Program",
    "Preview",
  ];

  const stepContent = (
    <>
      {step === 0 && (
        <section className="space-y-4 rounded-3xl border border-slate-800 bg-slate-950/90 p-6">
          <h3 className="text-xl font-semibold text-white">
            Program & Personal Details
          </h3>
          <div className="space-y-4">
            <input
              {...form.register("applicantName")}
              placeholder="Your full name"
              className="w-full rounded-3xl bg-slate-900 px-4 py-3 text-white"
            />
            <input
              {...form.register("programName")}
              placeholder="Program name"
              className="w-full rounded-3xl bg-slate-900 px-4 py-3 text-white"
            />
            <input
              {...form.register("universityName")}
              placeholder="University name"
              className="w-full rounded-3xl bg-slate-900 px-4 py-3 text-white"
            />
          </div>
        </section>
      )}

      {step === 1 && (
        <section className="space-y-4 rounded-3xl border border-slate-800 bg-slate-950/90 p-6">
          <h3 className="text-xl font-semibold text-white">
            Background & Career Goals
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Current Academic/Professional Background
              </label>
              <textarea
                {...form.register("currentBackground")}
                rows={4}
                placeholder="Describe your educational background, relevant coursework, and professional experience..."
                className="w-full rounded-3xl bg-slate-900 px-4 py-3 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Motivation for Pursuing This Program
              </label>
              <textarea
                {...form.register("motivation")}
                rows={4}
                placeholder="Explain why you want to pursue this program and how it aligns with your career aspirations..."
                className="w-full rounded-3xl bg-slate-900 px-4 py-3 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Long-Term Career Goals
              </label>
              <textarea
                {...form.register("longTermGoals")}
                rows={4}
                placeholder="Describe your vision for your career and how this program will help you achieve it..."
                className="w-full rounded-3xl bg-slate-900 px-4 py-3 text-white"
              />
            </div>
          </div>
        </section>
      )}

      {step === 2 && (
        <section className="space-y-4 rounded-3xl border border-slate-800 bg-slate-950/90 p-6">
          <h3 className="text-xl font-semibold text-white">
            Strengths & Program Fit
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Your Key Strengths & Qualities
              </label>
              <textarea
                {...form.register("strengths")}
                rows={4}
                placeholder="Highlight your academic strengths, technical skills, leadership qualities, and unique characteristics..."
                className="w-full rounded-3xl bg-slate-900 px-4 py-3 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Why This Program & University?
              </label>
              <textarea
                {...form.register("whyThisProgram")}
                rows={4}
                placeholder="Explain what makes this specific program and university the right fit for you. Mention specific aspects, faculty, or resources..."
                className="w-full rounded-3xl bg-slate-900 px-4 py-3 text-white"
              />
            </div>
          </div>
        </section>
      )}

      {step === 3 && (
        <section className="space-y-4 rounded-3xl border border-slate-800 bg-slate-950/90 p-6">
          <h3 className="text-xl font-semibold text-white">Preview</h3>
          <div className="rounded-3xl bg-slate-900 p-6 text-slate-300 space-y-4 max-h-96 overflow-y-auto text-sm">
            <p>
              <strong>Applicant:</strong> {preview.applicantName}
            </p>
            <p>
              <strong>Program:</strong> {preview.programName} at{" "}
              {preview.universityName}
            </p>
            <p className="border-t border-slate-700 pt-4 whitespace-pre-wrap">
              <strong>Background:</strong> {preview.currentBackground}
            </p>
            <p className="whitespace-pre-wrap">
              <strong>Motivation:</strong> {preview.motivation}
            </p>
            <p className="whitespace-pre-wrap">
              <strong>Strengths:</strong> {preview.strengths}
            </p>
            <p className="whitespace-pre-wrap">
              <strong>Why This Program:</strong> {preview.whyThisProgram}
            </p>
          </div>
        </section>
      )}
    </>
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr,0.85fr]">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm text-slate-200">
            Document title
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
              <option value="academic">Academic</option>
              <option value="professional">Professional</option>
              <option value="concise">Concise</option>
            </select>
          </label>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-sky-400">
                Statement of Purpose
              </p>
              <h2 className="text-3xl font-semibold text-white">
                Tell Your Story
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
        {mounted && (
          <div className="rounded-3xl border border-slate-800 bg-slate-950/90 p-6 text-white">
            <h3 className="text-lg font-semibold">Quick Info</h3>
            <div className="mt-4 space-y-2 text-sm text-slate-300">
              <p>
                <strong>Name:</strong> {preview.applicantName || "Your Name"}
              </p>
              <p>
                <strong>Program:</strong>{" "}
                {preview.programName || "Program Name"}
              </p>
              <p>
                <strong>University:</strong>{" "}
                {preview.universityName || "University Name"}
              </p>
            </div>
          </div>
        )}
        {mounted && (
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 text-slate-300">
            <p className="text-sm">
              A compelling SOP should demonstrate your motivation, fit, and
              long-term vision.
            </p>
          </div>
        )}
      </aside>
    </div>
  );
}
