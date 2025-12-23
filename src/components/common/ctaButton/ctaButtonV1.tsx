"use client";

import React from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { VariantProps } from "class-variance-authority";

interface CTAButtonV1Props extends VariantProps<typeof buttonVariants> {
  type?: "button" | "submit" | "reset";
  text: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  href?: string;
  className?: string;
}

const CTAButtonV1: React.FC<CTAButtonV1Props> = ({
  type = "button",
  text,
  icon,
  onClick,
  href,
  className,
  variant = "outline",
}) => {
  const baseClasses =
    "rounded-lg transition-all duration-300 flex items-center gap-2 cursor-pointer";

  const variantClasses =
    variant === "outline"
      ? "bg-(--cta-Bg1) hover:bg-gray-300 text-black border border-black"
      : "bg-(--cta-Bg) hover:bg-(--cta-Bg-hover) text-white font-semibold";

  // ✅ Link Button
  if (href) {
    return (
      <Button
        type={type}
        variant={variant}
        asChild
        className={cn("px-6 py-3", baseClasses, variantClasses, className)}
      >
        <Link href={href} className="w-full">
          {text}
          {icon && <span className="ml-2">{icon}</span>}
        </Link>
      </Button>
    );
  }

  // ✅ Normal Button
  return (
    <Button
      type={type}
      variant={variant}
      onClick={onClick}
      className={cn("px-6 py-3", baseClasses, variantClasses, className)}
    >
      {text}
      {icon && <span className="ml-1">{icon}</span>}
    </Button>
  );
};

export default CTAButtonV1;
