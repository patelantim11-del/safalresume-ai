"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Document } from "@/types";
import { AnimatePresence, motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
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
  const [template, setTemplate] = useState<string[]>(() => {
    const templateStr = document.template || "";
    return templateStr
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
  });
  const [status, setStatus] = useState(document.status || "draft");
  const [saving, setSaving] = useState(false);
  const [autoSavePending, setAutoSavePending] = useState(false);
  const [versions, setVersions] = useState<any[]>(
    (document as any).versions || [],
  );
  const [historyOpen, setHistoryOpen] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<
    "idle" | "pending" | "saving"
  >("idle");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const lastSavedPayload = useRef<string>("");
  const isInitialLoadRef = useRef(true);
  const debounceTimerRef = useRef<number | null>(null);
  const saveRunningRef = useRef(false);
  const savedIndicatorTimerRef = useRef<number | null>(null);
  // previously used to show a temporary saved indicator; removed because it wasn't read anywhere
  const [toast, setToast] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  useEffect(() => {
    const docContent = document.content as any;
    const normalizedContent = {
      personalInfo: {
        fullName: docContent?.personalInfo?.fullName || "",
        jobTitle: docContent?.personalInfo?.jobTitle || "",
        email: docContent?.personalInfo?.email || "",
        phone: docContent?.personalInfo?.phone || "",
        location: docContent?.personalInfo?.location || "",
        linkedIn: docContent?.personalInfo?.linkedIn || "",
        github: docContent?.personalInfo?.github || "",
        portfolio: docContent?.personalInfo?.portfolio || "",
        summary: docContent?.personalInfo?.summary || "",
      },
      education: Array.isArray(docContent?.education)
        ? docContent.education
        : [],
      experience: Array.isArray(docContent?.experience)
        ? docContent.experience
        : [],
      skills: Array.isArray(docContent?.skills) ? docContent.skills : [],
      projects: Array.isArray(docContent?.projects) ? docContent.projects : [],
    };

    setContent(deepClone(normalizedContent));
    setTitle(document.title || "");
    setTemplate(
      document.template
        ? document.template
            .split(",")
            .map((t) => t.trim())
            .filter((t) => t.length > 0)
        : [],
    );
    setStatus(document.status || "draft");
    setVersions((document as any).versions || []);

    lastSavedPayload.current = JSON.stringify({
      title: document.title || "",
      template: document.template || "",
      status: document.status || "draft",
      content: normalizedContent,
    });
    setAutoSavePending(false);
    setAutoSaveStatus("idle");
    setLastSavedAt(new Date());
    // mark initial load complete after setting initial state
    // so autosave doesn't trigger for the initial population
    isInitialLoadRef.current = false;
  }, [document]);

  function showToast(type: "success" | "error" | "info", message: string) {
    setToast({ type, message });
    window.setTimeout(() => setToast(null), 3200);
  }

  const handleSave = useCallback(
    async (options?: { auto?: boolean }) => {
      const isAuto = options?.auto;
      // prevent overlapping saves
      if (saveRunningRef.current) return;

      saveRunningRef.current = true;
      setSaving(true);
      const payload = {
        title,
        template: template.join(","),
        status,
        content,
      };
      const payloadString = JSON.stringify(payload);

      // don't save if nothing changed
      if (payloadString === lastSavedPayload.current) {
        setAutoSavePending(false);
        setAutoSaveStatus("idle");
        saveRunningRef.current = false;
        setSaving(false);
        if (!isAuto) {
          showToast("info", "No changes to save.");
        }
        return;
      }

      if (isAuto) {
        setAutoSaveStatus("saving");
      }

      try {
        const res = await fetch(`/api/documents/${documentId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: payloadString,
        });

        if (!res.ok) {
          const message = await res.text();
          console.error("Failed to save document", message);
          if (!isAuto) {
            showToast("error", "Unable to save changes.");
          }
          setAutoSaveStatus("idle");
          setAutoSavePending(false);
          return;
        }

        const data = await res.json();
        const now = new Date();
        lastSavedPayload.current = payloadString;
        setLastSavedAt(now);
        setAutoSaveStatus("idle");
        setAutoSavePending(false);

        // mark recently saved for UI feedback (no-op; indicator removed)

        if (data?.document) {
          // do not update form state from autosave response
          if (!isAuto) {
            setVersions(data.document.versions || []);
            onUpdated?.(data.document);
            showToast("success", "Changes saved successfully.");
          }
        } else if (!isAuto) {
          showToast("info", "Save completed.");
        }
      } catch (err) {
        console.error("Error saving document:", err);
        if (!isAuto) {
          showToast("error", "Save failed due to a network error.");
        }
        setAutoSaveStatus("idle");
        setAutoSavePending(false);
      } finally {
        saveRunningRef.current = false;
        setSaving(false);
      }
    },
    [content, documentId, onUpdated, status, template, title],
  );

  // Debounced autosave when changes are marked. Clears timers on unmount.
  useEffect(() => {
    if (!autoSavePending) return;

    // don't autosave during initial load
    if (isInitialLoadRef.current) return;

    // clear existing debounce
    if (debounceTimerRef.current) {
      window.clearTimeout(debounceTimerRef.current);
    }

    // 1500ms debounce before autosave
    debounceTimerRef.current = window.setTimeout(() => {
      debounceTimerRef.current = null;
      handleSave({ auto: true });
    }, 1500) as unknown as number;

    return () => {
      if (debounceTimerRef.current) {
        window.clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
    };
  }, [autoSavePending, handleSave]);

  // clear timers on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        window.clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
      if (savedIndicatorTimerRef.current) {
        window.clearTimeout(savedIndicatorTimerRef.current);
        savedIndicatorTimerRef.current = null;
      }
    };
  }, []);

  async function handleDuplicate() {
    try {
      const dup = {
        title: `${title} (Copy)`,
        template: template.join(","),
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

  const markChanged = useCallback(() => {
    setAutoSavePending(true);
    setAutoSaveStatus("pending");
  }, []);

  const autosaveBadgeText =
    saving || autoSaveStatus === "saving"
      ? "Saving..."
      : autoSavePending
        ? "Unsaved changes"
        : lastSavedAt
          ? "All changes saved"
          : "Ready";

  const autosaveBadgeVariant =
    saving || autoSaveStatus === "saving"
      ? "warning"
      : autoSavePending
        ? "destructive"
        : "success";

  function handleRestoreVersion(version: any) {
    if (version?.content) {
      setContent(deepClone(version.content));
    }
    setHistoryOpen(false);
    markChanged();
  }

  const handleFormChange = useCallback(
    (newContent: any) => {
      // Update local content and mark as changed. Autosave will run via debounce.
      setContent(newContent);
      markChanged();
      return Promise.resolve();
    },
    [markChanged],
  );

  const renderForm = () => {
    const commonProps = {
      initialData: content,
      onSave: handleFormChange,
      multiStep: false,
    };

    switch (document.type) {
      case "job_resume":
        return <ResumeForm {...commonProps} />;
      case "fresher_resume":
        return <FresherResumeForm {...commonProps} />;
      case "professional_resume":
        return <ProfessionalResumeForm {...commonProps} />;
      case "ats_resume":
        return <ATSResumeForm {...commonProps} />;
      case "internship_resume":
        return <InternshipForm {...commonProps} />;
      case "cover_letter":
        return <CoverLetterForm {...commonProps} />;
      case "statement_of_purpose":
        return <SOPForm {...commonProps} />;
      case "letter_of_recommendation":
        return <LORForm {...commonProps} />;
      case "marriage_biodata":
        return <MarriageBiodataForm {...commonProps} />;
      case "portfolio":
        return <PortfolioForm {...commonProps} />;
      default:
        return <ResumeForm {...commonProps} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="border-b border-slate-800 bg-slate-950/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/70">
              Document editor
            </p>
            <h1 className="text-3xl font-semibold text-white">
              {title || "Untitled Document"}
            </h1>
            <p className="text-sm text-slate-400">
              {document.type.replace(/_/g, " ")}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant={autosaveBadgeVariant}>{autosaveBadgeText}</Badge>
            <Button
              onClick={() => handleSave()}
              disabled={saving}
              variant="primary"
              size="sm"
            >
              {saving ? "Saving..." : "Save"}
            </Button>
            <Button onClick={handleDuplicate} variant="secondary" size="sm">
              Duplicate
            </Button>
            <Button onClick={handleDelete} variant="destructive" size="sm">
              <Trash2 size={16} />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">{renderForm()}</div>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-4 right-4 z-50"
          >
            <div
              className={`rounded-2xl px-4 py-3 text-sm font-medium ${
                toast.type === "success"
                  ? "bg-emerald-500/20 text-emerald-200 border border-emerald-500/30"
                  : toast.type === "error"
                    ? "bg-rose-500/20 text-rose-200 border border-rose-500/30"
                    : "bg-sky-500/20 text-sky-200 border border-sky-500/30"
              }`}
            >
              {toast.message}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Modal
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        title="Version History"
      >
        <div className="space-y-4">
          {versions.length === 0 && (
            <p className="text-slate-400 text-center py-8">
              No saved versions yet.
            </p>
          )}
          {versions.map((version, index) => (
            <div
              key={index}
              className="p-4 rounded-2xl border border-slate-700 bg-slate-900/40"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-white">
                  Version {versions.length - index}
                </p>
                <button
                  onClick={() => handleRestoreVersion(version)}
                  className="rounded-xl bg-sky-500/20 px-3 py-1 text-sm text-sky-300 hover:bg-sky-500/30 transition"
                >
                  Restore
                </button>
              </div>
              <p className="text-xs text-slate-400">
                {new Date(version.timestamp || Date.now()).toLocaleString()}
              </p>
              {version.changes && (
                <p className="text-sm text-slate-300 mt-2 line-clamp-3">
                  {version.changes}
                </p>
              )}
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}
