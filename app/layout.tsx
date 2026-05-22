import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import DashboardNav from "@/components/DashboardNav";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

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
      <body>
        {payload ? <DashboardNav /> : null}
        {children}
      </body>
    </html>
  );
}
