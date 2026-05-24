import { getUserFromRequest } from "@/lib/auth";
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
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const client = await getMongoClient();
    const db = client.db();
    const documentsCollection = db.collection(DOCUMENTS_COLLECTION);

    const document = await documentsCollection.findOne({
      _id: new ObjectId(id),
      userId: user._id || user.email,
    });

    await client.close();

    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(document);
  } catch (error) {
    console.error("Error fetching document:", error);
    return NextResponse.json(
      { error: "Failed to fetch document" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const client = await getMongoClient();
    const db = client.db();
    const documentsCollection = db.collection(DOCUMENTS_COLLECTION);

    const document = await documentsCollection.findOne({
      _id: new ObjectId(id),
      userId: user._id || user.email,
    });

    if (!document) {
      await client.close();
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 },
      );
    }

    const updateData = {
      ...body,
      updatedAt: new Date().toISOString(),
    };

    const result = await documentsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData },
    );

    await client.close();

    return NextResponse.json({
      message: "Document updated successfully",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Error updating document:", error);
    return NextResponse.json(
      { error: "Failed to update document" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const client = await getMongoClient();
    const db = client.db();
    const documentsCollection = db.collection(DOCUMENTS_COLLECTION);

    const result = await documentsCollection.deleteOne({
      _id: new ObjectId(id),
      userId: user._id || user.email,
    });

    await client.close();

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      message: "Document deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting document:", error);
    return NextResponse.json(
      { error: "Failed to delete document" },
      { status: 500 },
    );
  }
}
