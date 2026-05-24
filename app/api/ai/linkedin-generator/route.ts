import { generateLinkedInProfile } from "@/lib/ai";
import { getUserFromRequest } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { resumeContent } = body;

    if (!resumeContent) {
      return NextResponse.json(
        { error: "Resume content is required" },
        { status: 400 },
      );
    }

    const result = await generateLinkedInProfile(resumeContent);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error generating LinkedIn profile:", error);
    return NextResponse.json(
      { error: "Failed to generate LinkedIn profile" },
      { status: 500 },
    );
  }
}
