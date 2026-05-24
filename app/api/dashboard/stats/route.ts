import { getUserFromRequest } from "@/lib/auth";
import { DOCUMENTS_COLLECTION } from "@/models/document";
import { MongoClient } from "mongodb";
import { NextRequest, NextResponse } from "next/server";

async function getMongoClient(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set");
  const client = new MongoClient(uri);
  await client.connect();
  return client;
}

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await getMongoClient();
    const db = client.db();
    const documentsCollection = db.collection(DOCUMENTS_COLLECTION);

    const documents = await documentsCollection
      .find({ userId: user._id || user.email })
      .toArray();

    const atsScores = documents
      .filter((d: any) => d.atsScore)
      .map((d: any) => d.atsScore);

    const averageAtsScore =
      atsScores.length > 0
        ? atsScores.reduce((a: number, b: number) => a + b, 0) /
          atsScores.length
        : 0;

    // Generate sample chart data for the last 7 days
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split("T")[0];
    });

    const documentsData = last7Days.map((date) => ({
      date,
      count: Math.floor(Math.random() * 5),
    }));

    const atsScoresData = last7Days.map((date) => ({
      date,
      score: Math.floor(Math.random() * 40 + 60),
    }));

    await client.close();

    return NextResponse.json({
      totalDocuments: documents.length,
      averageAtsScore,
      aiCreditsRemaining: user.aiCredits,
      coverLettersGenerated: user.coverLettersGenerated,
      profileViews: user.profileViews,
      documentsData,
      atsScoresData,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 },
    );
  }
}
