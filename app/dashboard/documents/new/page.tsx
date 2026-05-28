"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { DocumentType, documentTypes } from "@/types";
import { ArrowLeft, FileText, Save } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const DOCUMENT_TYPE_TEMPLATES: Record<DocumentType, string[]> = {
  job_resume: ["ats", "modern", "professional"],
  marriage_biodata: ["traditional", "modern", "premium"],
  student_cv: ["modern", "professional", "minimal"],
  internship_resume: ["fresher", "modern", "professional"],
  fresher_resume: ["fresher", "modern", "professional"],
  professional_resume: ["professional", "modern", "executive"],
  ats_resume: ["ats", "corporate", "modern"],
  cover_letter: ["classic", "modern", "professional"],
  statement_of_purpose: ["academic", "modern", "professional"],
  letter_of_recommendation: ["formal", "modern", "academic"],
  freelancer_profile: ["modern", "creative", "professional"],
  business_profile: ["professional", "modern", "premium"],
  academic_cv: ["professional", "academic", "modern"],
  government_resume: ["traditional", "professional", "modern"],
  portfolio: ["creative", "minimal", "modern"],
  personal_profile: ["modern", "creative", "minimal"],
  teacher_profile: ["professional", "academic", "modern"],
  doctor_profile: ["professional", "medical", "modern"],
  lawyer_profile: ["professional", "traditional", "modern"],
  artist_profile: ["creative", "modern", "minimal"],
  custom_profile: ["blank", "minimal", "modern"],
};

