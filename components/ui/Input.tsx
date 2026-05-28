import { cn } from "@/lib/utils";
import * as React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "w-full rounded-xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white shadow-sm outline-none transition duration-150 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 placeholder:text-slate-500",
        className,
      )}
      {...props}
    />
  );
}
