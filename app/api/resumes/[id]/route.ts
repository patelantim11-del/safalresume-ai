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
});

function normalizeResume(resume: any) {
  return {
    ...resume,
    id: resume._id?.toString(),
    _id: undefined,
    createdAt: resume.createdAt ?? resume.updatedAt,
  };
}

export async function GET(request: NextRequest, context: any) {
  const { params } = context as { params: { id: string } };
  const user = await getUserFromRequest(request);

  if (!user) {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 },
    );
  }

  if (!ObjectId.isValid(params.id)) {
    return NextResponse.json({ error: "Invalid resume ID." }, { status: 400 });
  }

  const client = await connectToDatabase();
  const db = client.db();
  const resume = await db.collection(RESUMES_COLLECTION).findOne({
    _id: new ObjectId(params.id),
    userId: user._id,
  });

  if (!resume) {
    return NextResponse.json({ error: "Resume not found." }, { status: 404 });
  }

  return NextResponse.json(
    { resume: normalizeResume(resume) },
    { status: 200 },
  );
}

export async function PATCH(request: NextRequest, context: any) {
  const { params } = context as { params: { id: string } };
  const user = await getUserFromRequest(request);

  if (!user) {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 },
    );
  }

  if (!ObjectId.isValid(params.id)) {
    return NextResponse.json({ error: "Invalid resume ID." }, { status: 400 });
  }

  const body = await request.json();
  const parsed = resumeSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
  }

  const client = await connectToDatabase();
  const db = client.db();
  const existing = await db.collection(RESUMES_COLLECTION).findOne({
    _id: new ObjectId(params.id),
    userId: user._id,
  });

  if (!existing) {
    return NextResponse.json({ error: "Resume not found." }, { status: 404 });
  }

  const now = new Date().toISOString();
  const updatePayload = {
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
    createdAt: existing.createdAt ?? now,
  };

  await db
    .collection(RESUMES_COLLECTION)
    .updateOne(
      { _id: new ObjectId(params.id), userId: user._id },
      { $set: updatePayload },
    );

  return NextResponse.json(
    {
      resume: {
        ...updatePayload,
        id: params.id,
      },
    },
    { status: 200 },
  );
}

export async function DELETE(request: NextRequest, context: any) {
  const { params } = context as { params: { id: string } };
  const user = await getUserFromRequest(request);

  if (!user) {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 },
    );
  }

  if (!ObjectId.isValid(params.id)) {
    return NextResponse.json({ error: "Invalid resume ID." }, { status: 400 });
  }

  const client = await connectToDatabase();
  const db = client.db();
  const result = await db.collection(RESUMES_COLLECTION).deleteOne({
    _id: new ObjectId(params.id),
    userId: user._id,
  });

  if (result.deletedCount === 0) {
    return NextResponse.json({ error: "Resume not found." }, { status: 404 });
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
