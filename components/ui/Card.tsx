"use client";

import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = "", ...props }: CardProps) {
  return (
    <div
      className={`rounded-lg border border-white/10 bg-white/5 backdrop-blur-lg ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
