"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = "", ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-[1.75rem] border border-white/10 bg-white/5 shadow-[0_20px_80px_-40px_rgba(0,0,0,0.4)] backdrop-blur-3xl",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
