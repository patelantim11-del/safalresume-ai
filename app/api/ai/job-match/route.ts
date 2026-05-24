import { analyzeJobDescriptionMatch } from "@/lib/ai";
import { getUserFromRequest } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { jobDescription, resumeContent } = body;

    if (!jobDescription || !resumeContent) {
      return NextResponse.json(
        { error: "Job description and resume content are required" },
        { status: 400 },
      );
    }

    const result = await analyzeJobDescriptionMatch(
      jobDescription,
      resumeContent,
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error analyzing job match:", error);
    return NextResponse.json(
      { error: "Failed to analyze job description match" },
      { status: 500 },
    );
  }
}
