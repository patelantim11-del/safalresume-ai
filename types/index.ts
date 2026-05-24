// ============================================
// DOCUMENT TYPES & TEMPLATES
// ============================================

export const documentTypes = [
  "job_resume",
  "marriage_biodata",
  "student_cv",
  "internship_resume",
  "freelancer_profile",
  "business_profile",
  "academic_cv",
  "government_resume",
  "portfolio",
  "personal_profile",
  "teacher_profile",
  "doctor_profile",
  "lawyer_profile",
  "artist_profile",
  "custom_profile",
] as const;

export type DocumentType = (typeof documentTypes)[number];

export const resumeTemplates = [
  "ats",
  "corporate",
  "executive",
  "modern",
  "fresher",
  "professional",
  "minimal",
] as const;

export type ResumeTemplate = (typeof resumeTemplates)[number];

export const biodataTemplates = [
  "traditional",
  "modern",
  "premium",
  "elegant",
] as const;
export type BiodataTemplate = (typeof biodataTemplates)[number];

export const portfolioTemplates = [
  "minimal",
  "creative",
  "professional",
  "modern",
] as const;
export type PortfolioTemplate = (typeof portfolioTemplates)[number];

export const documentStatuses = ["draft", "completed", "published"] as const;
export type DocumentStatus = (typeof documentStatuses)[number];

// ============================================
// COMMON DATA STRUCTURES
// ============================================

export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  jobTitle: string;
  website: string;
  linkedin?: string;
  github?: string;
  photoUrl?: string;
  summary: string;
}

export interface ExperienceItem {
  id: string;
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface EducationItem {
  id: string;
  school: string;
  degree: string;
  field: string;
  location: string;
  startDate: string;
  endDate: string;
}

export interface SkillItem {
  id: string;
  name: string;
  level: "Beginner" | "Intermediate" | "Advanced" | "Expert";
}

export interface ProjectItem {
  id: string;
  name: string;
  description: string;
  link: string;
}

export interface SocialLink {
  id: string;
  label: string;
  url: string;
}

export interface ValueItem {
  id: string;
  value: string;
}

// ============================================
// DOCUMENT-SPECIFIC CONTENT TYPES
// ============================================

export interface JobResumeContent {
  type: "job_resume";
  personalInfo: PersonalInfo;
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: SkillItem[];
  projects: ProjectItem[];
  certifications: ValueItem[];
  achievements: ValueItem[];
  languages: ValueItem[];
  socialLinks: SocialLink[];
}

export interface BiodataContent {
  type: "marriage_biodata";
  fullName: string;
  gender: string;
  age: number;
  height: string;
  education: string;
  occupation: string;
  income: string;
  religion: string;
  community: string;
  familyDetails: string;
  address: string;
  hobbies: string[];
  phone: string;
  email: string;
  photoUrl?: string;
}

export interface StudentCVContent {
  type: "student_cv";
  personalInfo: PersonalInfo;
  education: EducationItem[];
  projects: ProjectItem[];
  certifications: ValueItem[];
  achievements: ValueItem[];
  competitions: ValueItem[];
  activities: ValueItem[];
  skills: SkillItem[];
}

export interface FreelancerProfileContent {
  type: "freelancer_profile";
  fullName: string;
  title: string;
  bio: string;
  skills: SkillItem[];
  portfolio: ProjectItem[];
  gigDescription: string;
  rates: string;
  platforms: ("fiverr" | "upwork" | "freelancer")[];
  email: string;
  phone: string;
  photoUrl?: string;
}

export interface BusinessProfileContent {
  type: "business_profile";
  companyName: string;
  founderName: string;
  businessType: string;
  vision: string;
  mission: string;
  services: string[];
  overview: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  logoUrl?: string;
  employees: number;
  foundedYear: number;
}

export interface PortfolioContent {
  type: "portfolio";
  personalInfo: PersonalInfo;
  about: string;
  skills: SkillItem[];
  projects: ProjectItem[];
  experience: ExperienceItem[];
  testimonials: Array<{
    id: string;
    author: string;
    text: string;
    role: string;
  }>;
  contact: SocialLink[];
}

export interface CustomProfileContent {
  [key: string]: unknown;
}

export type DocumentContent =
  | JobResumeContent
  | BiodataContent
  | StudentCVContent
  | FreelancerProfileContent
  | BusinessProfileContent
  | PortfolioContent
  | CustomProfileContent;

// ============================================
// UNIFIED DOCUMENT MODEL
// ============================================

export interface Document {
  _id?: string;
  userId: string;
  type: DocumentType;
  title: string;
  template: string;
  status: DocumentStatus;
  content: DocumentContent;
  atsScore?: number;
  atsAnalysis?: {
    score: number;
    missingKeywords: string[];
    formattingIssues: string[];
    suggestions: string[];
  };
  jobDescriptionAnalysis?: {
    matchPercentage: number;
    missingSkills: string[];
    missingKeywords: string[];
    suggestedChanges: string[];
  };
  publicUrl?: string;
  viewCount: number;
  shares: number;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// LEGACY TYPES (For backward compatibility)
// ============================================

export interface ResumeData {
  id?: string;
  userId: string;
  title: string;
  template: ResumeTemplate;
  personalInfo: PersonalInfo;
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: SkillItem[];
  projects: ProjectItem[];
  certifications: ValueItem[];
  achievements: ValueItem[];
  languages: ValueItem[];
  socialLinks: SocialLink[];
  createdAt: string;
  updatedAt: string;
}

// ============================================
// USER & SUBSCRIPTION
// ============================================

export const subscriptionPlans = ["free", "pro", "premium"] as const;
export type SubscriptionPlan = (typeof subscriptionPlans)[number];

export interface Subscription {
  _id?: string;
  userId: string;
  plan: SubscriptionPlan;
  status: "active" | "cancelled" | "expired";
  currentPeriodStart: string;
  currentPeriodEnd: string;
  razorpaySubscriptionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  _id?: string;
  fullName: string;
  email: string;
  passwordHash: string;
  username?: string;
  profileUrl?: string;
  bio?: string;
  photoUrl?: string;
  subscription: SubscriptionPlan;
  subscriptionStatus: "active" | "cancelled" | "expired";
  aiCredits: number;
  documentsCreated: number;
  coverLettersGenerated: number;
  profileViews: number;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// PAYMENT & BILLING
// ============================================

export interface PaymentRecord {
  _id?: string;
  userId: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  amount: number;
  currency: string;
  status: string;
  plan: SubscriptionPlan;
  createdAt: string;
}

// ============================================
// BLOG & CONTENT
// ============================================

export const blogCategories = [
  "resume_tips",
  "interview_tips",
  "career_growth",
  "ats_guide",
  "freelancing",
  "student_career",
] as const;

export type BlogCategory = (typeof blogCategories)[number];

export interface BlogPost {
  _id?: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category: BlogCategory;
  author: string;
  featured: boolean;
  image?: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];
  createdAt: string;
  updatedAt: string;
  views: number;
}

// ============================================
// ANALYTICS & STATS
// ============================================

export interface DocumentStats {
  totalDocuments: number;
  documentsByType: Record<DocumentType, number>;
  averageAtsScore: number;
  averageCreatedPerUser: number;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  usersByPlan: Record<SubscriptionPlan, number>;
}

export interface AnalyticsData {
  date: string;
  documentsCreated: number;
  resumesOptimized: number;
  coverLettersGenerated: number;
  usersSignedUp: number;
}
