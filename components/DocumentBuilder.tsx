"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Document } from "@/types";
import { AnimatePresence, motion } from "framer-motion";
import { Clock3, History, RefreshCw, Trash2, User } from "lucide-react";
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
  // preview selection state intentionally omitted — history modal handles restores
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

  // activePreviewVersion is available for modal preview selection if needed

  function renderPreviewCard() {
    // Build a polished resume preview using available content fields
    const name =
      content.personalInfo?.fullName ||
      content.fullName ||
      title ||
      "Your Name";
    const titleLine =
      content.personalInfo?.jobTitle ||
      content.position ||
      content.title ||
      "Professional Title";
    const summary =
      content.personalInfo?.summary ||
      content.summary ||
      content.careerObjective ||
      "Write a short summary that highlights your strengths and achievements.";

    const experiences = Array.isArray(content.experience)
      ? content.experience
      : [];
    const education = Array.isArray(content.education) ? content.education : [];
    const skills = Array.isArray(content.skills) ? content.skills : [];

    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-white/8 bg-slate-950/85 p-6 shadow-md"
      >
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-lg bg-white/5 flex items-center justify-center text-cyan-300">
            <User className="w-8 h-8" />
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-semibold leading-tight text-white">
                  {name}
                </h3>
                <p className="text-sm text-slate-300 mt-1">{titleLine}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-400">
                  {content.location || ""}
                </p>
                <p className="text-sm text-slate-400">{content.email || ""}</p>
              </div>
            </div>

            <p className="mt-4 text-sm text-slate-300 leading-6">{summary}</p>

            {experiences.length > 0 && (
              <div className="mt-5">
                <h4 className="text-sm font-semibold text-white mb-2">
                  Experience
                </h4>
                <div className="space-y-3">
                  {experiences.slice(0, 3).map((exp: any, i: number) => (
                    <div key={i} className="rounded-xl bg-white/3 p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-white">
                            {exp.position || exp.title || exp.role}
                          </p>
                          <p className="text-sm text-slate-400">
                            {exp.company || exp.organization}
                          </p>
                        </div>
                        <p className="text-sm text-slate-400">
                          {exp.period || (exp.startDate && exp.endDate)
                            ? `${exp.startDate || ""} — ${exp.endDate || "Present"}`
                            : ""}
                        </p>
                      </div>
                      {exp.summary && (
                        <p className="mt-2 text-sm text-slate-300">
                          {exp.summary}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {education.length > 0 && (
              <div className="mt-5">
                <h4 className="text-sm font-semibold text-white mb-2">
                  Education
                </h4>
                <div className="space-y-2">
                  {education.slice(0, 2).map((ed: any, i: number) => (
                    <div key={i} className="text-sm text-slate-300">
                      <p className="font-medium text-white">
                        {ed.school || ed.institution}
                      </p>
                      <p className="text-slate-400">
                        {ed.degree || ed.certification} • {ed.year || ""}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {skills.length > 0 && (
              <div className="mt-5">
                <h4 className="text-sm font-semibold text-white mb-2">
                  Skills
                </h4>
                <div className="flex flex-wrap gap-2">
                  {skills.slice(0, 8).map((s: any, i: number) => (
                    <span
                      key={i}
                      className="text-xs bg-white/5 text-slate-200 px-2 py-1 rounded-md"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
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
      <div className="sticky top-4 z-30 rounded-4xl border border-white/10 bg-white/5 backdrop-blur-lg p-5 shadow-lg">
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

      <div className="grid gap-6 md:grid-cols-1 xl:grid-cols-[1.6fr_1fr]">
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
                <div className="grid gap-4">
                  <div className="space-y-6">{builder}</div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <div className="sticky top-28 space-y-6">
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
                      className="rounded-3xl border border-white/10 bg-white/3 p-4 transition hover:border-cyan-400/40 backdrop-blur-sm"
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
              </div>
            </Card>
          </div>
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
