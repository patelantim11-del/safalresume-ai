"use client";

import { exportPreviewPdf } from "@/lib/exportPdf";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const coverLetterSchema = z.object({
  title: z.string().min(3),
  template: z.enum(["classic", "modern", "formal"] as const),
  recipientName: z.string().min(2),
  companyName: z.string().min(2),
  position: z.string().min(2),
  senderName: z.string().min(2),
  senderTitle: z.string().optional(),
  senderEmail: z.string().email(),
  senderPhone: z.string().min(6),
  introduction: z.string().min(10),
  body: z.string().min(20),
  closing: z.string().min(10),
  date: z.string(),
});

type CoverLetterValues = z.infer<typeof coverLetterSchema>;

type Props = {
  initialData?: Partial<CoverLetterValues> | null;
  onSave?: (values: CoverLetterValues) => Promise<{ id?: string } | void>;
  multiStep?: boolean;
};

const defaultValues: CoverLetterValues = {
  title: "Cover Letter",
  template: "classic",
  recipientName: "",
  companyName: "",
  position: "",
  senderName: "",
  senderTitle: "",
  senderEmail: "",
  senderPhone: "",
  introduction: "",
  body: "",
  closing: "",
  date: new Date().toISOString().split("T")[0],
};

export default function CoverLetterForm({
  initialData = null,
  onSave,
  multiStep = true,
}: Props) {
  const form = useForm<CoverLetterValues>({
    resolver: zodResolver(coverLetterSchema),
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

  async function onSubmit(values: CoverLetterValues) {
    setIsSaving(true);
    try {
      await onSave?.(values);
    } finally {
      setIsSaving(false);
    }
  }

  // (nextStep removed — navigation handled via controls in the UI)

  function prevStep() {
    setStep((current) => Math.max(0, current - 1));
  }

  const preview = form.watch();
  const stepLabels = ["Recipient & Sender", "Content", "Preview"];

  const stepContent = (
    <>
      {step === 0 && (
        <section className="space-y-4 rounded-3xl border border-slate-800 bg-slate-950/90 p-6">
          <h3 className="text-xl font-semibold text-white">
            Recipient & Sender Information
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <input
              {...form.register("recipientName")}
              placeholder="Recipient name"
              className="rounded-3xl bg-slate-900 px-4 py-3 text-white"
            />
            <input
              {...form.register("companyName")}
              placeholder="Company name"
              className="rounded-3xl bg-slate-900 px-4 py-3 text-white"
            />
            <input
              {...form.register("position")}
              placeholder="Position applied for"
              className="rounded-3xl bg-slate-900 px-4 py-3 text-white sm:col-span-2"
            />
            <input
              {...form.register("date")}
              type="date"
              className="rounded-3xl bg-slate-900 px-4 py-3 text-white"
            />
          </div>
          <div className="border-t border-slate-700 pt-4">
            <h4 className="text-sm font-semibold text-white mb-4">
              Your Information
            </h4>
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                {...form.register("senderName")}
                placeholder="Your name"
                className="rounded-3xl bg-slate-900 px-4 py-3 text-white"
              />
              <input
                {...form.register("senderTitle")}
                placeholder="Your title"
                className="rounded-3xl bg-slate-900 px-4 py-3 text-white"
              />
              <input
                {...form.register("senderEmail")}
                placeholder="Your email"
                className="rounded-3xl bg-slate-900 px-4 py-3 text-white"
              />
              <input
                {...form.register("senderPhone")}
                placeholder="Your phone"
                className="rounded-3xl bg-slate-900 px-4 py-3 text-white"
              />
            </div>
          </div>
        </section>
      )}

      {step === 1 && (
        <section className="space-y-4 rounded-3xl border border-slate-800 bg-slate-950/90 p-6">
          <h3 className="text-xl font-semibold text-white">
            Cover Letter Content
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Introduction
              </label>
              <textarea
                {...form.register("introduction")}
                rows={4}
                placeholder="Start with an engaging opening..."
                className="w-full rounded-3xl bg-slate-900 px-4 py-3 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Body
              </label>
              <textarea
                {...form.register("body")}
                rows={6}
                placeholder="Highlight your skills and experience..."
                className="w-full rounded-3xl bg-slate-900 px-4 py-3 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Closing
              </label>
              <textarea
                {...form.register("closing")}
                rows={3}
                placeholder="End with a professional closing..."
                className="w-full rounded-3xl bg-slate-900 px-4 py-3 text-white"
              />
            </div>
          </div>
        </section>
      )}

      {step === 2 && (
        <section className="space-y-4 rounded-3xl border border-slate-800 bg-slate-950/90 p-6">
          <h3 className="text-xl font-semibold text-white">Preview</h3>
          <div className="rounded-3xl bg-slate-900 p-6 text-slate-300 space-y-4 max-h-96 overflow-y-auto">
            <p className="text-right text-sm">{preview.date}</p>
            <div>
              <p>{preview.recipientName}</p>
              <p>{preview.companyName}</p>
            </div>
            <p>Dear {preview.recipientName},</p>
            <p className="whitespace-pre-wrap">{preview.introduction}</p>
            <p className="whitespace-pre-wrap">{preview.body}</p>
            <p className="whitespace-pre-wrap">{preview.closing}</p>
            <div className="mt-6">
              <p>Sincerely,</p>
              <p className="mt-8 border-t border-slate-600 pt-4">
                {preview.senderName}
              </p>
              <p className="text-sm">{preview.senderTitle}</p>
              <p className="text-sm">{preview.senderEmail}</p>
              <p className="text-sm">{preview.senderPhone}</p>
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
              <option value="classic">Classic</option>
              <option value="modern">Modern</option>
              <option value="formal">Formal</option>
            </select>
          </label>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-sky-400">
                Cover Letter
              </p>
              <h2 className="text-3xl font-semibold text-white">
                Craft Your Letter
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
                onClick={() => exportPreviewPdf()}
                className="rounded-3xl bg-sky-500 px-4 py-3 text-white"
              >
                Export PDF
              </button>
            </div>
            <div className="flex gap-3">
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
            <h3 className="text-xl font-semibold">Live Preview</h3>
            <div className="mt-4 space-y-2 text-sm text-slate-300">
              <p>
                <strong>To:</strong> {preview.recipientName || "Recipient Name"}{" "}
                at {preview.companyName || "Company"}
              </p>
              <p>
                <strong>Position:</strong>{" "}
                {preview.position || "Position Title"}
              </p>
              <p>
                <strong>From:</strong> {preview.senderName || "Your Name"}
              </p>
            </div>
          </div>
        )}
        {mounted && (
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 text-slate-300">
            <p className="text-sm">
              Your cover letter will be formatted as a professional business
              letter when exported.
            </p>
          </div>
        )}
      </aside>
    </div>
  );
}
