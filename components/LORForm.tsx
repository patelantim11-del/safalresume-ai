"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const lorSchema = z.object({
  title: z.string().min(3),
  template: z.enum(["formal", "professional", "academic"] as const),
  recommenderName: z.string().min(2),
  recommenderTitle: z.string().min(2),
  recommenderInstitution: z.string().min(2),
  relationship: z.string().min(10),
  recommendFor: z.string().min(2),
  strengths: z.string().min(30),
  examples: z.string().min(30),
  closing: z.string().min(20),
  date: z.string(),
});

type LORValues = z.infer<typeof lorSchema>;

type Props = {
  initialData?: Partial<LORValues> | null;
  onSave?: (values: LORValues) => Promise<{ id?: string } | void>;
  multiStep?: boolean;
};

const defaultValues: LORValues = {
  title: "Letter of Recommendation",
  template: "formal",
  recommenderName: "",
  recommenderTitle: "",
  recommenderInstitution: "",
  relationship: "",
  recommendFor: "",
  strengths: "",
  examples: "",
  closing: "",
  date: new Date().toISOString().split("T")[0],
};

export default function LORForm({
  initialData = null,
  onSave,
  multiStep = true,
}: Props) {
  const form = useForm<LORValues>({
    resolver: zodResolver(lorSchema),
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

  async function onSubmit(values: LORValues) {
    setIsSaving(true);
    try {
      await onSave?.(values);
    } finally {
      setIsSaving(false);
    }
  }

  function nextStep() {
    setStep((current) => Math.min(2, current + 1));
  }

  function prevStep() {
    setStep((current) => Math.max(0, current - 1));
  }

  const preview = form.watch();
  const stepLabels = ["Recommender Info", "Letter Content", "Preview"];

  const stepContent = (
    <>
      {step === 0 && (
        <section className="space-y-4 rounded-3xl border border-slate-800 bg-slate-950/90 p-6">
          <h3 className="text-xl font-semibold text-white">
            Recommender Information
          </h3>
          <div className="space-y-4">
            <input
              {...form.register("recommenderName")}
              placeholder="Your full name"
              className="w-full rounded-3xl bg-slate-900 px-4 py-3 text-white"
            />
            <input
              {...form.register("recommenderTitle")}
              placeholder="Your title/position"
              className="w-full rounded-3xl bg-slate-900 px-4 py-3 text-white"
            />
            <input
              {...form.register("recommenderInstitution")}
              placeholder="Your institution/organization"
              className="w-full rounded-3xl bg-slate-900 px-4 py-3 text-white"
            />
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Relationship with Candidate
              </label>
              <textarea
                {...form.register("relationship")}
                rows={3}
                placeholder="How do you know the candidate? (e.g., direct supervisor for 3 years)"
                className="w-full rounded-3xl bg-slate-900 px-4 py-3 text-white"
              />
            </div>
            <input
              {...form.register("recommendFor")}
              placeholder="What is the candidate applying for?"
              className="w-full rounded-3xl bg-slate-900 px-4 py-3 text-white"
            />
            <input
              {...form.register("date")}
              type="date"
              className="w-full rounded-3xl bg-slate-900 px-4 py-3 text-white"
            />
          </div>
        </section>
      )}

      {step === 1 && (
        <section className="space-y-4 rounded-3xl border border-slate-800 bg-slate-950/90 p-6">
          <h3 className="text-xl font-semibold text-white">Letter Content</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Candidate Strengths & Qualities
              </label>
              <textarea
                {...form.register("strengths")}
                rows={4}
                placeholder="Describe the candidate's key strengths, skills, and qualities..."
                className="w-full rounded-3xl bg-slate-900 px-4 py-3 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Specific Examples & Achievements
              </label>
              <textarea
                {...form.register("examples")}
                rows={4}
                placeholder="Provide specific examples of accomplishments or situations that demonstrate these strengths..."
                className="w-full rounded-3xl bg-slate-900 px-4 py-3 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Closing Remarks
              </label>
              <textarea
                {...form.register("closing")}
                rows={3}
                placeholder="Conclude with your recommendation and willingness to provide more information..."
                className="w-full rounded-3xl bg-slate-900 px-4 py-3 text-white"
              />
            </div>
          </div>
        </section>
      )}

      {step === 2 && (
        <section className="space-y-4 rounded-3xl border border-slate-800 bg-slate-950/90 p-6">
          <h3 className="text-xl font-semibold text-white">Preview</h3>
          <div className="rounded-3xl bg-slate-900 p-6 text-slate-300 space-y-4 max-h-96 overflow-y-auto text-sm">
            <p className="text-right">{preview.date}</p>
            <p>Dear Admissions Committee,</p>
            <p>
              I am writing to recommend{" "}
              {preview.recommendFor || "the candidate"} for{" "}
              {preview.recommendFor || "the opportunity"}.
            </p>
            <p className="whitespace-pre-wrap">{preview.relationship}</p>
            <p className="whitespace-pre-wrap">
              <strong>Strengths:</strong> {preview.strengths}
            </p>
            <p className="whitespace-pre-wrap">
              <strong>Examples:</strong> {preview.examples}
            </p>
            <p className="whitespace-pre-wrap">{preview.closing}</p>
            <div className="mt-6">
              <p>Sincerely,</p>
              <p className="mt-8 border-t border-slate-600 pt-4">
                {preview.recommenderName}
              </p>
              <p className="text-xs">{preview.recommenderTitle}</p>
              <p className="text-xs">{preview.recommenderInstitution}</p>
            </div>
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
              <option value="formal">Formal</option>
              <option value="professional">Professional</option>
              <option value="academic">Academic</option>
            </select>
          </label>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-sky-400">
                Letter of Recommendation
              </p>
              <h2 className="text-3xl font-semibold text-white">
                Write a Strong Recommendation
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
                {isSaving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      </form>

      <aside className="space-y-6">
        {mounted && (
          <div className="rounded-3xl border border-slate-800 bg-slate-950/90 p-6 text-white">
            <h3 className="text-lg font-semibold">Letter Details</h3>
            <div className="mt-4 space-y-2 text-sm text-slate-300">
              <p>
                <strong>From:</strong> {preview.recommenderName || "Name"}
              </p>
              <p>
                <strong>Title:</strong> {preview.recommenderTitle || "Title"}
              </p>
              <p>
                <strong>For:</strong>{" "}
                {preview.recommendFor || "Candidate Application"}
              </p>
            </div>
          </div>
        )}
        {mounted && (
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 text-slate-300">
            <p className="text-sm">
              A strong recommendation letter should highlight specific strengths
              with concrete examples.
            </p>
          </div>
        )}
      </aside>
    </div>
  );
}
