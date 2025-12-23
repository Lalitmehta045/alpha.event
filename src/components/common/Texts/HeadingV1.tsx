"use client";

import React from "react";
import { cn } from "@/lib/utils"; // optional utility for merging Tailwind classes

interface HeadingV1Props {
  text: string;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl"; // optional prop to control size
  align?: "left" | "center" | "right" | "top" | "bottom"; // optional alignment
  color?: string; // optional for custom color
}

const HeadingV1: React.FC<HeadingV1Props> = ({
  text,
  className,
  size = "sm",
  align = "left",
  color = "text-white",
}) => {
  const sizeClasses = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl",
    xl: "text-4xl",
  };

  return (
    <h1
      className={cn(
        `text-2xl md:text-${size} font-bold ${color} text-${align}`,
        className
      )}
    >
      {text}
    </h1>
  );
};

export default HeadingV1;
