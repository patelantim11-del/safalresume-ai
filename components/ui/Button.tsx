import { cn } from "@/lib/utils";
import * as React from "react";

const variants = {
  default:
    "bg-slate-900 text-white border border-white/8 hover:bg-slate-850 shadow-[0_6px_18px_-10px_rgba(2,6,23,0.6)]",
  primary:
    "bg-gradient-to-r from-[#2563EB] to-[#06B6D4] text-white shadow-md hover:opacity-95",
  destructive: "bg-rose-500 text-white shadow-sm hover:bg-rose-400",
  outline: "border border-white/10 text-white bg-transparent hover:bg-white/3",
  ghost: "bg-transparent text-white hover:bg-white/3",
  secondary:
    "bg-slate-800 text-slate-100 border border-white/8 hover:bg-slate-800/95",
};

const sizes = {
  default: "h-12 px-6 text-sm",
  sm: "h-10 px-4 text-sm",
  lg: "h-14 px-8 text-base",
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
