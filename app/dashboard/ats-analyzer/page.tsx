"use client";

import { Card } from "@/components/ui/Card";
import { AlertCircle, CheckCircle, Zap } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface ATSResult {
  score: number;
  missingKeywords: string[];
  formattingIssues: string[];
  suggestions: string[];
}

export default function ATSAnalyzerPage() {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [activeTab, setActiveTab] = useState<"analyze" | "match">("analyze");
  const [result, setResult] = useState<ATSResult | null>(null);
  const [matchResult, setMatchResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAnalyzeATS() {
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/ai/ats-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Failed to analyze ATS");
        return;
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError("An error occurred");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleJobMatch() {
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/ai/job-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobDescription, resumeContent: resumeText }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Failed to analyze job match");
        return;
      }

      const data = await response.json();
      setMatchResult(data);
    } catch (err) {
      setError("An error occurred");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-gray-800 to-black">
      {/* Header */}
      <div className="border-b border-white/10 bg-white/5 backdrop-blur-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                <Zap className="w-8 h-8 text-yellow-400" />
                ATS Analyzer & Job Matcher
              </h1>
              <p className="text-gray-400 mt-1">
                Optimize your resume and match job descriptions
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
        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-white/10">
          <button
            onClick={() => setActiveTab("analyze")}
            className={`px-4 py-3 font-medium transition-all border-b-2 ${
              activeTab === "analyze"
                ? "text-blue-400 border-blue-500"
                : "text-gray-400 border-transparent hover:text-gray-300"
            }`}
          >
            ATS Analysis
          </button>
          <button
            onClick={() => setActiveTab("match")}
            className={`px-4 py-3 font-medium transition-all border-b-2 ${
              activeTab === "match"
                ? "text-blue-400 border-blue-500"
                : "text-gray-400 border-transparent hover:text-gray-300"
            }`}
          >
            Job Description Matching
          </button>
        </div>

        {/* ATS Analysis Tab */}
        {activeTab === "analyze" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Input Section */}
            <div className="lg:col-span-2">
              <Card className="glassmorphism p-8">
                <h2 className="text-xl font-bold text-white mb-4">
                  Paste Your Resume
                </h2>
                <textarea
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste your full resume text here... (You can copy from Word or PDF)"
                  className="w-full h-96 px-4 py-3 bg-gray-900/50 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 font-mono text-sm"
                />

                {error && (
                  <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                <button
                  onClick={handleAnalyzeATS}
                  disabled={!resumeText || loading}
                  className="mt-6 w-full px-6 py-3 bg-linear-to-r from-yellow-500 to-orange-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-yellow-500/50 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Zap className="w-5 h-5" />
                  {loading ? "Analyzing..." : "Analyze ATS Score"}
                </button>
              </Card>
            </div>

            {/* Results Section */}
            <div>
              {result ? (
                <Card className="glassmorphism p-8 sticky top-24">
                  <h3 className="text-lg font-bold text-white mb-6">
                    ATS Analysis Results
                  </h3>

                  {/* Score */}
                  <div className="mb-6 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <p className="text-sm text-gray-400 mb-1">ATS Score</p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="w-full bg-gray-800 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full transition-all"
                            style={{ width: `${result.score}%` }}
                          ></div>
                        </div>
                      </div>
                      <span className="text-2xl font-bold text-blue-400">
                        {result.score}%
                      </span>
                    </div>
                  </div>

                  {/* Missing Keywords */}
                  {result.missingKeywords.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-red-400 mb-2 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        Missing Keywords
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {result.missingKeywords.slice(0, 5).map((kw, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-red-500/10 text-red-400 text-xs rounded"
                          >
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Suggestions */}
                  {result.suggestions.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-green-400 mb-2 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Suggestions
                      </h4>
                      <ul className="space-y-2 text-sm text-gray-300">
                        {result.suggestions.slice(0, 3).map((sugg, i) => (
                          <li key={i} className="flex gap-2">
                            <span className="text-green-400 mt-0.5">•</span>
                            <span>{sugg}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </Card>
              ) : (
                <Card className="glassmorphism p-8">
                  <p className="text-gray-400 text-center">
                    Enter your resume text and click analyze to get your ATS
                    score
                  </p>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Job Matching Tab */}
        {activeTab === "match" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Input Section */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="glassmorphism p-8">
                <h2 className="text-xl font-bold text-white mb-4">
                  Job Description
                </h2>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the job description here..."
                  className="w-full h-48 px-4 py-3 bg-gray-900/50 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 font-mono text-sm"
                />
              </Card>

              <Card className="glassmorphism p-8">
                <h2 className="text-xl font-bold text-white mb-4">
                  Your Resume
                </h2>
                <textarea
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste your resume here..."
                  className="w-full h-48 px-4 py-3 bg-gray-900/50 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 font-mono text-sm"
                />
              </Card>

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <button
                onClick={handleJobMatch}
                disabled={!resumeText || !jobDescription || loading}
                className="w-full px-6 py-3 bg-linear-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all disabled:opacity-50"
              >
                {loading ? "Analyzing..." : "Match with Job Description"}
              </button>
            </div>

            {/* Results */}
            <div>
              {matchResult ? (
                <Card className="glassmorphism p-8 sticky top-24">
                  <h3 className="text-lg font-bold text-white mb-6">
                    Match Analysis
                  </h3>

                  <div className="mb-6 p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                    <p className="text-sm text-gray-400 mb-1">Match %</p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="w-full bg-gray-800 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full transition-all"
                            style={{ width: `${matchResult.matchPercentage}%` }}
                          ></div>
                        </div>
                      </div>
                      <span className="text-2xl font-bold text-green-400">
                        {matchResult.matchPercentage}%
                      </span>
                    </div>
                  </div>

                  {matchResult.missingSkills &&
                    matchResult.missingSkills.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-semibold text-yellow-400 mb-2">
                          Missing Skills
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {matchResult.missingSkills
                            .slice(0, 5)
                            .map((skill: string, i: number) => (
                              <span
                                key={i}
                                className="px-2 py-1 bg-yellow-500/10 text-yellow-400 text-xs rounded"
                              >
                                {skill}
                              </span>
                            ))}
                        </div>
                      </div>
                    )}
                </Card>
              ) : (
                <Card className="glassmorphism p-8">
                  <p className="text-gray-400 text-center">
                    Fill in both fields and click analyze to see how well your
                    resume matches the job
                  </p>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
