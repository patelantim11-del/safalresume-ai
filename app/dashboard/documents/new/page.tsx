"use client";

import { Card } from "@/components/ui/Card";
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

  if (!selectedType) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-900 via-gray-800 to-black">
        {/* Header */}
        <div className="border-b border-white/10 bg-white/5 backdrop-blur-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-6"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-white">
              Select Document Type
            </h1>
            <p className="text-gray-400 mt-1">
              Choose what profile you want to create
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documentTypes.map((type) => (
              <Card
                key={type}
                className="glassmorphism p-6 cursor-pointer hover:border-blue-400/50 transition-all"
                onClick={() => setSelectedType(type)}
              >
                <FileText className="w-8 h-8 text-blue-400 mb-3" />
                <h3 className="font-semibold text-white mb-2 capitalize">
                  {type.replace(/_/g, " ")}
                </h3>
                <p className="text-sm text-gray-400">
                  Click to select and customize
                </p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-gray-800 to-black">
      {/* Header */}
      <div className="border-b border-white/10 bg-white/5 backdrop-blur-lg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => setSelectedType(null)}
            className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Change Type
          </button>
          <h1 className="text-3xl font-bold text-white">
            Create New {selectedType.replace(/_/g, " ")}
          </h1>
          <p className="text-gray-400 mt-1">
            Customize your profile with the details below
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="glassmorphism p-8">
          <div className="space-y-6">
            {/* Title Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Profile Title
              </label>
              <input
                type="text"
                value={documentTitle}
                onChange={(e) => setDocumentTitle(e.target.value)}
                placeholder="e.g., My Professional Resume"
                className="w-full px-4 py-3 bg-gray-900/50 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50"
              />
            </div>

            {/* Template Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Template
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {selectedType &&
                  DOCUMENT_TYPE_TEMPLATES[selectedType].map((template) => (
                    <button
                      key={template}
                      onClick={() => setSelectedTemplate(template)}
                      className={`p-4 rounded-lg border-2 transition-all font-medium capitalize ${
                        selectedTemplate === template
                          ? "bg-blue-500/20 border-blue-500 text-blue-400"
                          : "bg-gray-900/50 border-white/10 text-gray-400 hover:border-white/20"
                      }`}
                    >
                      {template}
                    </button>
                  ))}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-4 pt-4">
              <button
                onClick={handleCreateDocument}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-linear-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                {loading ? "Creating..." : "Create Profile"}
              </button>
              <Link
                href="/dashboard"
                className="px-6 py-3 bg-gray-900/50 hover:bg-gray-900 text-gray-300 font-semibold rounded-lg transition-all border border-white/10"
              >
                Cancel
              </Link>
            </div>
          </div>
        </Card>
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
