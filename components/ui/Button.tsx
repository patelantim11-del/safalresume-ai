import * as React from "react";
import { cn } from "@/lib/utils";

const variants = {
  default:
    "bg-slate-900 text-white border border-white/10 shadow-sm shadow-black/10 hover:bg-slate-800",
  primary:
    "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-cyan-500/20 hover:from-blue-400 hover:to-cyan-400",
  destructive:
    "bg-rose-500 text-white shadow-lg shadow-rose-500/20 hover:bg-rose-400",
  outline:
    "border border-white/10 text-white bg-transparent hover:bg-white/5",
  ghost:
    "bg-transparent text-white hover:bg-white/5",
  secondary:
    "bg-slate-800 text-slate-100 border border-white/10 hover:bg-slate-700",
};

const sizes = {
  default: "h-11 px-5 py-2 text-sm",
  sm: "h-9 px-3 text-sm",
  lg: "h-12 px-6 text-base",
};

type Variant = keyof typeof variants;
type Size = keyof typeof sizes;

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-2xl font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent disabled:pointer-events-none disabled:opacity-60",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}
