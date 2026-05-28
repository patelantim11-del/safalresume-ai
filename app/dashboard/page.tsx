"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Document, User } from "@/types";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const userResponse = await fetch("/api/auth/me");
        if (!userResponse.ok) {
          router.push("/auth/login");
          return;
        }

        const userData = await userResponse.json();
        setUser(userData);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        router.push("/auth/login");
        return;
      }

      try {
        const docsResponse = await fetch("/api/documents");
        if (docsResponse.ok) {
          const data = await docsResponse.json();
          setDocuments(data.documents);
        }
      } catch (error) {
        console.error("Failed to fetch documents:", error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const completedDocuments = documents.filter(
    (doc) => doc.status === "completed",
  ).length;
  const progressValue = documents.length
    ? Math.round((completedDocuments / documents.length) * 100)
    : 24;

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <Card className="glassmorphism overflow-hidden p-8">
            <div className="grid gap-8 xl:grid-cols-[1.3fr_0.7fr]">
              <div className="space-y-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div className="space-y-2">
                    <p className="text-sm uppercase tracking-[0.32em] text-cyan-300/70">
                      AI command center
                    </p>
                    <h1 className="text-4xl font-semibold text-white">
                      Build smarter resumes, faster.
                    </h1>
                    <p className="max-w-2xl text-slate-400 text-base leading-7">
                      Create premium resumes, optimize for ATS, and manage every
                      document in one elegant workspace.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge variant="success">
                      {user.subscription || "Free"} plan
                    </Badge>
                    <Button
                      onClick={() => router.push("/dashboard/documents/new")}
                      variant="primary"
                      size="sm"
                    >
                      New document
                    </Button>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <Card className="glassmorphism p-5 border border-white/10">
                    <p className="text-sm text-slate-400">Documents</p>
                    <p className="mt-3 text-3xl font-semibold text-white">
                      {documents.length}
                    </p>
                  </Card>
                  <Card className="glassmorphism p-5 border border-white/10">
                    <p className="text-sm text-slate-400">Completed</p>
                    <p className="mt-3 text-3xl font-semibold text-cyan-300">
                      {completedDocuments}
                    </p>
                  </Card>
                  <Card className="glassmorphism p-5 border border-white/10">
                    <p className="text-sm text-slate-400">Next step</p>
                    <p className="mt-3 text-3xl font-semibold text-white">
                      ATS Review
                    </p>
                  </Card>
                  <Card className="glassmorphism p-5 border border-white/10">
                    <p className="text-sm text-slate-400">AI tips</p>
                    <p className="mt-3 text-3xl font-semibold text-cyan-300">
                      Instant
                    </p>
                  </Card>
                </div>
              </div>

              <div className="rounded-4xl border border-white/10 bg-slate-950/80 p-6 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.8)]">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
                      Resume completion
                    </p>
                    <h2 className="mt-3 text-2xl font-semibold text-white">
                      {progressValue}% ready
                    </h2>
                  </div>
                  <div className="rounded-full bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-300">
                    Fast progress
                  </div>
                </div>
                <div className="mt-6 rounded-full bg-white/5 p-1">
                  <div
                    className="h-3 rounded-full bg-cyan-400 transition-all duration-500"
                    style={{ width: `${progressValue}%` }}
                  />
                </div>
                <div className="mt-6 space-y-4 text-sm text-slate-300">
                  <div className="rounded-3xl bg-slate-900/80 p-4">
                    <p className="font-semibold text-white">Next milestone</p>
                    <p className="mt-2 text-slate-400">
                      Complete ATS optimization for your top resume.
                    </p>
                  </div>
                  <div className="rounded-3xl bg-slate-900/80 p-4">
                    <p className="font-semibold text-white">
                      AI recommendation
                    </p>
                    <p className="mt-2 text-slate-400">
                      Focus on achievements and metrics for your latest role.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <div className="space-y-6">
            <Card className="glassmorphism p-6 border border-white/10">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/70">
                    AI toolkit
                  </p>
                  <h2 className="text-xl font-semibold text-white">
                    Accelerate your workflow
                  </h2>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => router.push("/dashboard/ats-analyzer")}
                >
                  Run analysis
                </Button>
              </div>
              <div className="mt-6 grid gap-3">
                {[
                  {
                    label: "ATS Analyzer",
                    description: "Optimize your resume for hiring systems.",
                  },
                  {
                    label: "Cover Letter AI",
                    description: "Generate tailored cover letters instantly.",
                  },
                  {
                    label: "Job Match",
                    description: "Align your skills to relevant roles.",
                  },
                ].map((tool) => (
                  <div
                    key={tool.label}
                    className="rounded-3xl border border-white/10 bg-slate-900/80 p-4"
                  >
                    <p className="font-semibold text-white">{tool.label}</p>
                    <p className="mt-2 text-sm text-slate-400">
                      {tool.description}
                    </p>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="glassmorphism p-6 border border-white/10">
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/70">
                      Premium plan
                    </p>
                    <h2 className="text-xl font-semibold text-white">
                      Unlock more value
                    </h2>
                  </div>
                  <Badge variant="warning">Popular</Badge>
                </div>
                <ul className="space-y-3 text-sm text-slate-400">
                  <li>• Unlimited AI keywords and cover letter generation</li>
                  <li>• Priority resume processing and export</li>
                  <li>• Access to premium resume templates</li>
                </ul>
                <Button
                  onClick={() => router.push("/dashboard/upgrade")}
                  variant="primary"
                  size="sm"
                  className="w-full"
                >
                  Upgrade to premium
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
