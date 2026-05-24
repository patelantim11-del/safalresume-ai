import { generateCoverLetter } from "@/lib/ai";
import { getUserFromRequest } from "@/lib/auth";
import { canGenerateCoverLetter } from "@/lib/subscription";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!canGenerateCoverLetter(user)) {
      return NextResponse.json(
        {
          error:
            "Cover letter generation is only available in Pro and Premium plans",
        },
        { status: 403 },
      );
    }

    const body = await request.json();
    const {
      jobDescription,
      resumeContent,
      candidateType = "experienced",
    } = body;

    if (!jobDescription || !resumeContent) {
      return NextResponse.json(
        { error: "Job description and resume content are required" },
        { status: 400 },
      );
    }

    const result = await generateCoverLetter(
      jobDescription,
      resumeContent,
      candidateType as
        | "fresher"
        | "experienced"
        | "internship"
        | "career_change",
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error generating cover letter:", error);
    return NextResponse.json(
      { error: "Failed to generate cover letter" },
      { status: 500 },
    );
  }
}
