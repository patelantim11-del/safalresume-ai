"use client";

import { FileInput, Trophy } from "lucide-react";
import { useState } from "react";

interface CareerAssistantProps {
  resume: any;
  onApplySummary: (summary: string) => void;
  onAddAchievement: (achievement: string) => void;
}

interface AnalysisResult {
  score: number;
  experienceQuality: number;
  educationCompleteness: number;
  projectStrength: number;
  keywordMatchPct: number;
  missingKeywords: string[];
  matchedKeywords: string[];
  jdKeywordsCount: number;
  formattingIssues: string[];
}

export default function CareerAssistant({
  resume,
  onApplySummary,
  onAddAchievement,
}: CareerAssistantProps) {
  const [jobDescription, setJobDescription] = useState("");
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [summary, setSummary] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [questions, setQuestions] = useState<{
    hr: string[];
    technical: string[];
    behavioral: string[];
  } | null>(null);
  const [roadmap, setRoadmap] = useState<string[]>([]);
  const [linkedin, setLinkedin] = useState<{
    headline: string;
    about: string;
  } | null>(null);
  const [skills, setSkills] = useState<string[]>([]);
  const [projects, setProjects] = useState<string[]>([]);
  const [achievement, setAchievement] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function callCareerApi(action: string, payload: any = {}) {
    setLoading(true);
    setStatus(null);
    try {
      const response = await fetch("/api/career", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, resume, ...payload }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Career tool error");
      }
      return data;
    } catch (error: any) {
      setStatus(error?.message || String(error));
      return null;
    } finally {
      setLoading(false);
    }
  }

  async function handleAnalyze() {
    const data = await callCareerApi("analyze", { jobDescription });
    if (data) {
      setAnalysis(data.score);
      setStatus("Resume analysis complete.");
    }
  }

  async function handleMatchJD() {
    const data = await callCareerApi("job-match", { jobDescription });
    if (data) {
      setAnalysis((prev) => ({
        score: prev?.score ?? 0,
        experienceQuality: prev?.experienceQuality ?? 0,
        educationCompleteness: prev?.educationCompleteness ?? 0,
        projectStrength: prev?.projectStrength ?? 0,
        keywordMatchPct: data.comparison.keywordMatchPct,
        missingKeywords: data.comparison.missingKeywords,
        matchedKeywords: data.comparison.matchedKeywords,
        jdKeywordsCount: data.comparison.jdKeywordsCount,
        formattingIssues: prev?.formattingIssues || [],
      }));
      setStatus("Job description match ready.");
    }
  }

  async function handleGenerateSummary() {
    const data = await callCareerApi("summary");
    if (data) {
      setSummary(data.summary);
      onApplySummary(data.summary);
      setStatus("Summary generated and applied to your profile.");
    }
  }

  async function handleGenerateCoverLetter() {
    const data = await callCareerApi("cover-letter", {
      jobTitle: resume.personalInfo.jobTitle,
      company: "Your target company",
      jobDescription,
    });
    if (data) {
      setCoverLetter(data.coverLetter);
      setStatus("Cover letter generated.");
    }
  }

  async function handleGenerateInterview() {
    const data = await callCareerApi("interview", {
      jobTitle: resume.personalInfo.jobTitle,
    });
    if (data) {
      setQuestions(data.questions);
      setStatus("Interview questions generated.");
    }
  }

  async function handleGenerateRoadmap() {
    const data = await callCareerApi("roadmap", {
      jobTitle: resume.personalInfo.jobTitle,
    });
    if (data) {
      setRoadmap(data.roadmap);
      setStatus("Career roadmap generated.");
    }
  }

  async function handleOptimizeLinkedIn() {
    const data = await callCareerApi("linkedin");
    if (data) {
      setLinkedin(data.profile);
      setStatus("LinkedIn optimization complete.");
    }
  }

  async function handleSuggestSkills() {
    const data = await callCareerApi("skills", {
      jobTitle: resume.personalInfo.jobTitle,
    });
    if (data) {
      setSkills(data.skills);
      setStatus("Trending skills suggested.");
    }
  }

  async function handleRecommendProjects() {
    const data = await callCareerApi("projects", {
      jobTitle: resume.personalInfo.jobTitle,
    });
    if (data) {
      setProjects(data.projects);
      setStatus("Project recommendations ready.");
    }
  }

  async function handleImproveAchievement() {
    if (!achievement.trim()) {
      setStatus("Enter a statement to transform.");
      return;
    }
    const data = await callCareerApi("achievement", {
      achievementText: achievement,
    });
    if (data) {
      setAchievement(data.achievement);
      onAddAchievement(data.achievement);
      setStatus("Achievement transformed and appended.");
    }
  }

  return (
    <div className="space-y-6 rounded-4xl border border-slate-800 bg-slate-950/90 p-6 shadow-xl shadow-slate-950/20">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-sky-500/10 text-sky-300">
          <FileInput size={24} />
        </span>
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-sky-400">
            Career Toolkit
          </p>
          <h3 className="text-2xl font-semibold text-white">
            AI resume health & matching
          </h3>
        </div>
      </div>

      <div className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900/80 p-4">
        <label className="block text-sm text-slate-300">
          Paste job description for matching
          <textarea
            rows={5}
            value={jobDescription}
            onChange={(event) => setJobDescription(event.target.value)}
            placeholder="Paste a job description to identify skill gaps and keyword matches."
            className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-sky-500"
          />
        </label>
        <div className="grid gap-3 sm:grid-cols-3">
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={loading}
            className="rounded-3xl bg-sky-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:opacity-50"
          >
            Analyze resume
          </button>
          <button
            type="button"
            onClick={handleMatchJD}
            disabled={loading}
            className="rounded-3xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:border-sky-500 disabled:opacity-50"
          >
            Match to JD
          </button>
          <button
            type="button"
            onClick={handleGenerateSummary}
            disabled={loading}
            className="rounded-3xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-50"
          >
            Generate summary
          </button>
        </div>
        {summary ? (
          <div className="rounded-3xl border border-slate-800 bg-slate-950/90 p-4 text-sm text-slate-200">
            <p className="font-semibold text-white">Generated summary</p>
            <p className="mt-3 leading-6 text-slate-300">{summary}</p>
          </div>
        ) : null}
        {status ? <p className="text-sm text-slate-300">{status}</p> : null}
      </div>

      {analysis ? (
        <div className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900/90 p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-sky-400">
                ATS Score
              </p>
              <p className="mt-2 text-3xl font-semibold text-white">
                {analysis.score}%
              </p>
            </div>
            <div className="rounded-3xl bg-slate-950 px-4 py-3 text-sm text-slate-300">
              Keyword match {analysis.keywordMatchPct}%
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-3xl bg-slate-950 p-4 text-sm text-slate-200">
              <p className="font-semibold text-white">Experience quality</p>
              <p className="mt-2">{analysis.experienceQuality}%</p>
            </div>
            <div className="rounded-3xl bg-slate-950 p-4 text-sm text-slate-200">
              <p className="font-semibold text-white">Education completeness</p>
              <p className="mt-2">{analysis.educationCompleteness}%</p>
            </div>
            <div className="rounded-3xl bg-slate-950 p-4 text-sm text-slate-200">
              <p className="font-semibold text-white">Project strength</p>
              <p className="mt-2">{analysis.projectStrength}%</p>
            </div>
            <div className="rounded-3xl bg-slate-950 p-4 text-sm text-slate-200">
              <p className="font-semibold text-white">Keyword gap</p>
              <p className="mt-2">{analysis.missingKeywords.length} missing</p>
            </div>
          </div>
          {analysis.formattingIssues.length ? (
            <div className="rounded-3xl bg-slate-950 p-4 text-sm text-slate-300">
              <p className="font-semibold text-white">Fix suggestions</p>
              <ul className="mt-3 list-disc space-y-2 pl-5">
                {analysis.formattingIssues.map((issue, index) => (
                  <li key={index}>{issue}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={handleSuggestSkills}
          disabled={loading}
          className="rounded-3xl bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-700 disabled:opacity-50"
        >
          Suggest trending skills
        </button>
        <button
          type="button"
          onClick={handleRecommendProjects}
          disabled={loading}
          className="rounded-3xl bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-700 disabled:opacity-50"
        >
          Recommend projects
        </button>
      </div>

      {skills.length ? (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-4 text-sm text-slate-200">
          <p className="font-semibold text-white">Trending skills</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {projects.length ? (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-4 text-sm text-slate-200">
          <div className="flex items-center gap-2 text-white">
            <Trophy size={18} />
            <p className="font-semibold">Project ideas</p>
          </div>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            {projects.map((project, index) => (
              <li key={index}>{project}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900/90 p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="font-semibold text-white">Achievement upgrade</p>
          <button
            type="button"
            onClick={handleImproveAchievement}
            disabled={loading}
            className="rounded-3xl bg-sky-500 px-3 py-2 text-xs font-semibold text-slate-950 transition hover:bg-sky-400 disabled:opacity-50"
          >
            Transform achievement
          </button>
        </div>
        <textarea
          rows={3}
          value={achievement}
          onChange={(event) => setAchievement(event.target.value)}
          placeholder="Enter a duty or responsibility statement to upgrade."
          className="w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-sky-500"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={handleGenerateCoverLetter}
          disabled={loading}
          className="rounded-3xl bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-700 disabled:opacity-50"
        >
          Generate cover letter
        </button>
        <button
          type="button"
          onClick={handleGenerateInterview}
          disabled={loading}
          className="rounded-3xl bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-700 disabled:opacity-50"
        >
          Generate interview prep
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={handleGenerateRoadmap}
          disabled={loading}
          className="rounded-3xl bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-700 disabled:opacity-50"
        >
          Generate roadmap
        </button>
        <button
          type="button"
          onClick={handleOptimizeLinkedIn}
          disabled={loading}
          className="rounded-3xl bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-700 disabled:opacity-50"
        >
          Optimize LinkedIn
        </button>
      </div>

      {coverLetter ? (
        <div className="rounded-3xl border border-slate-800 bg-slate-950/90 p-4 text-sm text-slate-200">
          <p className="font-semibold text-white">Cover letter</p>
          <pre className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-300">
            {coverLetter}
          </pre>
        </div>
      ) : null}

      {questions ? (
        <div className="rounded-3xl border border-slate-800 bg-slate-950/90 p-4 text-sm text-slate-200">
          <p className="font-semibold text-white">Interview questions</p>
          <div className="mt-3 space-y-3">
            <div>
              <p className="font-semibold text-slate-100">HR</p>
              <ul className="mt-2 list-disc space-y-2 pl-5">
                {questions.hr.map((question, index) => (
                  <li key={index}>{question}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-semibold text-slate-100">Technical</p>
              <ul className="mt-2 list-disc space-y-2 pl-5">
                {questions.technical.map((question, index) => (
                  <li key={index}>{question}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-semibold text-slate-100">Behavioral</p>
              <ul className="mt-2 list-disc space-y-2 pl-5">
                {questions.behavioral.map((question, index) => (
                  <li key={index}>{question}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : null}

      {roadmap.length ? (
        <div className="rounded-3xl border border-slate-800 bg-slate-950/90 p-4 text-sm text-slate-200">
          <p className="font-semibold text-white">Career roadmap</p>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            {roadmap.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {linkedin ? (
        <div className="rounded-3xl border border-slate-800 bg-slate-950/90 p-4 text-sm text-slate-200">
          <p className="font-semibold text-white">LinkedIn optimization</p>
          <p className="mt-3 text-sm text-slate-300">
            <strong>Headline:</strong> {linkedin.headline}
          </p>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            <strong>About:</strong> {linkedin.about}
          </p>
        </div>
      ) : null}
    </div>
  );
}
