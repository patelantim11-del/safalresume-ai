import { SUBSCRIPTION_PLANS } from "@/models/subscription";
import type { SubscriptionPlan, User } from "@/types";

export interface SubscriptionLimits {
  documentsPerMonth: number;
  maxDocuments: number;
  canUseATS: boolean;
  canGenerateCoverLetters: boolean;
  canAccessPortfolio: boolean;
  canPublishProfile: boolean;
  maxCoverLettersPerMonth: number;
  aiCreditsPerMonth: number;
  supportLevel: "email" | "priority" | "priority";
}

export function getSubscriptionLimits(
  plan: SubscriptionPlan,
): SubscriptionLimits {
  switch (plan) {
    case "free":
      return {
        documentsPerMonth: 2,
        maxDocuments: 2,
        canUseATS: false,
        canGenerateCoverLetters: false,
        canAccessPortfolio: false,
        canPublishProfile: false,
        maxCoverLettersPerMonth: 0,
        aiCreditsPerMonth: 0,
        supportLevel: "email",
      };

    case "pro":
      return {
        documentsPerMonth: 50,
        maxDocuments: 50,
        canUseATS: true,
        canGenerateCoverLetters: true,
        canAccessPortfolio: false,
        canPublishProfile: false,
        maxCoverLettersPerMonth: 10,
        aiCreditsPerMonth: 100,
        supportLevel: "priority",
      };

    case "premium":
      return {
        documentsPerMonth: -1, // unlimited
        maxDocuments: -1,
        canUseATS: true,
        canGenerateCoverLetters: true,
        canAccessPortfolio: true,
        canPublishProfile: true,
        maxCoverLettersPerMonth: -1,
        aiCreditsPerMonth: 200,
        supportLevel: "priority",
      };

    default:
      return {
        documentsPerMonth: 0,
        maxDocuments: 0,
        canUseATS: false,
        canGenerateCoverLetters: false,
        canAccessPortfolio: false,
        canPublishProfile: false,
        maxCoverLettersPerMonth: 0,
        aiCreditsPerMonth: 0,
        supportLevel: "email",
      };
  }
}

export function canCreateDocument(user: User): boolean {
  if (!user || user.subscription === "free") {
    return user.documentsCreated < 2;
  }

  const limits = getSubscriptionLimits(user.subscription);
  if (limits.maxDocuments === -1) return true;
  return user.documentsCreated < limits.maxDocuments;
}

export function canGenerateCoverLetter(user: User): boolean {
  const limits = getSubscriptionLimits(user.subscription);
  return limits.canGenerateCoverLetters;
}

export function canUseATS(user: User): boolean {
  const limits = getSubscriptionLimits(user.subscription);
  return limits.canUseATS;
}

export function canAccessPortfolio(user: User): boolean {
  const limits = getSubscriptionLimits(user.subscription);
  return limits.canAccessPortfolio;
}

export function canPublishProfile(user: User): boolean {
  const limits = getSubscriptionLimits(user.subscription);
  return limits.canPublishProfile;
}

export function getSubscriptionFeatures(plan: SubscriptionPlan): string[] {
  return SUBSCRIPTION_PLANS[plan].features;
}

export function getSubscriptionPrice(plan: SubscriptionPlan): number {
  return SUBSCRIPTION_PLANS[plan].price;
}

export function getSubscriptionName(plan: SubscriptionPlan): string {
  return SUBSCRIPTION_PLANS[plan].name;
}

export function calculateRazorpayAmount(
  plan: SubscriptionPlan,
  months: number = 1,
): number {
  const monthlyPrice = getSubscriptionPrice(plan);
  return monthlyPrice * months * 100; // Convert to paise
}

export function getSubscriptionPlan(plan: SubscriptionPlan) {
  return SUBSCRIPTION_PLANS[plan];
}

export function getPlanComparison() {
  return {
    free: SUBSCRIPTION_PLANS.free,
    pro: SUBSCRIPTION_PLANS.pro,
    premium: SUBSCRIPTION_PLANS.premium,
  };
}

export function recommendUpgrade(
  currentPlan: SubscriptionPlan,
  userAction: string,
): SubscriptionPlan | null {
  if (currentPlan === "premium") return null;

  if (userAction.includes("ats") || userAction.includes("cover_letter")) {
    return currentPlan === "free" ? "pro" : "premium";
  }

  if (
    userAction.includes("portfolio") ||
    userAction.includes("publish_profile")
  ) {
    return "premium";
  }

  return null;
}
