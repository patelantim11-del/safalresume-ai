import { authOptions } from "@/lib/nextauth";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getServerSession(authOptions as any);

  if (!session) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <main>{children}</main>
    </div>
  );
}
