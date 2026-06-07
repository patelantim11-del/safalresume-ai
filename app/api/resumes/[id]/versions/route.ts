import { getUserFromRequest } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { RESUMES_COLLECTION } from "@/models/resume";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: NextRequest, context: any) {
  const { params } = context as { params: { id: string } };
  const user = await getUserFromRequest(request);
  if (!user)
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 },
    );
  if (!ObjectId.isValid(params.id))
    return NextResponse.json({ error: "Invalid resume ID." }, { status: 400 });

  const client = await connectToDatabase();
  const db = client.db();
  const resume = await db
    .collection(RESUMES_COLLECTION)
    .findOne({ _id: new ObjectId(params.id), userId: user._id });
  if (!resume)
    return NextResponse.json({ error: "Resume not found." }, { status: 404 });

  const versions = Array.isArray(resume.versions) ? resume.versions : [];
  return NextResponse.json({ versions }, { status: 200 });
}

export async function POST(request: NextRequest, context: any) {
  // restore a version
  const { params } = context as { params: { id: string } };
  const user = await getUserFromRequest(request);
  if (!user)
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 },
    );
  if (!ObjectId.isValid(params.id))
    return NextResponse.json({ error: "Invalid resume ID." }, { status: 400 });

  const body = await request.json().catch(() => ({}));
  const { versionId } = body as { versionId?: string };

  const client = await connectToDatabase();
  const db = client.db();
  const resume = await db
    .collection(RESUMES_COLLECTION)
    .findOne({ _id: new ObjectId(params.id), userId: user._id });
  if (!resume)
    return NextResponse.json({ error: "Resume not found." }, { status: 404 });

  const versions = Array.isArray(resume.versions) ? resume.versions : [];
  const version = versionId
    ? versions.find(
        (v: any) =>
          v.id === versionId ||
          v._id === versionId ||
          String(v.id) === String(versionId),
      )
    : null;
  if (!version)
    return NextResponse.json({ error: "Version not found." }, { status: 404 });

  const now = new Date().toISOString();
  const updatePayload = {
    title: version.content?.title ?? resume.title,
    template: version.content?.template ?? resume.template,
    personalInfo: version.content?.personalInfo ?? resume.personalInfo,
    experience: version.content?.experience ?? resume.experience,
    education: version.content?.education ?? resume.education,
    skills: version.content?.skills ?? resume.skills,
    projects: version.content?.projects ?? resume.projects,
    certifications: version.content?.certifications ?? resume.certifications,
    achievements: version.content?.achievements ?? resume.achievements,
    languages: version.content?.languages ?? resume.languages,
    socialLinks: version.content?.socialLinks ?? resume.socialLinks,
    updatedAt: now,
    createdAt: resume.createdAt ?? now,
  };

  await db
    .collection(RESUMES_COLLECTION)
    .updateOne(
      { _id: new ObjectId(params.id), userId: user._id },
      { $set: updatePayload },
    );

  return NextResponse.json(
    { resume: { ...updatePayload, id: params.id } },
    { status: 200 },
  );
}
