"use client";

import { Card } from "@/components/ui/Card";
import { Copy, Edit, FileText, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Document {
  _id: string;
  title: string;
  type: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  atsScore?: number;
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadDocuments() {
      try {
        const response = await fetch("/api/documents");
        if (!response.ok) {
          router.push("/auth/login");
          return;
        }
        const data = await response.json();
        setDocuments(data.documents);
      } catch (error) {
        console.error("Failed to fetch documents:", error);
      } finally {
        setLoading(false);
      }
    }

    loadDocuments();
  }, [router]);

  async function fetchDocuments() {
    try {
      const response = await fetch("/api/documents");
      if (!response.ok) {
        router.push("/auth/login");
        return;
      }

      const data = await response.json();
      setDocuments(data.documents);
    } catch (error) {
      console.error("Failed to fetch documents:", error);
    }
  }

  async function deleteDocument(id: string) {
    if (!confirm("Are you sure you want to delete this document?")) return;

    try {
      const response = await fetch(`/api/documents/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setDocuments(documents.filter((doc) => doc._id !== id));
      } else {
        alert("Failed to delete document");
      }
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete document");
    }
  }

  async function duplicateDocument(id: string, title: string) {
    try {
      const doc = documents.find((d) => d._id === id);
      if (!doc) return;

      const response = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: doc.type,
          title: `${title} (Copy)`,
          template: "default",
          content: doc,
        }),
      });

      if (response.ok) {
        fetchDocuments();
      } else {
        alert("Failed to duplicate document");
      }
    } catch (error) {
      console.error("Duplicate failed:", error);
      alert("Failed to duplicate document");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading documents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Header */}
      <div className="border-b border-white/10 bg-white/5 backdrop-blur-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">My Documents</h1>
              <p className="text-gray-400 mt-1">
                {documents.length} documents created
              </p>
            </div>
            <Link
              href="/dashboard"
              className="px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-all"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {documents.length === 0 ? (
          <Card className="glassmorphism p-12 text-center">
            <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">
              No documents yet
            </h2>
            <p className="text-gray-400 mb-6">
              Create your first profile to get started
            </p>
            <Link
              href="/dashboard"
              className="inline-block px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-all"
            >
              Create New Document
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map((doc) => (
              <Card
                key={doc._id}
                className="glassmorphism p-6 hover:border-blue-400/50 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-white text-lg">
                      {doc.title}
                    </h3>
                    <p className="text-sm text-gray-400 mt-1 capitalize">
                      {doc.type.replace(/_/g, " ")}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${doc.status === "completed" ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}`}
                  >
                    {doc.status}
                  </span>
                </div>

                {doc.atsScore && (
                  <div className="mb-4 p-3 bg-blue-500/10 rounded-lg">
                    <p className="text-xs text-gray-400">ATS Score</p>
                    <p className="text-lg font-bold text-blue-400">
                      {doc.atsScore}%
                    </p>
                  </div>
                )}

                <p className="text-xs text-gray-500 mb-4">
                  Updated {new Date(doc.updatedAt).toLocaleDateString()}
                </p>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/dashboard/documents/${doc._id}`}
                    className="flex-1 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-all text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </Link>
                  <button
                    onClick={() => duplicateDocument(doc._id, doc.title)}
                    className="px-3 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg transition-all"
                    title="Duplicate"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteDocument(doc._id)}
                    className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
