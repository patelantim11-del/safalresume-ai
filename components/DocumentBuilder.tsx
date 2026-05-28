"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Document } from "@/types";
import { AnimatePresence, motion } from "framer-motion";
import { Clock3, History, RefreshCw, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import ATSResumeForm from "./ATSResumeForm";
import CoverLetterForm from "./CoverLetterForm";
import FresherResumeForm from "./FresherResumeForm";
import InternshipForm from "./InternshipForm";
import LORForm from "./LORForm";
import MarriageBiodataForm from "./MarriageBiodataForm";
import PortfolioForm from "./PortfolioForm";
import ProfessionalResumeForm from "./ProfessionalResumeForm";
import ResumeForm from "./ResumeForm";
import SOPForm from "./SOPForm";

type Props = {
  document: Document;
  documentId: string;
  onUpdated?: (doc: Document) => void;
};

function isResumeType(type: string) {
  return [
    "job_resume",
    "fresher_resume",
    "professional_resume",
    "ats_resume",
    "internship_resume",
    "student_cv",
    "academic_cv",
    "freelancer_profile",
    "portfolio",
    "cover_letter",
    "statement_of_purpose",
    "letter_of_recommendation",
    "marriage_biodata",
  ].includes(type);
}

function deepClone<T>(v: T) {
  return JSON.parse(JSON.stringify(v)) as T;
}

export default function DocumentBuilder({
  document,
  documentId,
  onUpdated,
}: Props) {
  const [content, setContent] = useState<any>(() =>
    deepClone(document.content || {}),
  );
  const [title, setTitle] = useState(document.title || "");
  const [template, setTemplate] = useState(document.template || "");
  const [status, setStatus] = useState(document.status || "draft");
  const [saving, setSaving] = useState(false);
  const [autoSavePending, setAutoSavePending] = useState(false);
  const [versions, setVersions] = useState<any[]>(
    (document as any).versions || [],
  );
  const [historyOpen, setHistoryOpen] = useState(false);
  const [activePreviewVersion, setActivePreviewVersion] = useState<
    string | null
  >(null);
  const [toast, setToast] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  useEffect(() => {
    setContent(deepClone(document.content || {}));
    setTitle(document.title || "");
    setTemplate(document.template || "");
    setStatus(document.status || "draft");
    setVersions((document as any).versions || []);
    setActivePreviewVersion(
      ((document as any).versions || [])[0]?.id ||
        ((document as any).versions || [])[0]?._id ||
        null,
    );
  }, [document]);

  function showToast(type: "success" | "error" | "info", message: string) {
    setToast({ type, message });
    window.setTimeout(() => setToast(null), 3200);
  }

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const payload = {
        title,
        template,
        status,
        content,
      };

      const res = await fetch(`/api/documents/${documentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const message = await res.text();
        console.error("Failed to save document", message);
        showToast("error", "Unable to save changes.");
        return;
      }

      const data = await res.json();
      if (data?.document) {
        setVersions(data.document.versions || []);
        onUpdated?.(data.document);
        showToast("success", "Changes saved successfully.");
      } else {
        showToast("info", "Save completed.");
      }
      setAutoSavePending(false);
    } catch (err) {
      console.error("Error saving document:", err);
      showToast("error", "Save failed due to a network error.");
    } finally {
      setSaving(false);
    }
  }, [content, documentId, onUpdated, status, template, title]);

  useEffect(() => {
    const id = setInterval(() => {
      if (autoSavePending) {
        handleSave();
      }
    }, 15000);
    return () => clearInterval(id);
  }, [autoSavePending, handleSave]);

  async function handleDuplicate() {
    try {
      const dup = {
        title: `${title} (Copy)`,
        template,
        type: document.type,
        content,
      };
      const res = await fetch(`/api/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dup),
      });
      if (!res.ok) {
        showToast("error", "Unable to duplicate document.");
        throw new Error("Duplicate failed");
      }
      const data = await res.json();
      if (data?._id) {
        window.location.href = `/dashboard/documents/${data._id}`;
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this document permanently?")) {
      return;
    }

    try {
      const res = await fetch(`/api/documents/${documentId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        showToast("error", "Unable to delete document.");
        throw new Error("Delete failed");
      }
      window.location.href = "/dashboard/documents";
    } catch (err) {
      console.error(err);
    }
  }

  function markChanged() {
    setAutoSavePending(true);
  }

  const activeVersion = useMemo(() => {
    if (!versions?.length) return null;
    const selected = versions.find(
      (version: any) =>
        version.id === activePreviewVersion ||
        version._id === activePreviewVersion,
    );
    return selected || versions[0];
  }, [activePreviewVersion, versions]);

  function renderPreviewCard() {
    if (!content || Object.keys(content).length === 0) {
      return (
        <div className="rounded-3xl border border-dashed border-white/10 bg-slate-950/60 p-6 text-center text-sm text-slate-400">
          Start adding details to see the live preview here.
        </div>
      );
    }

    const name =
      content.personalInfo?.fullName ||
      content.fullName ||
      title ||
      "Untitled profile";
    const headline =
      content.personalInfo?.jobTitle ||
      content.position ||
      content.title ||
      "Craft a compelling summary to stand out.";
    const summary =
      content.personalInfo?.summary ||
      content.summary ||
      content.careerObjective ||
      content.description ||
      "A preview of your resume content appears here.";
    const highlights = [] as string[];

    if (Array.isArray(content.experience) && content.experience.length) {
      highlights.push(
        content.experience[0]?.position ||
          content.experience[0]?.company ||
          "Experience section added",
      );
    }
    if (Array.isArray(content.education) && content.education.length) {
      highlights.push(
        content.education[0]?.school || "Education section ready",
      );
    }
    if (Array.isArray(content.skills) && content.skills.length) {
      highlights.push(`${content.skills.length} skills listed`);
    }

    return (
      <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/80 p-6 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.6)]">
        <div className="mb-5">
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/70">
            Live preview
          </p>
          <h3 className="mt-3 text-2xl font-semibold text-white">{name}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-300">{headline}</p>
        </div>
        <div className="space-y-4">
          <p className="text-sm text-slate-400">{summary}</p>
          {highlights.length ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {highlights.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-3xl bg-white/5 p-4 text-sm text-slate-200"
                >
                  {item}
                </div>
              ))}
            </div>
          ) : null}
          <div className="rounded-3xl bg-slate-900/80 p-4 text-sm text-slate-400">
            <pre className="whitespace-pre-wrap break-words text-slate-300">
              {JSON.stringify(content, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    );
  }

  const builder = useMemo(() => {
    if (isResumeType(document.type)) {
      if (document.type === "internship_resume") {
        return (
          <InternshipForm
            initialData={content}
            multiStep={true}
            onSave={async (values) => {
              setContent(values as any);
              setAutoSavePending(true);
              await handleSave();
              return { id: documentId };
            }}
          />
        );
      }

      if (document.type === "fresher_resume") {
        return (
          <FresherResumeForm
            initialData={content}
            multiStep={true}
            onSave={async (values) => {
              setContent(values as any);
              setAutoSavePending(true);
              await handleSave();
              return { id: documentId };
            }}
          />
        );
      }

      if (document.type === "professional_resume") {
        return (
          <ProfessionalResumeForm
            initialData={content}
            multiStep={true}
            onSave={async (values) => {
              setContent(values as any);
              setAutoSavePending(true);
              await handleSave();
              return { id: documentId };
            }}
          />
        );
      }

      if (document.type === "ats_resume") {
        return (
          <ATSResumeForm
            initialData={content}
            multiStep={true}
            onSave={async (values) => {
              setContent(values as any);
              setAutoSavePending(true);
              await handleSave();
              return { id: documentId };
            }}
          />
        );
      }

      if (document.type === "cover_letter") {
        return (
          <CoverLetterForm
            initialData={content}
            multiStep={true}
            onSave={async (values) => {
              setContent(values as any);
              setAutoSavePending(true);
              await handleSave();
              return { id: documentId };
            }}
          />
        );
      }

      if (document.type === "statement_of_purpose") {
        return (
          <SOPForm
            initialData={content}
            multiStep={true}
            onSave={async (values) => {
              setContent(values as any);
              setAutoSavePending(true);
              await handleSave();
              return { id: documentId };
            }}
          />
        );
      }

      if (document.type === "letter_of_recommendation") {
        return (
          <LORForm
            initialData={content}
            multiStep={true}
            onSave={async (values) => {
              setContent(values as any);
              setAutoSavePending(true);
              await handleSave();
              return { id: documentId };
            }}
          />
        );
      }

      if (document.type === "marriage_biodata") {
        return (
          <MarriageBiodataForm
            initialData={content}
            multiStep={true}
            onSave={async (values) => {
              setContent(values as any);
              setAutoSavePending(true);
              await handleSave();
              return { id: documentId };
            }}
          />
        );
      }

      if (document.type === "portfolio") {
        return (
          <PortfolioForm
            initialData={content}
            multiStep={true}
            onSave={async (values) => {
              setContent(values as any);
              setAutoSavePending(true);
              await handleSave();
              return { id: documentId };
            }}
          />
        );
      }

      return (
        <ResumeForm
          initialData={content}
          multiStep={document.type === "job_resume"}
          onSave={async (values) => {
            setContent(values as any);
            setAutoSavePending(true);
            await handleSave();
            return { id: documentId };
          }}
        />
      );
    }

    // Generic recursive visual editor for other document types
    function renderField(key: string, value: any, path: string[]) {
      const id = path.join(".");
      if (typeof value === "string") {
        return (
          <div className="mb-3" key={id}>
            <label className="block text-sm text-gray-300 mb-1">{key}</label>
            <input
              value={value}
              onChange={(e) => {
                const next = deepClone(content);
                let cur: any = next;
                for (let i = 0; i < path.length - 1; i++)
                  cur = cur[path[i]] = { ...cur[path[i]] };
                cur[path[path.length - 1]] = e.target.value;
                setContent(next);
                markChanged();
              }}
              className="w-full rounded-md p-2 bg-slate-900 border border-slate-700 text-white"
            />
          </div>
        );
      }

      if (typeof value === "number") {
        return (
          <div className="mb-3" key={id}>
            <label className="block text-sm text-gray-300 mb-1">{key}</label>
            <input
              type="number"
              value={String(value)}
              onChange={(e) => {
                const next = deepClone(content);
                let cur: any = next;
                for (let i = 0; i < path.length - 1; i++)
                  cur = cur[path[i]] = { ...cur[path[i]] };
                cur[path[path.length - 1]] = Number(e.target.value);
                setContent(next);
                markChanged();
              }}
              className="w-full rounded-md p-2 bg-slate-900 border border-slate-700 text-white"
            />
          </div>
        );
      }

      if (Array.isArray(value)) {
        return (
          <div key={id} className="mb-4">
            <label className="block text-sm text-gray-300 mb-2">{key}</label>
            <div className="space-y-2">
              {value.map((item: any, idx: number) => (
                <div
                  key={idx}
                  className="p-3 rounded-md border border-slate-700 bg-slate-900"
                >
                  {typeof item === "object" ? (
                    Object.keys(item).map((k) =>
                      renderField(k, item[k], [...path, String(idx), k]),
                    )
                  ) : (
                    <input
                      value={String(item)}
                      onChange={(e) => {
                        const next = deepClone(content);
                        let cur: any = next;
                        for (let i = 0; i < path.length; i++)
                          cur = cur[path[i]] = { ...cur[path[i]] };
                        cur[idx] = e.target.value;
                        setContent(next);
                        markChanged();
                      }}
                      className="w-full rounded-md p-2 bg-slate-900 border border-slate-700 text-white"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      }

      if (typeof value === "object") {
        return (
          <div
            key={id}
            className="mb-4 p-3 rounded-md border border-slate-700 bg-slate-900"
          >
            <label className="block text-sm text-gray-300 mb-2">{key}</label>
            {Object.keys(value).map((k) =>
              renderField(k, value[k], [...path, k]),
            )}
          </div>
        );
      }

      return null;
    }

    return (
      <div>
        {Object.keys(content).map((k) => renderField(k, content[k], [k]))}
      </div>
    );
  }, [content, document.type, documentId, handleSave]);

  return (
    <div className="space-y-6">
      <div className="sticky top-4 z-20 rounded-[2rem] border border-white/10 bg-slate-950/90 p-5 shadow-[0_32px_90px_-45px_rgba(0,0,0,0.9)] backdrop-blur-3xl">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.32em] text-cyan-300/70">
              Document builder
            </p>
            <h2 className="text-2xl font-semibold text-white">
              {title || "Untitled document"}
            </h2>
            <p className="max-w-2xl text-sm leading-6 text-slate-400">
              Keep your profile polished with version history, smart preview,
              and clean layout.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Badge
              variant={
                status === "published"
                  ? "success"
                  : status === "completed"
                    ? "warning"
                    : "muted"
              }
            >
              {status}
            </Badge>
            <Button onClick={handleSave} variant="primary" size="sm">
              {saving ? "Saving..." : "Save changes"}
            </Button>
            <Button
              onClick={() => setHistoryOpen(true)}
              variant="secondary"
              size="sm"
            >
              <Clock3 className="mr-2 h-4 w-4" /> History
            </Button>
            <Button onClick={handleDuplicate} variant="ghost" size="sm">
              <RefreshCw className="mr-2 h-4 w-4" /> Duplicate
            </Button>
            <Button onClick={handleDelete} variant="destructive" size="sm">
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        <div className="space-y-6">
          <Card className="p-6">
            <div className="grid gap-6">
              <div className="space-y-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                      Content controls
                    </p>
                    <h3 className="text-xl font-semibold text-white">
                      Edit profile details
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Input
                      value={title}
                      placeholder="Document title"
                      onChange={(e) => {
                        setTitle(e.target.value);
                        markChanged();
                      }}
                    />
                    <Input
                      value={template}
                      placeholder="Template"
                      onChange={(e) => {
                        setTemplate(e.target.value);
                        markChanged();
                      }}
                    />
                  </div>
                </div>
                <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
                  <div className="space-y-6">{builder}</div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-cyan-300/70">
                  Live preview
                </p>
                <h3 className="mt-2 text-lg font-semibold text-white">
                  Resume snapshot
                </h3>
              </div>
              <Badge variant="default">
                Auto-save {autoSavePending ? "pending" : "ready"}
              </Badge>
            </div>
            {renderPreviewCard()}
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
                  Version history
                </p>
                <h3 className="mt-1 text-lg font-semibold text-white">
                  Timeline overview
                </h3>
              </div>
              <Badge variant="muted">{versions?.length ?? 0} entries</Badge>
            </div>
            <div className="mt-6 space-y-4">
              {versions?.length ? (
                versions.slice(0, 3).map((version: any, index: number) => (
                  <motion.div
                    key={version.id || version._id || index}
                    className="rounded-3xl border border-white/10 bg-slate-950/80 p-4 transition hover:border-cyan-400/40"
                    whileHover={{ y: -2 }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-white">
                          {version.title || `Version ${index + 1}`}
                        </p>
                        <p className="text-sm text-slate-400">
                          {new Date(version.updatedAt).toLocaleString()}
                        </p>
                      </div>
                      <Badge variant="success">
                        {index === 0 ? "Latest" : "Snapshot"}
                      </Badge>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-400 line-clamp-2">
                      {version.notes ||
                        version.summary ||
                        "Restore a previous state quickly."}
                    </p>
                  </motion.div>
                ))
              ) : (
                <div className="rounded-3xl border border-dashed border-white/10 bg-slate-950/60 p-6 text-center text-sm text-slate-400">
                  No versions have been saved yet. Save changes to create your
                  first snapshot.
                </div>
              )}
            </div>
            <div className="mt-6 flex items-center justify-between gap-3">
              <Button
                onClick={() => setHistoryOpen(true)}
                variant="secondary"
                size="sm"
              >
                <History className="mr-2 h-4 w-4" /> View full timeline
              </Button>
              <Button
                onClick={() => {
                  if (activeVersion?.content) {
                    setContent(activeVersion.content);
                    markChanged();
                    showToast("success", "Version restored in preview.");
                  }
                }}
                variant="ghost"
                size="sm"
              >
                Restore preview
              </Button>
            </div>
          </Card>
        </div>
      </div>

      <Modal
        open={historyOpen}
        title="Document version history"
        description="Browse timeline entries and restore a past snapshot with confidence."
        onClose={() => setHistoryOpen(false)}
      >
        {versions?.length ? (
          <div className="space-y-4">
            {versions.map((version: any, index: number) => (
              <motion.div
                key={version.id || version._id || index}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15, delay: index * 0.03 }}
                className="rounded-3xl border border-white/10 bg-slate-950/80 p-5"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-white">
                      {version.title || `Version ${index + 1}`}
                    </p>
                    <p className="text-sm text-slate-400">
                      {new Date(version.updatedAt).toLocaleString()}
                    </p>
                  </div>
                  <Button
                    onClick={() => {
                      setContent(version.content);
                      markChanged();
                      setHistoryOpen(false);
                      showToast("success", "Version restored successfully.");
                    }}
                    variant="primary"
                    size="sm"
                  >
                    Restore
                  </Button>
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-400">
                  {version.notes || "A snapshot of your document state."}
                </p>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-white/10 bg-slate-950/70 p-8 text-center text-sm text-slate-400">
            No version history is available yet.
          </div>
        )}
      </Modal>

      <AnimatePresence>
        {toast ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="fixed right-4 bottom-4 z-50 max-w-sm rounded-3xl border border-white/10 bg-slate-950/95 p-4 shadow-2xl shadow-black/40"
          >
            <div className="flex items-start gap-3">
              <div className="mt-1 h-3 w-3 rounded-full bg-cyan-400" />
              <div>
                <p className="font-semibold text-white">
                  {toast.type === "success"
                    ? "Success"
                    : toast.type === "error"
                      ? "Error"
                      : "Update"}
                </p>
                <p className="mt-1 text-sm text-slate-300">{toast.message}</p>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
