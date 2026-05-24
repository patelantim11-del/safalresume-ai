import type { Subscription, SubscriptionPlan } from "@/types";

export const SUBSCRIPTIONS_COLLECTION = "subscriptions";
export type SubscriptionModel = Subscription;

export const SUBSCRIPTION_PLANS: Record<
  SubscriptionPlan,
  {
    name: string;
    price: number;
    documentsLimit: number;
    features: string[];
  }
> = {
  free: {
    name: "Free",
    price: 0,
    documentsLimit: 2,
    features: ["2 documents per month", "Basic templates", "PDF export"],
  },
  pro: {
    name: "Pro",
    price: 499,
    documentsLimit: 50,
    features: [
      "Unlimited documents",
      "ATS Analyzer",
      "Cover Letters (10/month)",
      "Premium Templates",
      "AI Optimization",
      "Job Description Matching",
      "Resume Duplication",
    ],
  },
  premium: {
    name: "Premium",
    price: 999,
    documentsLimit: -1,
    features: [
      "Everything in Pro",
      "Portfolio Hosting",
      "Public Profile Links",
      "Advanced Analytics",
      "LinkedIn Generator",
      "Career Tools (All 7)",
      "Priority Support",
      "AI Credits (200/month)",
      "Cover Letters (Unlimited)",
    ],
  },
};

export const getSubscriptionPlan = (plan: SubscriptionPlan) =>
  SUBSCRIPTION_PLANS[plan];
export const getSubscriptionPrice = (plan: SubscriptionPlan) =>
  SUBSCRIPTION_PLANS[plan].price;
