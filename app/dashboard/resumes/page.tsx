"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type ResumeCard = {
  id: string;
  title: string;
  template: string;
  personalInfo: {
    fullName: string;
  };
  updatedAt: string;
  createdAt: string;
};

const PAGE_SIZE = 10;

export default function DashboardResumesPage() {
  const [resumes, setResumes] = useState<ResumeCard[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const fetchResumes = useCallback(async () => {
    setLoading(true);
    setError(null);
    setStatusMessage(null);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: PAGE_SIZE.toString(),
        search,
      });
      const response = await fetch(`/api/resumes?${params.toString()}`, {
        cache: "no-store",
      });
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = "/auth/login";
          return;
        }

        throw new Error(data?.error || "Unable to load resumes.");
      }

      setResumes(data.resumes || []);
      setTotal(data.total || 0);
    } catch (err: any) {
      setError(err?.message ?? String(err));
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchResumes();
  }, [fetchResumes]);

  async function deleteResume(id: string) {
    if (!confirm("Delete this resume permanently?")) {
      return;
    }

    try {
      const response = await fetch(`/api/resumes/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Unable to delete resume.");
      }

      setStatusMessage("Resume deleted successfully.");
      await fetchResumes();
    } catch (err: any) {
      setError(err?.message ?? String(err));
    }
  }

  async function duplicateResume(id: string) {
    try {
      const resumeResponse = await fetch(`/api/resumes/${id}`, {
        cache: "no-store",
      });
      const resumeData = await resumeResponse.json();

      if (!resumeResponse.ok) {
        throw new Error(resumeData?.error || "Unable to duplicate resume.");
      }

      const original = resumeData.resume;
      const duplicatePayload = {
        ...original,
        title: `Copy of ${original.title || "Resume"}`,
      };
      delete duplicatePayload.id;

      const createResponse = await fetch("/api/resumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(duplicatePayload),
      });
      const createData = await createResponse.json();

      if (!createResponse.ok) {
        throw new Error(createData?.error || "Unable to duplicate resume.");
      }

      setStatusMessage("Resume duplicated successfully.");
      setPage(1);
      await fetchResumes();
    } catch (err: any) {
      setError(err?.message ?? String(err));
    }
  }

  function downloadResume(id: string) {
    window.open(`/dashboard/resumes/view/${id}?print=true`, "_blank");
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <section className="mx-auto max-w-6xl px-6 py-16 sm:px-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-sky-400">
            My Resumes
          </p>
          <h1 className="mt-3 text-4xl font-semibold text-white">
            Your private resume library
          </h1>
          <p className="mt-4 max-w-2xl text-slate-400">
            Only you can access these resumes. Search by title, view details,
            edit drafts, and keep your job search moving.
          </p>
        </div>
        <Link
          href="/resume?new=true"
          className="inline-flex items-center justify-center rounded-3xl bg-sky-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
        >
          Create New Resume
        </Link>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <label className="block text-sm text-slate-300">
            Search resumes
            <input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Resume title"
              className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-sky-500"
            />
          </label>
        </div>
        <div className="flex items-center gap-3 text-sm text-slate-400">
          <span>{total} resumes</span>
          <span>
            Page {page} of {totalPages}
          </span>
        </div>
      </div>

      {loading ? (
        <div className="rounded-4xl border border-slate-800 bg-slate-900/90 p-10 text-center text-slate-300">
          Loading resumes...
        </div>
      ) : error ? (
        <div className="rounded-4xl border border-rose-500 bg-rose-500/10 p-6 text-sm text-rose-200">
          {error}
        </div>
      ) : resumes.length === 0 ? (
        <div className="rounded-4xl border border-slate-800 bg-slate-900/90 p-10 text-slate-300">
          No resumes found. Start by creating a new resume.
        </div>
      ) : (
        <div className="grid gap-6">
          {resumes.map((resume) => (
            <div
              key={resume.id}
              className="rounded-4xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl shadow-slate-950/20"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-sky-400">
                    {resume.template} template
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">
                    {resume.title}
                  </h2>
                  <p className="mt-2 text-sm text-slate-400">
                    {resume.personalInfo.fullName || "Unnamed candidate"}
                  </p>
                </div>
                <div className="space-y-2 text-right text-sm text-slate-400">
                  <p>
                    Updated{" "}
                    {new Date(resume.updatedAt).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                  <p>
                    Created{" "}
                    {new Date(resume.createdAt).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href={`/dashboard/resumes/view/${resume.id}`}
                  className="rounded-2xl border border-slate-700 bg-slate-950 px-5 py-3 text-sm text-slate-100 transition hover:border-sky-500"
                >
                  View Resume
                </Link>
                <Link
                  href={`/resume?resumeId=${resume.id}`}
                  className="rounded-2xl border border-slate-700 bg-slate-950 px-5 py-3 text-sm text-slate-100 transition hover:border-sky-500"
                >
                  Edit Resume
                </Link>
                <button
                  type="button"
                  onClick={() => downloadResume(resume.id)}
                  className="rounded-2xl border border-slate-700 bg-slate-950 px-5 py-3 text-sm text-slate-100 transition hover:border-sky-500"
                >
                  Download PDF
                </button>
                <button
                  type="button"
                  onClick={() => duplicateResume(resume.id)}
                  className="rounded-2xl border border-slate-700 bg-slate-950 px-5 py-3 text-sm text-slate-100 transition hover:border-sky-500"
                >
                  Duplicate
                </button>
                <button
                  type="button"
                  onClick={() => deleteResume(resume.id)}
                  className="rounded-2xl border border-rose-500 bg-rose-500/10 px-5 py-3 text-sm text-rose-200 transition hover:bg-rose-500/20"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 text-sm text-slate-300">
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-2 transition hover:border-sky-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-2 transition hover:border-sky-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
        <div>
          Showing page {page} of {totalPages}
        </div>
      </div>

      {statusMessage ? (
        <div className="mt-6 rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-slate-300">
          {statusMessage}
        </div>
      ) : null}
    </section>
  );
}
