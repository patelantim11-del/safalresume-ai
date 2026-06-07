"use client";

import { exportPreviewPdf } from "@/lib/exportPdf";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

const biodataSchema = z.object({
  title: z.string().min(3),
  template: z.enum(["traditional", "modern", "elegant"] as const),
  fullName: z.string().min(2),
  gender: z.enum(["Male", "Female"] as const),
  age: z.number().min(18).max(100),
  height: z.string().min(2),
  complexion: z.string().optional(),
  religion: z.string().min(2),
  community: z.string().min(2),
  caste: z.string().optional(),
  education: z.string().min(2),
  occupation: z.string().min(2),
  income: z.string().optional(),
  familyDetails: z.string().min(10),
  address: z.string().min(5),
  hobbies: z
    .array(z.object({ id: z.string(), value: z.string().min(1) }))
    .default([]),
  phone: z.string().min(6),
  email: z.string().email(),
  photoUrl: z.string().optional(),
});

type BiodataValues = z.infer<typeof biodataSchema>;

type Props = {
  initialData?: Partial<BiodataValues> | null;
  onSave?: (values: BiodataValues) => Promise<{ id?: string } | void>;
  multiStep?: boolean;
};

const defaultValues: BiodataValues = {
  title: "Marriage Biodata",
  template: "modern",
  fullName: "",
  gender: "Male",
  age: 25,
  height: "",
  complexion: "",
  religion: "",
  community: "",
  caste: "",
  education: "",
  occupation: "",
  income: "",
  familyDetails: "",
  address: "",
  hobbies: [{ id: "hobby-0", value: "" }],
  phone: "",
  email: "",
  photoUrl: "",
};

export default function MarriageBiodataForm({
  initialData = null,
  onSave,
  multiStep = true,
}: Props) {
  const form = useForm<BiodataValues>({
    resolver: zodResolver(biodataSchema),
    defaultValues,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(0);
  const autoSaveTimer = useRef<number | null>(null);
  const hobbiesFields = useFieldArray({
    name: "hobbies",
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

  async function onSubmit(values: BiodataValues) {
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
  const stepLabels = [
    "Personal Details",
    "Family & Education",
    "Contact & Interests",
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
              {...form.register("fullName")}
              placeholder="Full name"
              className="rounded-3xl bg-slate-900 px-4 py-3 text-white"
            />
            <select
              {...form.register("gender")}
              className="rounded-3xl bg-slate-900 px-4 py-3 text-white"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
            <input
              type="number"
              {...form.register("age", { valueAsNumber: true })}
              placeholder="Age"
              className="rounded-3xl bg-slate-900 px-4 py-3 text-white"
            />
            <input
              {...form.register("height")}
              placeholder="Height"
              className="rounded-3xl bg-slate-900 px-4 py-3 text-white"
            />
            <input
              {...form.register("complexion")}
              placeholder="Complexion"
              className="rounded-3xl bg-slate-900 px-4 py-3 text-white"
            />
            <input
              {...form.register("photoUrl")}
              placeholder="Photo URL"
              className="rounded-3xl bg-slate-900 px-4 py-3 text-white"
            />
          </div>
        </section>
      )}

      {step === 1 && (
        <section className="space-y-4 rounded-3xl border border-slate-800 bg-slate-950/90 p-6">
          <h3 className="text-xl font-semibold text-white">
            Religious & Family Details
          </h3>
          <div className="space-y-4">
            <input
              {...form.register("religion")}
              placeholder="Religion"
              className="w-full rounded-3xl bg-slate-900 px-4 py-3 text-white"
            />
            <input
              {...form.register("community")}
              placeholder="Community"
              className="w-full rounded-3xl bg-slate-900 px-4 py-3 text-white"
            />
            <input
              {...form.register("caste")}
              placeholder="Caste"
              className="w-full rounded-3xl bg-slate-900 px-4 py-3 text-white"
            />
            <input
              {...form.register("education")}
              placeholder="Education"
              className="w-full rounded-3xl bg-slate-900 px-4 py-3 text-white"
            />
            <input
              {...form.register("occupation")}
              placeholder="Occupation"
              className="w-full rounded-3xl bg-slate-900 px-4 py-3 text-white"
            />
            <input
              {...form.register("income")}
              placeholder="Annual Income"
              className="w-full rounded-3xl bg-slate-900 px-4 py-3 text-white"
            />
            <textarea
              {...form.register("familyDetails")}
              placeholder="Family details..."
              rows={4}
              className="w-full rounded-3xl bg-slate-900 px-4 py-3 text-white"
            />
          </div>
        </section>
      )}

      {step === 2 && (
        <section className="space-y-4 rounded-3xl border border-slate-800 bg-slate-950/90 p-6">
          <h3 className="text-xl font-semibold text-white">
            Contact & Interests
          </h3>
          <div className="space-y-4">
            <input
              {...form.register("address")}
              placeholder="Address"
              className="w-full rounded-3xl bg-slate-900 px-4 py-3 text-white"
            />
            <input
              {...form.register("phone")}
              placeholder="Phone number"
              className="w-full rounded-3xl bg-slate-900 px-4 py-3 text-white"
            />
            <input
              {...form.register("email")}
              placeholder="Email"
              className="w-full rounded-3xl bg-slate-900 px-4 py-3 text-white"
            />
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Hobbies & Interests
              </label>
              <div className="space-y-2">
                {hobbiesFields.fields.map((field, index) => (
                  <div key={field.id} className="flex gap-2">
                    <input
                      {...form.register(`hobbies.${index}.value`)}
                      placeholder="Hobby"
                      className="flex-1 rounded-3xl bg-slate-900 px-4 py-3 text-white"
                    />
                    <button
                      type="button"
                      onClick={() => hobbiesFields.remove(index)}
                      className="rounded-3xl bg-slate-800 px-4 py-3 text-white"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() =>
                  hobbiesFields.append({
                    id: `hobby-${crypto.randomUUID()}`,
                    value: "",
                  })
                }
                className="mt-2 rounded-3xl bg-slate-800 px-4 py-3 text-white"
              >
                Add hobby
              </button>
            </div>
          </div>
        </section>
      )}
    </>
  );

  const previewPane = (
    <div className="rounded-3xl border border-slate-800 bg-slate-950/90 p-6 text-white">
      <h3 className="text-xl font-semibold">Preview</h3>
      <div className="mt-4 space-y-3 text-sm text-slate-300">
        <p className="text-lg font-semibold text-white">
          {preview.fullName || "Name"}
        </p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <p>
            <strong>Gender:</strong> {preview.gender}
          </p>
          <p>
            <strong>Age:</strong> {preview.age}
          </p>
          <p>
            <strong>Height:</strong> {preview.height}
          </p>
          <p>
            <strong>Religion:</strong> {preview.religion}
          </p>
        </div>
        <div className="border-t border-slate-700 pt-2">
          <p className="text-xs">
            <strong>Education:</strong> {preview.education}
          </p>
          <p className="text-xs">
            <strong>Occupation:</strong> {preview.occupation}
          </p>
        </div>
      </div>
    </div>
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
              <option value="traditional">Traditional</option>
              <option value="modern">Modern</option>
              <option value="elegant">Elegant</option>
            </select>
          </label>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-sky-400">
                Marriage Biodata
              </p>
              <h2 className="text-3xl font-semibold text-white">
                Create Your Profile
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
              Your biodata will help potential families learn more about you.
            </p>
          </div>
        )}
      </aside>
    </div>
  );
}
