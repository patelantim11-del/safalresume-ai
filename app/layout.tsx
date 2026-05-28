import DashboardNav from "@/components/DashboardNav";
import { verifyToken } from "@/lib/auth";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "SafalResume AI",
  description:
    "AI Resume Builder, ATS Checker, Cover Letter Generator and Career Toolkit",
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const token = (await cookies()).get("resume-auth")?.value;
  const payload = token ? verifyToken(token) : null;

  return (
    <html lang="en">
      <body className="bg-gradient-to-br from-slate-900 via-slate-950 to-black text-white antialiased selection:bg-cyan-300/30 selection:text-white overflow-x-hidden">
        {payload ? (
          <div className="min-h-screen">
            <DashboardNav />
            <main className="md:ml-72 transition-all duration-200">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {children}
              </div>
            </main>
          </div>
        ) : (
          <main>{children}</main>
        )}
      </body>
    </html>
  );
}
