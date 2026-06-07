"use client";

import CareerAssistant from "@/components/CareerAssistant";
import Link from "next/link";
import { useState } from "react";

export default function ToolkitPage() {
  const [resume] = useState(() => ({
    personalInfo: {
      fullName: "",
      jobTitle: "",
      email: "",
      phone: "",
      location: "",
      summary: "",
    },
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
    achievements: [],
    languages: [],
  }));

  function handleApplySummary(summary: string) {
    // This page cannot directly modify the resume editor in another route.
    // For now, copy to clipboard and inform user to paste into their resume.
    try {
      navigator.clipboard.writeText(summary);
      alert("Summary copied to clipboard. Paste it into your resume.");
    } catch {
      console.log("Summary:", summary);
      alert("Summary generated. Check console for output.");
    }
  }

  function handleAddAchievement(achievement: string) {
    try {
      navigator.clipboard.writeText(achievement);
      alert(
        "Transformed achievement copied to clipboard. Paste into your resume.",
      );
    } catch {
      console.log("Achievement:", achievement);
      alert("Achievement generated. Check console for output.");
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 px-6 py-12">
      <div className="max-w-4xl mx-auto rounded-2xl border bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
              Career Toolkit
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              AI-powered resume analysis and career tools.
            </p>
          </div>
          <div>
            <Link
              href="/dashboard"
              className="rounded-2xl bg-slate-900 px-4 py-2 text-white"
            >
              Back
            </Link>
          </div>
        </div>

        <CareerAssistant
          resume={resume}
          onApplySummary={handleApplySummary}
          onAddAchievement={handleAddAchievement}
        />
      </div>
    </main>
  );
}
