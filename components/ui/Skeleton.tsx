import * as React from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div className={cn("animate-pulse rounded-3xl bg-slate-800/70", className)} />
  );
}
