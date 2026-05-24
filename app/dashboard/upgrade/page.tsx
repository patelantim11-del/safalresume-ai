"use client";

import { Card } from "@/components/ui/Card";
import { getSubscriptionPlan } from "@/lib/subscription";
import { ArrowRight, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const PLANS = ["free", "pro", "premium"] as const;

export default function UpgradePage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleUpgrade(plan: string) {
    setLoading(true);

    try {
      // Update subscription
      const response = await fetch("/api/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      if (response.ok) {
        // In a real app, redirect to Razorpay payment
        alert(
          "Subscription updated! (In production, this would redirect to payment)",
        );
        router.push("/dashboard");
      } else {
        alert("Failed to upgrade subscription");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-gray-800 to-black">
      {/* Header */}
      <div className="border-b border-white/10 bg-white/5 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link
            href="/dashboard"
            className="text-blue-400 hover:text-blue-300 mb-6 inline-block"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold text-white mb-3">
            Choose Your Plan
          </h1>
          <p className="text-gray-400 text-lg">
            Unlock premium features and supercharge your career growth
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PLANS.map((planName) => {
            const plan = getSubscriptionPlan(planName);
            const isPopular = planName === "pro";

            return (
              <Card
                key={planName}
                className={`glassmorphism p-8 relative ${
                  isPopular ? "border-blue-400/50 ring-2 ring-blue-400/20" : ""
                }`}
              >
                {isPopular && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <span className="bg-linear-to-r from-blue-500 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-white mb-2 capitalize">
                    {plan.name}
                  </h2>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-white">
                      ₹{plan.price}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-gray-400">/month</span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleUpgrade(planName)}
                  disabled={loading || planName === "free"}
                  className={`w-full py-3 rounded-lg font-semibold transition-all mb-8 flex items-center justify-center gap-2 ${
                    planName === "free"
                      ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                      : isPopular
                        ? "bg-linear-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg hover:shadow-blue-500/50"
                        : "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                  }`}
                >
                  {loading
                    ? "Processing..."
                    : planName === "free"
                      ? "Current Plan"
                      : "Upgrade"}
                  {planName !== "free" && !loading && (
                    <ArrowRight className="w-4 h-4" />
                  )}
                </button>

                <div className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Comparison Table */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-white mb-8">
            Feature Comparison
          </h2>
          <Card className="glassmorphism overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left px-6 py-4 text-white font-semibold">
                      Feature
                    </th>
                    <th className="text-center px-6 py-4 text-white font-semibold">
                      Free
                    </th>
                    <th className="text-center px-6 py-4 text-white font-semibold">
                      Pro
                    </th>
                    <th className="text-center px-6 py-4 text-white font-semibold">
                      Premium
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      feature: "Documents",
                      free: "2",
                      pro: "Unlimited",
                      premium: "Unlimited",
                    },
                    {
                      feature: "Templates",
                      free: "Basic",
                      pro: "Premium",
                      premium: "All",
                    },
                    {
                      feature: "ATS Analyzer",
                      free: "❌",
                      pro: "✅",
                      premium: "✅",
                    },
                    {
                      feature: "Cover Letters",
                      free: "❌",
                      pro: "10/month",
                      premium: "Unlimited",
                    },
                    {
                      feature: "LinkedIn Generator",
                      free: "❌",
                      pro: "❌",
                      premium: "✅",
                    },
                    {
                      feature: "Portfolio Hosting",
                      free: "❌",
                      pro: "❌",
                      premium: "✅",
                    },
                    {
                      feature: "Public Profile Links",
                      free: "❌",
                      pro: "❌",
                      premium: "✅",
                    },
                    {
                      feature: "Career Tools (7)",
                      free: "❌",
                      pro: "❌",
                      premium: "✅",
                    },
                    {
                      feature: "AI Credits/month",
                      free: "0",
                      pro: "100",
                      premium: "200",
                    },
                    {
                      feature: "Priority Support",
                      free: "❌",
                      pro: "✅",
                      premium: "✅",
                    },
                  ].map((row, i) => (
                    <tr
                      key={i}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-4 text-gray-300">{row.feature}</td>
                      <td className="px-6 py-4 text-center text-gray-400">
                        {row.free}
                      </td>
                      <td className="px-6 py-4 text-center text-blue-400">
                        {row.pro}
                      </td>
                      <td className="px-6 py-4 text-center text-purple-400">
                        {row.premium}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
