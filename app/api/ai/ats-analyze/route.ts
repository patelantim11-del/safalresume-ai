import { analyzeResumeATS } from "@/lib/ai";
import { getUserFromRequest } from "@/lib/auth";
import { canUseATS } from "@/lib/subscription";
import { DOCUMENTS_COLLECTION } from "@/models/document";
import { MongoClient, ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";

async function getMongoClient(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set");
  const client = new MongoClient(uri);
  await client.connect();
  return client;
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!canUseATS(user)) {
      return NextResponse.json(
        { error: "ATS Analyzer is only available in Pro and Premium plans" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { documentId, resumeText } = body;

    if (!resumeText) {
      return NextResponse.json(
        { error: "Resume text is required" },
        { status: 400 },
      );
    }

    // Analyze ATS
    const analysis = await analyzeResumeATS(resumeText);

    // Update document with ATS score if documentId provided
    if (documentId) {
      try {
        const client = await getMongoClient();
        const db = client.db();
        const documentsCollection = db.collection(DOCUMENTS_COLLECTION);

        await documentsCollection.updateOne(
          {
            _id: new ObjectId(documentId),
            userId: user._id || user.email,
          },
          {
            $set: {
              atsScore: analysis.score,
              atsAnalysis: analysis,
              updatedAt: new Date().toISOString(),
            },
          },
        );

        await client.close();
      } catch (error) {
        console.error("Error updating document with ATS score:", error);
      }
    }

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Error analyzing ATS:", error);
    return NextResponse.json(
      { error: "Failed to analyze ATS" },
      { status: 500 },
    );
  }
}
