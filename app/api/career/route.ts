import { verifyToken } from "@/lib/auth";
import {
  compareKeywords,
  generateAchievement,
  generateCareerRoadmap,
  generateCoverLetter,
  generateInterviewQuestions,
  generateResumeScore,
  generateSummary,
  optimizeLinkedIn,
  parseJobDescription,
  recommendProjects,
  recommendTrendingSkills,
} from "@/lib/career";
import type { ResumeData } from "@/types";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("resume-auth")?.value;
    const payload = token ? verifyToken(token) : null;

    if (!payload) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 },
      );
    }

    const body = await request.json();
    const action = body.action as string;
    const resume = body.resume as ResumeData | undefined;

    if (!resume) {
      return NextResponse.json(
        { error: "Resume payload required." },
        { status: 400 },
      );
    }

    switch (action) {
      case "analyze": {
        const jdText = body.jobDescription || "";
        const score = generateResumeScore(resume, jdText);
        const jdData = jdText ? parseJobDescription(jdText) : null;
        return NextResponse.json(
          { score, jdData, recommendations: score.formattingIssues },
          { status: 200 },
        );
      }
      case "summary": {
        return NextResponse.json(
          { summary: generateSummary(resume) },
          { status: 200 },
        );
      }
      case "achievement": {
        const raw = String(body.achievementText || "");
        return NextResponse.json(
          { achievement: generateAchievement(raw) },
          { status: 200 },
        );
      }
      case "job-match": {
        const jdText = String(body.jobDescription || "");
        const parsed = parseJobDescription(jdText);
        const comparison = compareKeywords(resume, jdText);
        return NextResponse.json({ parsed, comparison }, { status: 200 });
      }
      case "cover-letter": {
        const role = String(
          body.jobTitle || resume.personalInfo.jobTitle || "Candidate",
        );
        const company = String(body.company || "Company");
        return NextResponse.json(
          {
            coverLetter: generateCoverLetter(
              resume,
              role,
              company,
              body.jobDescription,
            ),
          },
          { status: 200 },
        );
      }
      case "interview": {
        const jobTitle = String(
          body.jobTitle || resume.personalInfo.jobTitle || "Professional",
        );
        return NextResponse.json(
          { questions: generateInterviewQuestions(jobTitle) },
          { status: 200 },
        );
      }
      case "roadmap": {
        const jobTitle = String(
          body.jobTitle || resume.personalInfo.jobTitle || "Professional",
        );
        return NextResponse.json(
          { roadmap: generateCareerRoadmap(jobTitle) },
          { status: 200 },
        );
      }
      case "linkedin": {
        return NextResponse.json(
          { profile: optimizeLinkedIn(resume) },
          { status: 200 },
        );
      }
      case "skills": {
        const jobTitle = String(
          body.jobTitle || resume.personalInfo.jobTitle || "Professional",
        );
        return NextResponse.json(
          { skills: recommendTrendingSkills(jobTitle) },
          { status: 200 },
        );
      }
      case "projects": {
        const jobTitle = String(
          body.jobTitle || resume.personalInfo.jobTitle || "Professional",
        );
        return NextResponse.json(
          { projects: recommendProjects(jobTitle) },
          { status: 200 },
        );
      }
      default:
        return NextResponse.json({ error: "Unknown action." }, { status: 400 });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
