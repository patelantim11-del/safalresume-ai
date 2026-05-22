import { verifyToken } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { USERS_COLLECTION } from "@/models/user";
import { ObjectId } from "mongodb";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const token = (await cookies()).get("resume-auth")?.value;
  const payload = token ? verifyToken(token) : null;

  if (!payload) {
    redirect("/auth/login");
  }

  const client = await connectToDatabase();
  const db = client.db();
  const user = await db.collection(USERS_COLLECTION).findOne({
    _id: new ObjectId(payload.id),
  });

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <section className="mx-auto max-w-4xl px-6 py-16 sm:px-10">
      <div className="rounded-4xl border border-slate-800 bg-slate-900/90 p-10 shadow-2xl shadow-slate-950/40">
        <p className="text-sm uppercase tracking-[0.3em] text-sky-400">
          Profile
        </p>
        <h1 className="mt-4 text-4xl font-semibold text-white">
          Account details
        </h1>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-slate-800 bg-slate-950/90 p-6">
            <p className="text-sm text-slate-400">Name</p>
            <p className="mt-2 text-xl font-semibold text-white">
              {user.fullName}
            </p>
          </div>
          <div className="rounded-3xl border border-slate-800 bg-slate-950/90 p-6">
            <p className="text-sm text-slate-400">Email</p>
            <p className="mt-2 text-xl font-semibold text-white">
              {user.email}
            </p>
          </div>
          <div className="rounded-3xl border border-slate-800 bg-slate-950/90 p-6 md:col-span-2">
            <p className="text-sm text-slate-400">Joined</p>
            <p className="mt-2 text-xl font-semibold text-white">
              {new Date(user.createdAt).toLocaleDateString("en-IN", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
