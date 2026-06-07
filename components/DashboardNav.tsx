"use client";

import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  Home,
  Layers,
  LogOut,
  Menu,
  Settings,
  Sparkles,
  X,
} from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const navSections = [
  {
    label: "Workspace",
    items: [
      { href: "/dashboard", label: "Home", icon: Home },
      { href: "/dashboard/documents", label: "Documents", icon: FileText },
    ],
  },
  {
    label: "Tools",
    items: [
      {
        href: "/dashboard/ats-analyzer",
        label: "ATS Analyzer",
        icon: Sparkles,
      },
      { href: "/toolkit", label: "Career Toolkit", icon: Layers },
    ],
  },
  {
    label: "Settings",
    items: [{ href: "/dashboard/profile", label: "Profile", icon: Settings }],
  },
];

function NavLink({
  href,
  label,
  Icon,
  onClick,
  active,
  compact,
}: {
  href: string;
  label: string;
  Icon: typeof Home;
  onClick?: () => void;
  active?: boolean;
  compact?: boolean;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      title={label}
      className={`group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold transition-all duration-200 ${
        active
          ? "bg-cyan-500/15 text-white ring-1 ring-cyan-400/20 shadow-sm"
          : "text-slate-300 hover:bg-white/5 hover:text-white"
      }`}
    >
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-2xl transition ${
          active
            ? "bg-cyan-500/15 text-cyan-300"
            : "bg-white/5 text-cyan-300 group-hover:bg-cyan-500/10"
        }`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <span className={`${compact ? "sr-only" : "truncate"}`}>{label}</span>
    </Link>
  );
}

export default function DashboardNav() {
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [actionMenuOpen, setActionMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--sidebar-width",
      collapsed ? "5.5rem" : "18rem",
    );
  }, [collapsed]);

  async function handleLogout() {
    setIsLoggingOut(true);
    await signOut({ callbackUrl: "/auth/login" });
  }

  const renderNav = (compact?: boolean) => (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-4 py-5">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60 rounded-3xl"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-cyan-400/10 text-cyan-300 text-xl font-bold shadow-sm shadow-cyan-500/10">
            S
          </div>
          {!compact ? (
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                SafalResume
              </p>
              <p className="text-xl font-semibold text-white">AI Studio</p>
            </div>
          ) : null}
        </Link>

        <button
          type="button"
          onClick={() => setCollapsed((value) => !value)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-slate-900/95 text-slate-200 transition hover:bg-slate-800"
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-6">
        {navSections.map((section) => (
          <div key={section.label} className="mt-6">
            {!compact ? (
              <p className="mb-3 px-3 text-xs uppercase tracking-[0.28em] text-slate-500">
                {section.label}
              </p>
            ) : null}
            <div className="space-y-2">
              {section.items.map((item) => (
                <NavLink
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  Icon={item.icon}
                  active={pathname?.startsWith(item.href)}
                  compact={compact}
                  onClick={() => setMobileOpen(false)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10 px-3 pb-5 pt-5">
        {compact ? (
          <div className="grid gap-3">
            <button
              type="button"
              onClick={() => router.push("/dashboard/upgrade")}
              className="inline-flex h-11 w-full items-center justify-center rounded-2xl bg-white/5 text-slate-200 transition hover:bg-white/10"
              title="Upgrade plan"
            >
              <Sparkles className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => setActionMenuOpen(true)}
              className="inline-flex h-11 w-full items-center justify-center rounded-2xl bg-white/5 text-slate-200 transition hover:bg-white/10"
              title="More actions"
            >
              <Settings className="h-5 w-5" />
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-5 shadow-xl shadow-black/10 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-[0.28em] text-cyan-300/70">
                Upgrade
              </p>
              <p className="mt-3 text-sm text-slate-300">
                Unlock premium templates and faster AI output.
              </p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => router.push("/dashboard/upgrade")}
                className="mt-4 w-full"
              >
                Upgrade
              </Button>
            </div>
            <Button
              onClick={() => setActionMenuOpen(true)}
              variant="outline"
              className="w-full"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Account actions
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 88 : 288 }}
        transition={{ type: "spring", stiffness: 260, damping: 30 }}
        className="hidden md:flex fixed inset-y-0 left-0 z-50 overflow-hidden border-r border-white/10 bg-slate-950/95 shadow-[0_35px_65px_-30px_rgba(0,0,0,0.6)] backdrop-blur-xl"
      >
        {renderNav(collapsed)}
      </motion.aside>

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
      </div>

      <AnimatePresence>
        {mobileOpen ? (
          <motion.div
            className="fixed inset-0 z-50 flex md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              type="button"
              className="absolute inset-0 bg-slate-950/80"
              onClick={() => setMobileOpen(false)}
              aria-label="Close navigation"
            />
            <motion.div
              className="relative flex h-full w-[84%] max-w-sm flex-col bg-slate-950/95 border-r border-white/10 shadow-2xl backdrop-blur-xl"
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "spring", stiffness: 260, damping: 30 }}
            >
              {renderNav(false)}
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <Modal
        open={actionMenuOpen}
        title="Quick actions"
        description="Access account and upgrade tools without cluttering the workspace."
        onClose={() => setActionMenuOpen(false)}
      >
        <div className="grid gap-3">
          <Button
            variant="primary"
            onClick={() => {
              setActionMenuOpen(false);
              router.push("/dashboard/upgrade");
            }}
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Upgrade plan
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              setActionMenuOpen(false);
              router.push("/dashboard/profile");
            }}
          >
            <Settings className="mr-2 h-4 w-4" />
            Profile settings
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setActionMenuOpen(false);
              handleLogout();
            }}
            disabled={isLoggingOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            {isLoggingOut ? "Signing out..." : "Logout"}
          </Button>
        </div>
      </Modal>
    </>
  );
}
