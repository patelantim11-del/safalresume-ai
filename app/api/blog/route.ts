import { getUserFromRequest } from "@/lib/auth";
import { BLOG_COLLECTION } from "@/models/blog";
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
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = parseInt(searchParams.get("skip") || "0");

    const client = await getMongoClient();
    const db = client.db();
    const blogCollection = db.collection(BLOG_COLLECTION);

    const query: any = {};
    if (category) query.category = category;

    const posts = await blogCollection
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const total = await blogCollection.countDocuments(query);

    await client.close();

    return NextResponse.json({
      posts,
      total,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch blog posts" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      slug,
      content,
      excerpt,
      category,
      featured,
      image,
      seoTitle,
      seoDescription,
      seoKeywords,
    } = body;

    if (!title || !slug || !content) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const client = await getMongoClient();
    const db = client.db();
    const blogCollection = db.collection(BLOG_COLLECTION);

    const newPost = {
      title,
      slug,
      content,
      excerpt,
      category: category || "general",
      author: user.fullName,
      featured: featured || false,
      image,
      seoTitle: seoTitle || title,
      seoDescription: seoDescription || excerpt,
      seoKeywords: seoKeywords || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      views: 0,
    };

    const result = await blogCollection.insertOne(newPost);

    await client.close();

    return NextResponse.json(
      {
        _id: result.insertedId,
        ...newPost,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating blog post:", error);
    return NextResponse.json(
      { error: "Failed to create blog post" },
      { status: 500 },
    );
  }
}
