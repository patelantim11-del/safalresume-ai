import { optimizeResume } from "@/lib/ai";
import { getUserFromRequest } from "@/lib/auth";
import { canUseATS } from "@/lib/subscription";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!canUseATS(user)) {
      return NextResponse.json(
        {
          error: "Resume optimizer is only available in Pro and Premium plans",
        },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { resumeText } = body;

    if (!resumeText) {
      return NextResponse.json(
        { error: "Resume text is required" },
        { status: 400 },
      );
    }

    const optimized = await optimizeResume(resumeText);

    return NextResponse.json({
      optimized,
      message: "Resume optimized successfully",
    });
  } catch (error) {
    console.error("Error optimizing resume:", error);
    return NextResponse.json(
      { error: "Failed to optimize resume" },
      { status: 500 },
    );
  }
}
