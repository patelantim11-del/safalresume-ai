import { getUserFromRequest } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { RESUMES_COLLECTION } from "@/models/resume";
import { resumeTemplates } from "@/types";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";

const resumeSchema = z.object({
  title: z.string().min(3),
  template: z.enum(resumeTemplates),
  personalInfo: z.object({
    fullName: z.string().min(2),
    email: z.string().email(),
    phone: z.string().min(8),
    location: z.string().min(2),
    jobTitle: z.string().min(2),
    website: z.string().optional().or(z.literal("")),
    linkedin: z.string().optional().or(z.literal("")),
    github: z.string().optional().or(z.literal("")),
    photoUrl: z.string().optional().or(z.literal("")),
    summary: z.string().optional().or(z.literal("")),
  }),
  experience: z.array(
    z.object({
      id: z.string(),
      company: z.string(),
      position: z.string(),
      location: z.string(),
      startDate: z.string(),
      endDate: z.string(),
      current: z.boolean(),
      description: z.string(),
    }),
  ),
  education: z.array(
    z.object({
      id: z.string(),
      school: z.string(),
      degree: z.string(),
      field: z.string(),
      location: z.string(),
      startDate: z.string(),
      endDate: z.string(),
    }),
  ),
  skills: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      level: z.enum(["Beginner", "Intermediate", "Advanced", "Expert"]),
    }),
  ),
  projects: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      description: z.string(),
      link: z.string().optional().or(z.literal("")),
    }),
  ),
  certifications: z.array(
    z.object({
      id: z.string(),
      value: z.string(),
    }),
  ),
  achievements: z.array(
    z.object({
      id: z.string(),
      value: z.string(),
    }),
  ),
  languages: z.array(
    z.object({
      id: z.string(),
      value: z.string(),
    }),
  ),
  interests: z
    .array(
      z.object({
        id: z.string(),
        value: z.string(),
      }),
    )
    .optional()
    .default([]),
  socialLinks: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      url: z.string().optional().or(z.literal("")),
    }),
  ),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  id: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 },
      );
    }

    const url = new URL(request.url);
    const search = url.searchParams.get("search")?.trim() || "";
    const page = Math.max(parseInt(url.searchParams.get("page") || "1", 10), 1);
    const limit = Math.min(
      Math.max(parseInt(url.searchParams.get("limit") || "10", 10), 1),
      50,
    );

    const filter: Record<string, unknown> = { userId: user._id };

    if (search) {
      filter.title = { $regex: search, $options: "i" };
    }

    const client = await connectToDatabase();
    const db = client.db();

    const total = await db
      .collection(RESUMES_COLLECTION)
      .countDocuments(filter);
    const resumes = await db
      .collection(RESUMES_COLLECTION)
      .find(filter)
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    const normalized = resumes.map((resume) => ({
      ...resume,
      id: resume._id?.toString(),
      _id: undefined,
      createdAt: resume.createdAt ?? resume.updatedAt,
    }));

    return NextResponse.json(
      {
        resumes: normalized,
        total,
        page,
        limit,
        pages: Math.max(1, Math.ceil(total / limit)),
      },
      { status: 200 },
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack : "";
    console.error("[resumes:GET] Error:", {
      message: msg,
      stack,
      name: (err as any)?.name,
      code: (err as any)?.code,
    });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 },
      );
    }

    const body = await request.json();
    const parsed = resumeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.format() },
        { status: 400 },
      );
    }

    const client = await connectToDatabase();
    const db = client.db();
    const now = new Date().toISOString();

    const resumePayload = {
      userId: user._id,
      title: parsed.data.title,
      template: parsed.data.template,
      personalInfo: parsed.data.personalInfo,
      experience: parsed.data.experience,
      education: parsed.data.education,
      skills: parsed.data.skills,
      projects: parsed.data.projects,
      certifications: parsed.data.certifications,
      achievements: parsed.data.achievements,
      languages: parsed.data.languages,
      interests: parsed.data.interests,
      socialLinks: parsed.data.socialLinks,
      updatedAt: now,
    };

    if (parsed.data.id) {
      const existingResume = await db.collection(RESUMES_COLLECTION).findOne({
        _id: new ObjectId(parsed.data.id),
        userId: user._id,
      });

      if (!existingResume) {
        return NextResponse.json(
          { error: "Resume not found." },
          { status: 404 },
        );
      }

      const updatedPayload = {
        ...resumePayload,
        createdAt: existingResume.createdAt ?? now,
      };

      await db
        .collection(RESUMES_COLLECTION)
        .updateOne(
          { _id: new ObjectId(parsed.data.id), userId: user._id },
          { $set: updatedPayload },
        );

      return NextResponse.json(
        {
          resume: {
            ...updatedPayload,
            id: parsed.data.id,
          },
        },
        { status: 200 },
      );
    }

    const result = await db.collection(RESUMES_COLLECTION).insertOne({
      ...resumePayload,
      userId: user._id,
      createdAt: now,
    });

    return NextResponse.json(
      {
        resume: {
          ...resumePayload,
          createdAt: now,
          id: result.insertedId.toString(),
        },
      },
      { status: 201 },
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
