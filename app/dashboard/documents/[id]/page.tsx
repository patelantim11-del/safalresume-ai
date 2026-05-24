"use client";

import { Card } from "@/components/ui/Card";
import { Document, documentStatuses } from "@/types";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DocumentEditorPage() {
  const router = useRouter();
  const params = useParams();
  const documentId = params?.id as string | undefined;

  const [document, setDocument] = useState<Document | null>(null);
  const [contentJson, setContentJson] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadDocument() {
      if (!documentId) return;

      setLoading(true);
      try {
        const response = await fetch(`/api/documents/${documentId}`);
        if (!response.ok) {
          router.push("/dashboard/documents");
          return;
        }

        const data = await response.json();
        setDocument(data);
        setContentJson(JSON.stringify(data.content || {}, null, 2));
      } catch (err) {
        console.error("Failed to load document:", err);
        router.push("/dashboard/documents");
      } finally {
        setLoading(false);
      }
    }

    loadDocument();
  }, [documentId, router]);

  async function handleSave() {
    if (!documentId || !document) return;

    setError("");
    setMessage("");
    setSaving(true);

    try {
      const parsedContent = JSON.parse(contentJson);
      const payload = {
        title: document.title,
        template: document.template,
        status: document.status,
        content: parsedContent,
      };

      const response = await fetch(`/api/documents/${documentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Unable to save document");
        return;
      }

      setMessage("Document saved successfully.");
      setDocument({ ...document, content: parsedContent });
    } catch (err) {
      console.error(err);
      setError("Invalid JSON content. Please correct the document data.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading document...</p>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <Card className="glassmorphism p-8 max-w-lg text-center">
          <h2 className="text-2xl font-semibold text-white mb-4">
            Document not found
          </h2>
          <Link
            href="/dashboard/documents"
            className="inline-flex px-5 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
          >
            Back to Documents
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-gray-800 to-black">
      <div className="border-b border-white/10 bg-white/5 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white">Edit Document</h1>
              <p className="text-gray-400 mt-1">
                Update your profile content and save changes.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/dashboard/documents"
                className="px-5 py-3 bg-gray-900/60 text-gray-200 rounded-lg border border-white/10 hover:bg-gray-900 transition-all"
              >
                ← Back to Documents
              </Link>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-3 bg-linear-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg hover:shadow-blue-500/40 transition-all disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <Card className="glassmorphism p-8">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Document Title
                </label>
                <input
                  type="text"
                  value={document.title}
                  onChange={(e) =>
                    setDocument({ ...document, title: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-gray-900/50 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Template
                </label>
                <input
                  type="text"
                  value={document.template}
                  onChange={(e) =>
                    setDocument({ ...document, template: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-gray-900/50 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={document.status}
                  onChange={(e) =>
                    setDocument({
                      ...document,
                      status: e.target
                        .value as (typeof documentStatuses)[number],
                    })
                  }
                  className="w-full px-4 py-3 bg-gray-900/50 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500/50"
                >
                  {documentStatuses.map((status) => (
                    <option
                      key={status}
                      value={status}
                      className="bg-slate-900"
                    >
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-4 rounded-2xl border border-white/10 bg-slate-950/70 p-6">
              <div>
                <p className="text-sm text-gray-400">Document ID</p>
                <p className="mt-1 text-sm text-white break-all">
                  {documentId}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Type</p>
                <p className="mt-1 text-sm text-white capitalize">
                  {document.type.replace(/_/g, " ")}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Updated</p>
                <p className="mt-1 text-sm text-white">
                  {new Date(document.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="glassmorphism p-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Content JSON
                </h2>
                <p className="text-gray-400 text-sm">
                  Edit the document payload directly for advanced content
                  updates.
                </p>
              </div>
            </div>

            <textarea
              value={contentJson}
              onChange={(e) => setContentJson(e.target.value)}
              className="w-full min-h-[380px] resize-none rounded-2xl border border-white/10 bg-gray-950/80 p-4 font-mono text-sm text-white outline-none focus:border-blue-500/50"
            />

            {error && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4">
                <p className="text-sm text-red-200">{error}</p>
              </div>
            )}
            {message && (
              <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4">
                <p className="text-sm text-emerald-200">{message}</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