export default function NewDocumentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const typeParam = searchParams.get("type") as DocumentType | null;

  const [selectedType, setSelectedType] = useState<DocumentType | null>(
    typeParam,
  );
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [documentTitle, setDocumentTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (selectedType && DOCUMENT_TYPE_TEMPLATES[selectedType]) {
      setSelectedTemplate(DOCUMENT_TYPE_TEMPLATES[selectedType][0]);
    }
  }, [selectedType]);

  async function handleCreateDocument() {
    setError("");
    setLoading(true);

    if (!selectedType || !selectedTemplate || !documentTitle) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: selectedType,
          title: documentTitle,
          template: selectedTemplate,
          content: getDefaultContent(selectedType),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Failed to create document");
        setLoading(false);
        return;
      }

      const newDoc = await response.json();
      router.push(`/dashboard/documents/${newDoc._id}`);
    } catch (err) {
      setError("An error occurred while creating the document");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const step = selectedType ? (selectedTemplate ? 2 : 1) : 0;
  const stepLabels = ["Choose type", "Pick template", "Finalize details"];

  if (!selectedType) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-black text-white">
        <div className="border-b border-white/10 bg-slate-950/95 backdrop-blur-3xl">
          <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/70">
                  New document
                </p>
                <h1 className="text-3xl font-semibold">Select document type</h1>
                <p className="text-slate-400">
                  Pick the profile you want to start with and build it using our
                  smart editor.
                </p>
              </div>
              <Link
                href="/dashboard"
                className="rounded-2xl border border-white/10 bg-slate-900/80 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-900"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {documentTypes.map((type) => (
              <Card
                key={type}
                className="group cursor-pointer border-white/10 bg-slate-950/80 p-6 transition-all hover:-translate-y-1 hover:border-cyan-400/30 hover:bg-slate-900"
                onClick={() => setSelectedType(type)}
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-3xl bg-white/5 text-cyan-300 transition group-hover:bg-cyan-400/15">
                  <FileText className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-white capitalize">
                  {type.replace(/_/g, " ")}
                </h3>
                <p className="text-sm leading-6 text-slate-400">
                  Choose this layout to start a modern, premium document.
                </p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-black text-white">
      <div className="border-b border-white/10 bg-slate-950/95 backdrop-blur-3xl">
        <div className="max-w-5xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <button
            onClick={() => setSelectedType(null)}
            className="mb-5 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 transition hover:bg-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Change type
          </button>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/70">
                Create document
              </p>
              <h1 className="text-3xl font-semibold">
                New {selectedType.replace(/_/g, " ")}
              </h1>
              <p className="text-slate-400">
                Finalize the title and template before building your profile.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {stepLabels.map((label, index) => (
                <span
                  key={label}
                  className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] transition ${
                    index === step - 1
                      ? "bg-cyan-500 text-slate-950"
                      : "bg-white/5 text-slate-300"
                  }`}
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="p-6">
            <div className="space-y-6">
              <div className="space-y-3">
                <h2 className="text-xl font-semibold text-white">
                  Step {step + 1}
                </h2>
                <p className="text-sm text-slate-400">
                  {step === 1
                    ? "Pick the template that best matches your career story."
                    : "Give your document a memorable title and confirm the template."}
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Document type
                  </label>
                  <div className="rounded-3xl border border-white/10 bg-slate-950/75 px-4 py-4 text-sm text-slate-200">
                    {selectedType.replace(/_/g, " ")}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Template
                  </label>
                  <div className="grid gap-3 md:grid-cols-3">
                    {DOCUMENT_TYPE_TEMPLATES[selectedType].map((template) => (
                      <button
                        key={template}
                        onClick={() => setSelectedTemplate(template)}
                        className={`rounded-3xl border px-4 py-4 text-left text-sm transition ${
                          selectedTemplate === template
                            ? "border-cyan-400 bg-cyan-500/10 text-white"
                            : "border-white/10 bg-slate-950/75 text-slate-300 hover:border-white/20"
                        }`}
                      >
                        <p className="font-semibold capitalize">{template}</p>
                        <p className="mt-1 text-xs text-slate-400">
                          Modern layout with premium spacing.
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Profile title
                  </label>
                  <Input
                    placeholder="E.g. Senior Product Designer Resume"
                    value={documentTitle}
                    onChange={(event) => setDocumentTitle(event.target.value)}
                  />
                </div>

                {error ? (
                  <div className="rounded-3xl bg-rose-500/10 p-4 text-sm text-rose-300">
                    {error}
                  </div>
                ) : null}

                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    onClick={handleCreateDocument}
                    disabled={loading}
                    variant="primary"
                    size="sm"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {loading ? "Creating..." : "Create document"}
                  </Button>
                  <Link
                    href="/dashboard/documents"
                    className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
                  >
                    Skip for now
                  </Link>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="space-y-5">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/70">
                  Quick preview
                </p>
                <h2 className="mt-2 text-xl font-semibold text-white">
                  Build your document
                </h2>
              </div>
              <div className="rounded-[1.5rem] bg-slate-950/80 p-5 text-sm text-slate-300">
                <p className="mb-3 font-semibold text-white">
                  Selected template
                </p>
                <p>{selectedTemplate || "No template selected yet."}</p>
              </div>
              <div className="rounded-[1.5rem] bg-slate-950/80 p-5 text-sm text-slate-300">
                <p className="mb-3 font-semibold text-white">What to expect</p>
                <ul className="space-y-3">
                  <li>
                    • A guided wizard experience for easy document creation.
                  </li>
                  <li>• Clean modern spacing and sectioned layout.</li>
                  <li>• Premium preview and version history support.</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function getDefaultContent(type: DocumentType) {
  const baseContent = {
    fullName: "Your Name",
    email: "your.email@example.com",
    phone: "+1 (555) 000-0000",
    location: "City, State",
    photoUrl: "",
  };

  switch (type) {
    case "job_resume":
    case "internship_resume":
      return {
        type,
        ...baseContent,
        jobTitle: "Job Title",
        website: "",
        summary: "Professional summary here...",
        experience: [],
        education: [],
        skills: [],
        projects: [],
        certifications: [],
        achievements: [],
        languages: [],
        socialLinks: [],
      };

    case "marriage_biodata":
      return {
        type,
        fullName: "Your Name",
        gender: "Male",
        age: 25,
        height: "5'10\"",
        education: "Bachelor's Degree",
        occupation: "Your Profession",
        income: "Annual Income",
        religion: "Religion",
        community: "Community",
        familyDetails: "Family details...",
        address: "Your Address",
        hobbies: [],
        phone: "+1 (555) 000-0000",
        email: "your.email@example.com",
      };

    case "fresher_resume":
      return {
        type,
        personalInfo: {
          fullName: "Your Name",
          email: "your.email@example.com",
          phone: "+1 (555) 000-0000",
          location: "City, State",
          jobTitle: "Aspiring Intern",
          website: "",
          linkedin: "",
          github: "",
          photoUrl: "",
          summary: "A motivated fresher looking for internship opportunities.",
        },
        careerObjective:
          "Seeking a challenging internship to apply academic knowledge and develop skills.",
        education: [
          {
            id: "edu-0",
            school: "University Name",
            degree: "B.Sc.",
            field: "Computer Science",
            location: "City",
            startDate: "2022-08",
            endDate: "2025-05",
            grade: "8.5 CGPA",
          },
        ],
        skills: [{ id: "skill-0", name: "Python" }],
        academicProjects: [
          {
            id: "proj-0",
            name: "Project Title",
            description: "Project description.",
            link: "",
          },
        ],
        internships: [],
        certifications: [],
        achievements: [],
        languages: [],
        contactInfo: {
          phone: "+1 (555) 000-0000",
          email: "your.email@example.com",
          linkedin: "",
          github: "",
          location: "City, State",
        },
      };

    case "professional_resume":
    case "job_resume":
      return {
        type,
        personalInfo: {
          fullName: "Your Name",
          email: "your.email@example.com",
          phone: "+1 (555) 000-0000",
          location: "City, State",
          jobTitle: "Professional Title",
          website: "",
          linkedin: "",
          github: "",
          photoUrl: "",
          summary:
            "Experienced professional delivering measurable business results.",
        },
        experience: [],
        education: [],
        skills: [],
        projects: [],
        certifications: [],
        achievements: [],
        languages: [],
        socialLinks: [],
      };

    case "ats_resume":
      return {
        type,
        personalInfo: {
          fullName: "Your Name",
          email: "your.email@example.com",
          phone: "+1 (555) 000-0000",
          location: "City, State",
          jobTitle: "ATS-Optimized Resume",
          website: "",
          linkedin: "",
          github: "",
          photoUrl: "",
          summary: "An ATS-ready resume built around keywords and clarity.",
        },
        experience: [],
        education: [],
        skills: [],
        projects: [],
        certifications: [],
        achievements: [],
        languages: [],
        socialLinks: [],
        keywords: [],
      };

    case "cover_letter":
      return {
        type,
        recipientName: "Hiring Manager",
        companyName: "Company Name",
        position: "Position Title",
        senderName: "Your Name",
        senderTitle: "Your Current Title",
        senderEmail: "your.email@example.com",
        senderPhone: "+1 (555) 000-0000",
        introduction: "I am writing to express my interest in the role.",
        body: "I bring strong experience and passion that align with your needs.",
        closing: "Thank you for your time and consideration.",
        date: new Date().toISOString().split("T")[0],
        template: "classic",
      };

    case "statement_of_purpose":
      return {
        type,
        applicantName: "Your Name",
        programName: "Program Name",
        universityName: "University Name",
        currentBackground: "Your academic background and achievements.",
        motivation: "Why you want to join the program.",
        strengths: "Your strengths and qualifications.",
        longTermGoals: "Your academic and career goals.",
        whyThisProgram: "Why this program is the best fit for you.",
        template: "academic",
      };

    case "letter_of_recommendation":
      return {
        type,
        recommenderName: "Recommender Name",
        recommenderTitle: "Recommender Title",
        recommenderInstitution: "Institution Name",
        relationship: "Relationship with candidate",
        recommendFor: "What the recommendation is for",
        strengths: "Candidate strengths and skills.",
        examples: "Real achievements and examples.",
        closing: "I strongly recommend them for this opportunity.",
        date: new Date().toISOString().split("T")[0],
        template: "formal",
      };

    case "portfolio":
      return {
        type,
        ...baseContent,
        jobTitle: "Your Title",
        about: "About you...",
        skills: [],
        projects: [],
        experience: [],
        testimonials: [],
        contact: [],
      };

    default:
      return { type, ...baseContent };
  }
}
