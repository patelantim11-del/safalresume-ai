"use client";

import DocumentBuilder from "@/components/DocumentBuilder";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Document } from "@/types";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DocumentEditorPage() {
  const router = useRouter();
  const params = useParams();
  const documentId = params?.id as string | undefined;

  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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

    setSaving(true);
    setSaving(true);

    try {
      const payload = {
        title: document.title,
        template: document.template,
        status: document.status,
        content: document.content,
      };

      const response = await fetch(`/api/documents/${documentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        console.error(data);
        return;
      }

      const resp = await response.json();
      setDocument(resp.document || { ...document, ...payload });
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-6xl space-y-6">
          <Skeleton className="h-24 w-full" />
          <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
            <Skeleton className="h-96 w-full" />
            <div className="space-y-6">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center px-4 py-10">
        <Card className="p-10 max-w-2xl text-center">
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.28em] text-cyan-300/80">
              Document unavailable
            </p>
            <h2 className="text-3xl font-semibold text-white">
              We couldn’t find that document
            </h2>
            <p className="text-slate-400">
              The document may have been deleted or you may not have access.
              Return to the documents hub to continue.
            </p>
            <Link
              href="/dashboard/documents"
              className="inline-flex rounded-2xl bg-blue-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-400"
            >
              Back to Documents
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-black text-white">
      <div className="border-b border-white/10 bg-slate-950/95 backdrop-blur-3xl">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/70">
                Document studio
              </p>
              <h1 className="text-3xl font-semibold text-white">
                Edit document
              </h1>
              <p className="text-sm text-slate-400">
                Update your profile, manage versions, and preview changes in
                real time.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/dashboard/documents"
                className="rounded-2xl border border-white/10 bg-slate-900/80 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-900"
              >
                ← Back to Documents
              </Link>
              <Button
                onClick={handleSave}
                disabled={saving}
                variant="primary"
                size="sm"
              >
                {saving ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
        <DocumentBuilder
          document={document as Document}
          documentId={documentId as string}
          onUpdated={(doc) => setDocument(doc)}
        />
      </div>
    </div>
  );
}
