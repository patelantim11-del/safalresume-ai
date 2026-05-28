"use client";

import { cn } from "@/lib/utils";
import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = "", ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-[1.75rem] border border-white/10 bg-white/5 shadow-[0_35px_120px_-50px_rgba(15,23,42,0.35)] backdrop-blur-3xl",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
