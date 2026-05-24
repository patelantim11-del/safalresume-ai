"use client";

import { Document } from "@/types";
import { useCallback, useEffect, useMemo, useState } from "react";
import FresherResumeForm from "./FresherResumeForm";
import InternshipForm from "./InternshipForm";
import ResumeForm from "./ResumeForm";

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

  useEffect(() => {
    setContent(deepClone(document.content || {}));
    setTitle(document.title || "");
    setTemplate(document.template || "");
    setStatus(document.status || "draft");
    setVersions((document as any).versions || []);
  }, [document]);

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
        console.error("Failed to save document", await res.text());
        setSaving(false);
        return;
      }

      const data = await res.json();
      if (data?.document) {
        setVersions(data.document.versions || []);
        onUpdated?.(data.document);
      }
      setAutoSavePending(false);
    } catch (err) {
      console.error("Error saving document:", err);
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
      if (!res.ok) throw new Error("Duplicate failed");
      const data = await res.json();
      // navigate to new doc when available
      if (data?._id) {
        window.location.href = `/dashboard/documents/${data._id}`;
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDelete() {
    try {
      const res = await fetch(`/api/documents/${documentId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
      window.location.href = "/dashboard/documents";
    } catch (err) {
      console.error(err);
    }
  }

  function markChanged() {
    setAutoSavePending(true);
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
    <div>
      <div className="flex items-center gap-3 mb-4">
        <input
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            markChanged();
          }}
          className="flex-1 rounded-2xl border border-slate-700 bg-slate-900 px-4 py-2 text-white"
        />
        <button
          onClick={handleSave}
          className="px-4 py-2 rounded-2xl bg-blue-600 text-white"
        >
          {saving ? "Saving..." : "Save"}
        </button>
        <button
          onClick={handleDuplicate}
          className="px-4 py-2 rounded-2xl bg-slate-800 text-white"
        >
          Duplicate
        </button>
        <button
          onClick={handleDelete}
          className="px-4 py-2 rounded-2xl bg-rose-600 text-white"
        >
          Delete
        </button>
      </div>

      <div className="space-y-6">{builder}</div>

      {versions && versions.length > 0 && (
        <div className="mt-6 rounded-md border border-slate-700 p-4 bg-slate-900">
          <h4 className="text-sm text-gray-300 mb-2">Version history</h4>
          <ul className="space-y-2 text-sm text-slate-300">
            {versions.map((v: any, i: number) => (
              <li key={i} className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{v.title || "Version"}</div>
                  <div className="text-xs text-gray-400">
                    {new Date(v.updatedAt).toLocaleString()}
                  </div>
                </div>
                <button
                  onClick={() => {
                    setContent(v.content);
                    markChanged();
                  }}
                  className="px-3 py-1 rounded-md bg-slate-800 text-sm"
                >
                  Restore
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
