"use client";

import { Button } from "@/components/ui/Button";
import {
  FileText,
  Home,
  Layers,
  LogOut,
  Menu,
  Settings,
  Sparkles,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/dashboard/documents", label: "Documents", icon: FileText },
  { href: "/dashboard/ats-analyzer", label: "ATS Analyzer", icon: Sparkles },
  { href: "/dashboard/career-tools", label: "Career Tools", icon: Layers },
  { href: "/dashboard/profile", label: "Profile", icon: Settings },
];

function NavLink({
  href,
  label,
  Icon,
  onClick,
  active,
}: {
  href: string;
  label: string;
  Icon: typeof Home;
  onClick?: () => void;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
        active
          ? "bg-cyan-500/12 text-white ring-1 ring-cyan-400/15 shadow-sm"
          : "text-slate-200 hover:bg-white/5 hover:text-white"
      }`}
    >
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
          active ? "bg-cyan-500/15 text-cyan-300" : "bg-white/5 text-cyan-300"
        }`}
      >
        <Icon className="h-4 w-4" />
      </div>
      <span>{label}</span>
    </Link>
  );
}

export default function DashboardNav() {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/auth/login");
  }

  return (
    <>
      <aside className="hidden md:flex fixed inset-y-0 left-0 z-50 w-72 flex-col bg-slate-950/90 border-r border-white/10 shadow-[0_35px_65px_-30px_rgba(0,0,0,0.45)] backdrop-blur-3xl">
        <div className="flex h-full flex-col justify-between p-6">
          <div className="space-y-8">
            <div className="space-y-3">
              <Link href="/dashboard" className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-cyan-400/10 text-cyan-300 text-xl font-bold shadow-sm shadow-cyan-500/10">
                  S
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                    SafalResume
                  </p>
                  <p className="text-xl font-semibold text-white">AI Studio</p>
                </div>
              </Link>
            </div>

            <nav className="space-y-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  Icon={item.icon}
                  active={pathname?.startsWith(item.href)}
                />
              ))}
            </nav>
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-5 shadow-xl shadow-black/10 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-[0.28em] text-cyan-300/70">
                Upgrade
              </p>
              <p className="mt-3 text-sm font-semibold text-white">
                Unlock premium templates and unlimited AI boosts.
              </p>
              <div className="mt-4 grid gap-2">
                <div className="rounded-2xl bg-white/5 px-3 py-2 text-xs text-slate-300">
                  Pro plan active
                </div>
                <Button
                  variant="primary"
                  onClick={() => router.push("/dashboard/upgrade")}
                >
                  Upgrade
                </Button>
              </div>
            </div>

            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full"
              disabled={isLoggingOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              {isLoggingOut ? "Signing out..." : "Logout"}
            </Button>
          </div>
        </div>
      </aside>

      <div className="md:hidden border-b border-slate-800 bg-slate-950/95 px-4 py-4 shadow-sm shadow-black/20 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/70">
              SafalResume
            </p>
            <p className="text-lg font-semibold text-white">AI Studio</p>
          </div>
          <button
            type="button"
            onClick={() => setMobileOpen((current) => !current)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-3xl border border-slate-700 bg-slate-900 text-slate-200 transition hover:bg-slate-800"
            aria-label="Toggle navigation"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>

        {mobileOpen ? (
          <div className="mt-4 space-y-3 rounded-3xl border border-white/10 bg-slate-950/95 p-4 shadow-sm shadow-black/20">
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                label={item.label}
                Icon={item.icon}
                onClick={() => setMobileOpen(false)}
              />
            ))}
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                handleLogout();
              }}
              className="flex w-full items-center justify-center gap-2 rounded-3xl border border-white/10 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-300 transition hover:bg-rose-500/20"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        ) : null}
      </div>
    </>
  );
}
