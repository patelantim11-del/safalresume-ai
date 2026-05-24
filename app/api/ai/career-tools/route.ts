import {
  findTrendingSkills,
  generateCareerRoadmap,
  generateInterviewQuestions,
  recommendCertifications,
} from "@/lib/ai";
import { getUserFromRequest } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      action,
      currentRole,
      targetRole,
      experience,
      industryOrRole,
      skillGaps,
    } = body;

    if (!action) {
      return NextResponse.json(
        { error: "Action is required" },
        { status: 400 },
      );
    }

    let result;

    switch (action) {
      case "career-roadmap":
        if (!currentRole || !targetRole || !experience) {
          return NextResponse.json(
            { error: "currentRole, targetRole, and experience are required" },
            { status: 400 },
          );
        }
        result = await generateCareerRoadmap(
          currentRole,
          targetRole,
          experience,
        );
        break;

      case "interview-questions":
        if (!industryOrRole) {
          return NextResponse.json(
            { error: "industryOrRole is required" },
            { status: 400 },
          );
        }
        result = await generateInterviewQuestions(
          industryOrRole,
          body.jobDescription || "",
        );
        break;

      case "trending-skills":
        if (!industryOrRole) {
          return NextResponse.json(
            { error: "industryOrRole is required" },
            { status: 400 },
          );
        }
        result = await findTrendingSkills(industryOrRole);
        break;

      case "certifications":
        if (!skillGaps || !Array.isArray(skillGaps)) {
          return NextResponse.json(
            { error: "skillGaps array is required" },
            { status: 400 },
          );
        }
        result = await recommendCertifications(skillGaps);
        break;

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json({ result });
  } catch (error) {
    console.error("Error in career tools:", error);
    return NextResponse.json(
      { error: "Failed to process career tool request" },
      { status: 500 },
    );
  }
}
