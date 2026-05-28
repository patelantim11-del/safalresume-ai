import * as React from "react";
import { cn } from "@/lib/utils";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
}

export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        "min-h-[140px] w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white shadow-sm shadow-black/10 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 placeholder:text-slate-500",
        className,
      )}
      {...props}
    />
  );
}
