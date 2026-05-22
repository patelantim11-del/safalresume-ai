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

export interface User {
  _id?: string;
  fullName: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

export interface PaymentRecord {
  _id?: string;
  userId: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
}
