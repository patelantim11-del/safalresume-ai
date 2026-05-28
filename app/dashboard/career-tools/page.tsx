"use client";

import { Card } from "@/components/ui/Card";
import { Award, Compass, HelpCircle, TrendingUp, Zap } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function CareerToolsPage() {
  const [activeTools, setActiveTools] = useState<Record<string, boolean>>({});
  const [results, setResults] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});

  const tools = [
    {
      id: "career-roadmap",
      title: "Career Roadmap Generator",
      description: "Create a personalized career growth path",
      icon: <Compass className="w-6 h-6" />,
      color: "from-blue-500 to-cyan-600",
      inputs: [
        {
          key: "currentRole",
          label: "Current Role",
          placeholder: "e.g., Junior Developer",
        },
        {
          key: "targetRole",
          label: "Target Role",
          placeholder: "e.g., Senior Architect",
        },
        {
          key: "experience",
          label: "Current Experience",
          placeholder: "Describe your experience",
        },
      ],
    },
    {
      id: "interview-questions",
      title: "Interview Question Generator",
      description: "Get role-specific interview preparation",
      icon: <HelpCircle className="w-6 h-6" />,
      color: "from-purple-500 to-pink-600",
      inputs: [
        {
          key: "industryOrRole",
          label: "Job Title",
          placeholder: "e.g., Product Manager",
        },
        {
          key: "jobDescription",
          label: "Job Description (Optional)",
          placeholder: "Paste job description",
        },
      ],
    },
    {
      id: "trending-skills",
      title: "Trending Skills Finder",
      description: "Discover in-demand skills for your field",
      icon: <TrendingUp className="w-6 h-6" />,
      color: "from-green-500 to-emerald-600",
      inputs: [
        {
          key: "industryOrRole",
          label: "Industry/Role",
          placeholder: "e.g., Data Science",
        },
      ],
    },
    {
      id: "certifications",
      title: "Certification Recommender",
      description: "Get recommended certifications for growth",
      icon: <Award className="w-6 h-6" />,
      color: "from-orange-500 to-red-600",
      inputs: [
        {
          key: "skillGaps",
          label: "Skill Gaps (comma separated)",
          placeholder: "e.g., AWS, Kubernetes, Docker",
        },
      ],
    },
  ];

  async function handleToolSubmit(toolId: string) {
    setLoading(true);

    try {
      let requestData: any = { action: toolId };

      if (toolId === "certifications") {
        const skillGaps =
          formData[`${toolId}-skillGaps`]?.split(",").map((s) => s.trim()) ||
          [];
        requestData.skillGaps = skillGaps;
      } else {
        const tool = tools.find((t) => t.id === toolId);
        tool?.inputs.forEach((input) => {
          const value = formData[`${toolId}-${input.key}`];
          if (value) requestData[input.key] = value;
        });
      }

      const response = await fetch("/api/ai/career-tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        const data = await response.json();
        setResults({ ...results, [toolId]: data.result });
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Header */}
      <div className="border-b border-white/10 bg-white/5 backdrop-blur-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                <Zap className="w-8 h-8 text-green-400" />
                AI Career Tools
              </h1>
              <p className="text-gray-400 mt-1">
                Accelerate your career growth with AI-powered insights
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
        <div className="space-y-8">
          {tools.map((tool) => (
            <Card key={tool.id} className="glassmorphism p-8">
              <div className="flex items-start gap-6">
                {/* Icon */}
                <div
                  className={`w-16 h-16 rounded-lg bg-gradient-to-br ${tool.color} p-4 shrink-0 flex items-center justify-center text-white`}
                >
                  {tool.icon}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {tool.title}
                  </h2>
                  <p className="text-gray-400 mb-6">{tool.description}</p>

                  {/* Toggle Tool */}
                  <button
                    onClick={() =>
                      setActiveTools({
                        ...activeTools,
                        [tool.id]: !activeTools[tool.id],
                      })
                    }
                    className="text-blue-400 hover:text-blue-300 font-medium transition-all"
                  >
                    {activeTools[tool.id] ? "Hide" : "Show"} Form
                  </button>

                  {/* Form */}
                  {activeTools[tool.id] && (
                    <div className="mt-6 pt-6 border-t border-white/10 space-y-4">
                      {tool.inputs.map((input) => (
                        <div key={input.key}>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            {input.label}
                          </label>
                          <input
                            type="text"
                            placeholder={input.placeholder}
                            value={formData[`${tool.id}-${input.key}`] || ""}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                [`${tool.id}-${input.key}`]: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2 bg-gray-900/50 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50"
                          />
                        </div>
                      ))}

                      <button
                        onClick={() => handleToolSubmit(tool.id)}
                        disabled={loading}
                        className="w-full mt-4 px-6 py-3 bg-linear-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all disabled:opacity-50"
                      >
                        {loading ? "Analyzing..." : "Get Results"}
                      </button>
                    </div>
                  )}

                  {/* Results */}
                  {results[tool.id] && (
                    <div className="mt-6 pt-6 border-t border-white/10">
                      <h3 className="font-semibold text-white mb-4">
                        Results:
                      </h3>
                      <div className="bg-gray-900/50 p-4 rounded-lg max-h-96 overflow-y-auto">
                        {typeof results[tool.id] === "string" ? (
                          <p className="text-gray-300 whitespace-pre-wrap text-sm leading-relaxed">
                            {results[tool.id]}
                          </p>
                        ) : Array.isArray(results[tool.id]) ? (
                          <ul className="space-y-2">
                            {results[tool.id].map((item: any, i: number) => (
                              <li key={i} className="text-gray-300 flex gap-2">
                                <span className="text-blue-400 shrink-0">
                                  •
                                </span>
                                <span className="text-sm">
                                  {typeof item === "string"
                                    ? item
                                    : JSON.stringify(item)}
                                </span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <pre className="text-gray-300 text-sm overflow-auto">
                            {JSON.stringify(results[tool.id], null, 2)}
                          </pre>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
