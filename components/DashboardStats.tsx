"use client";

import { Card } from "@/components/ui/Card";
import { User } from "@/types";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface DashboardStats {
  totalDocuments: number;
  averageAtsScore: number;
  aiCreditsRemaining: number;
  coverLettersGenerated: number;
  profileViews: number;
  documentsData: Array<{ date: string; count: number }>;
  atsScoresData: Array<{ date: string; score: number }>;
}

interface DashboardStatsProps {
  user: User;
}

export function DashboardStats({ user }: DashboardStatsProps) {
  const [stats, setStats] = useState<DashboardStats>({
    totalDocuments: 0,
    averageAtsScore: 0,
    aiCreditsRemaining: user.aiCredits,
    coverLettersGenerated: user.coverLettersGenerated,
    profileViews: user.profileViews,
    documentsData: [],
    atsScoresData: [],
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      const response = await fetch("/api/dashboard/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="text-center p-8">Loading stats...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="glassmorphism">
          <div className="p-6">
            <p className="text-gray-400 text-sm mb-2">Total Documents</p>
            <p className="text-3xl font-bold text-white">
              {stats.totalDocuments}
            </p>
          </div>
        </Card>

        <Card className="glassmorphism">
          <div className="p-6">
            <p className="text-gray-400 text-sm mb-2">Average ATS Score</p>
            <p className="text-3xl font-bold text-green-400">
              {stats.averageAtsScore.toFixed(0)}%
            </p>
          </div>
        </Card>

        <Card className="glassmorphism">
          <div className="p-6">
            <p className="text-gray-400 text-sm mb-2">AI Credits</p>
            <p className="text-3xl font-bold text-blue-400">
              {stats.aiCreditsRemaining}
            </p>
          </div>
        </Card>

        <Card className="glassmorphism">
          <div className="p-6">
            <p className="text-gray-400 text-sm mb-2">Cover Letters</p>
            <p className="text-3xl font-bold text-purple-400">
              {stats.coverLettersGenerated}
            </p>
          </div>
        </Card>

        <Card className="glassmorphism">
          <div className="p-6">
            <p className="text-gray-400 text-sm mb-2">Profile Views</p>
            <p className="text-3xl font-bold text-pink-400">
              {stats.profileViews}
            </p>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glassmorphism">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Documents Created
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.documentsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="date" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1a2e",
                    border: "1px solid #444",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Documents"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="glassmorphism">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              ATS Score Improvement
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.atsScoresData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="date" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1a2e",
                    border: "1px solid #444",
                  }}
                />
                <Legend />
                <Bar dataKey="score" fill="#3b82f6" name="ATS Score" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
