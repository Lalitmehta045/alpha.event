"use client";

import { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface BentoGridProps extends ComponentPropsWithoutRef<"div"> {
  children: ReactNode;
  className?: string;
}

interface SimpleBentoCardProps extends ComponentPropsWithoutRef<"div"> {
  title: string;
  description?: string;
  image: string;
  onClick?: () => void;
  className?: string;
}

const BentoGrid = ({ children, className, ...props }: BentoGridProps) => {
  return (
    <div
      className={cn(
        // Responsive grid layout
        "grid w-full gap-4",
        "grid-cols-2 lg:grid-cols-3",
        // Adjust row height for smaller screens
        "auto-rows-[14rem] sm:auto-rows-[16rem] md:auto-rows-[18rem] lg:auto-rows-[18rem]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

const BentoCard = ({
  title,
  description,
  image,
  onClick,
  className,
  ...props
}: SimpleBentoCardProps) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative w-full h-48 max-w-xs md:max-w-md lg:max-w-4xl sm:h-50 md:h-64 lg:h-72 overflow-hidden rounded-2xl bg-neutral-900 text-white transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl p-2 sm:p-3",
        "flex flex-col justify-end col-span-1",
        className
      )}
      {...props}
    >
      {/* Background Image */}
      <Image
        src={image}
        alt={title}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className="absolute inset-0 h-full w-full object-fill sm:object-cover transition-transform duration-500 group-hover:scale-110"
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/40 to-transparent" />

      {/* Content */}
      <div className="relative flex flex-col items-start justify-start z-10 p-0 sm:p-2 md:p-2">
        <h3 className="text-lg text-left sm:text-xl md:text-3xl font-semibold mb-2">
          {title}
        </h3>
        <p className="text-gray-200 text-left font-medium text-xs sm:text-sm md:text-base leading-snug">
          {description}
        </p>
      </div>
    </div>
  );
};

export { BentoCard, BentoGrid };
