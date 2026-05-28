import * as React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "warning" | "destructive" | "muted";
}

const variants: Record<NonNullable<BadgeProps["variant"]>, string> = {
  default: "bg-slate-900 text-slate-100 border border-white/10",
  success: "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20",
  warning: "bg-amber-500/10 text-amber-300 border border-amber-500/20",
  destructive: "bg-rose-500/10 text-rose-300 border border-rose-500/20",
  muted: "bg-white/5 text-slate-300 border border-white/10",
};

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div className={cn("inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]", variants[variant], className)} {...props} />
  );
}
