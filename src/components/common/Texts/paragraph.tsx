"use client";

import React from "react";
import { cn } from "@/lib/utils"; // optional for class merging

interface ParagraphV1Props {
  text: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  color?: string; // optional for custom color
}

const ParagraphV1: React.FC<ParagraphV1Props> = ({
  text,
  className,
  size = "md",
  color = "text-gray-600",
}) => {
  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  return (
    <p
      className={cn(
        `text-md md:text-${size} font-medium ${color} leading-relaxed`,
        className
      )}
    >
      {text}
    </p>
  );
};

export default ParagraphV1;
