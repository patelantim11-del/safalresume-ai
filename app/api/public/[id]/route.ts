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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const client = await getMongoClient();
    const db = client.db();
    const documentsCollection = db.collection(DOCUMENTS_COLLECTION);

    // Get document by public URL
    const document = await documentsCollection.findOne({
      publicUrl: id,
    });

    if (!document || document.status !== "published") {
      await client.close();
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 },
      );
    }

    // Increment view count
    await documentsCollection.updateOne(
      { _id: new ObjectId(document._id) },
      { $inc: { viewCount: 1 } },
    );

    await client.close();

    return NextResponse.json(document);
  } catch (error) {
    console.error("Error fetching public document:", error);
    return NextResponse.json(
      { error: "Failed to fetch document" },
      { status: 500 },
    );
  }
}
