import { getUserFromRequest } from "@/lib/auth";
import { DOCUMENTS_COLLECTION } from "@/models/document";
import { MongoClient } from "mongodb";
import { NextRequest, NextResponse } from "next/server";

// Get MongoDB client
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
      .sort({ createdAt: -1 })
      .toArray();

    await client.close();

    return NextResponse.json({
      documents,
      count: documents.length,
    });
  } catch (error) {
    console.error("Error fetching documents:", error);
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { type, title, template, content } = body;

    if (!type || !title || !template || !content) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const client = await getMongoClient();
    const db = client.db();
    const documentsCollection = db.collection(DOCUMENTS_COLLECTION);

    const newDocument = {
      userId: user._id || user.email,
      type,
      title,
      template,
      content,
      status: "draft",
      atsScore: 0,
      viewCount: 0,
      shares: 0,
      versions: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const result = await documentsCollection.insertOne(newDocument);

    await client.close();

    return NextResponse.json(
      {
        _id: result.insertedId,
        ...newDocument,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating document:", error);
    return NextResponse.json(
      { error: "Failed to create document" },
      { status: 500 },
    );
  }
}
