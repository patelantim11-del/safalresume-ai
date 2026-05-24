"use client";

import { DashboardStats } from "@/components/DashboardStats";
import { Card } from "@/components/ui/Card";
import { DocumentType, User } from "@/types";
import { BarChart3, FileText, LogOut, Plus, Settings, Zap } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const DOCUMENT_TYPES: Array<{
  type: DocumentType;
  label: string;
  description: string;
  icon: string;
}> = [
  {
    type: "job_resume",
    label: "Job Resume",
    description: "Professional resume for job applications",
    icon: "📄",
  },
  {
    type: "marriage_biodata",
    label: "Biodata",
    description: "Marriage biodata profile",
    icon: "💍",
  },
  {
    type: "student_cv",
    label: "Student CV",
    description: "CV for students and fresh graduates",
    icon: "🎓",
  },
  {
    type: "internship_resume",
    label: "Internship Resume",
    description: "Resume for internship applications",
    icon: "📋",
  },
  {
    type: "freelancer_profile",
    label: "Freelancer Profile",
    description: "Profile for freelance platforms",
    icon: "💼",
  },
  {
    type: "business_profile",
    label: "Business Profile",
    description: "Professional business profile",
    icon: "🏢",
  },
  {
    type: "academic_cv",
    label: "Academic CV",
    description: "CV for academic positions",
    icon: "🎓",
  },
  {
    type: "government_resume",
    label: "Government Resume",
    description: "Resume for government jobs",
    icon: "🏛️",
  },
  {
    type: "portfolio",
    label: "Portfolio",
    description: "Professional portfolio website",
    icon: "🎨",
  },
  {
    type: "personal_profile",
    label: "Personal Profile",
    description: "Personal branding profile",
    icon: "👤",
  },
  {
    type: "teacher_profile",
    label: "Teacher Profile",
    description: "Educational background profile",
    icon: "👨‍🏫",
  },
  {
    type: "doctor_profile",
    label: "Doctor Profile",
    description: "Medical professional profile",
    icon: "⚕️",
  },
  {
    type: "lawyer_profile",
    label: "Lawyer Profile",
    description: "Legal professional profile",
    icon: "⚖️",
  },
  {
    type: "artist_profile",
    label: "Artist Profile",
    description: "Creative professional portfolio",
    icon: "🎭",
  },
  {
    type: "custom_profile",
    label: "Custom Profile",
    description: "Create custom profile",
    icon: "✨",
  },
];

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [documents, setDocuments] = useState([]);
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

  function handleCreateDocument(type: DocumentType) {
    router.push(`/dashboard/documents/new?type=${type}`);
  }

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

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

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-gray-800 to-black">
      {/* Header */}
      <div className="border-b border-white/10 bg-white/5 backdrop-blur-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">
                Welcome, {user.fullName}!
              </h1>
              <p className="text-gray-400 mt-1">
                {user.subscription === "free" && "You're on the Free plan"}
                {user.subscription === "pro" && "You're on the Pro plan"}
                {user.subscription === "premium" &&
                  "You're on the Premium plan"}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/dashboard/upgrade")}
                className="px-6 py-2 bg-linear-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all"
              >
                {user.subscription === "free"
                  ? "Upgrade Plan"
                  : "Manage Subscription"}
              </button>
              <Link
                href="/dashboard/profile"
                className="p-2 hover:bg-white/10 rounded-lg transition-all"
              >
                <Settings className="w-5 h-5 text-gray-400" />
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-white/10 rounded-lg transition-all"
              >
                <LogOut className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Stats */}
        <DashboardStats user={user} />

        {/* Quick Actions */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/dashboard/documents/new">
              <Card className="glassmorphism hover:border-white/20 cursor-pointer transition-all p-6 h-full">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <Plus className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">New Document</p>
                    <p className="text-sm text-gray-400">
                      Create your next profile
                    </p>
                  </div>
                </div>
              </Card>
            </Link>

            <Link href="/dashboard/documents">
              <Card className="glassmorphism hover:border-white/20 cursor-pointer transition-all p-6 h-full">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">My Documents</p>
                    <p className="text-sm text-gray-400">
                      {documents.length} documents
                    </p>
                  </div>
                </div>
              </Card>
            </Link>

            <Link href="/dashboard/ats-analyzer">
              <Card className="glassmorphism hover:border-white/20 cursor-pointer transition-all p-6 h-full">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">ATS Analyzer</p>
                    <p className="text-sm text-gray-400">
                      Optimize your resume
                    </p>
                  </div>
                </div>
              </Card>
            </Link>

            <Link href="/dashboard/career-tools">
              <Card className="glassmorphism hover:border-white/20 cursor-pointer transition-all p-6 h-full">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-pink-500/20 flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-pink-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Career Tools</p>
                    <p className="text-sm text-gray-400">
                      AI-powered career growth
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
          </div>
        </div>

        {/* Document Type Selector */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">
            Create New Profile
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {DOCUMENT_TYPES.map((doc) => (
              <Card
                key={doc.type}
                className="glassmorphism hover:border-blue-400/50 cursor-pointer transition-all hover:shadow-lg hover:shadow-blue-500/20 p-6"
                onClick={() => handleCreateDocument(doc.type)}
              >
                <div className="flex items-start gap-4">
                  <div className="text-2xl">{doc.icon}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">{doc.label}</h3>
                    <p className="text-sm text-gray-400 mt-1">
                      {doc.description}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Documents */}
        {documents.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                Recent Documents
              </h2>
              <Link
                href="/dashboard/documents"
                className="text-blue-400 hover:text-blue-300"
              >
                View All
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {documents.slice(0, 4).map((doc: any) => (
                <Card key={doc._id} className="glassmorphism p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">{doc.title}</h3>
                      <p className="text-sm text-gray-400 mt-1 capitalize">
                        {doc.type.replace(/_/g, " ")}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(doc.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Link
                      href={`/dashboard/documents/${doc._id}`}
                      className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-all text-sm"
                    >
                      Edit
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
