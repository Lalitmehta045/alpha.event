"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store/store";
import Image from "next/image";

const slides = [
  {
    id: 1,
    badge: "RENTALS",
    categoryName: "Rentals",
    title: "Premium rentals, zero hassle",
    description: "Furniture, props & essentials delivered on time",
    glowColor: "radial-gradient(circle at 80% 20%, rgba(212, 175, 55, 0.4) 0%, transparent 65%)",
    bgClass: "bg-[#2A0F12]",
  },
  {
    id: 2,
    badge: "DECOR",
    categoryName: "Decorations",
    title: "Décor that defines the day",
    description: "Curated setups for weddings, sangeets & celebrations",
    glowColor: "radial-gradient(circle at 80% 20%, rgba(199, 84, 112, 0.45) 0%, transparent 65%)",
    bgClass: "bg-[#2A0F12]",
  },
  {
    id: 3,
    badge: "GAME ZONE",
    categoryName: "Game zone",
    title: "Fun that keeps everyone moving",
    description: "Activity zones designed for every age group",
    glowColor: "radial-gradient(circle at 80% 20%, rgba(235, 122, 52, 0.4) 0%, transparent 65%)",
    bgClass: "bg-[#2A0F12]",
  },
  {
    id: 4,
    badge: "THERMOCRAFT",
    categoryName: "Thermocraft",
    title: "Custom props, made fresh",
    description: "One-of-a-kind installations for your event",
    glowColor: "radial-gradient(circle at 80% 20%, rgba(220, 20, 60, 0.4) 0%, transparent 65%)",
    bgClass: "bg-[#2A0F12]",
  },
];

export default function CategoryCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const categoryData = useSelector((state: RootState) => state.product.allCategory);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full mx-auto px-2 sm:px-6 lg:px-8 mb-4">
      <div className="relative w-full aspect-[16/10] sm:aspect-[21/9] md:aspect-[24/9] lg:aspect-[32/9] rounded-[22px] overflow-hidden shadow-xl border border-white/5">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className={`absolute inset-0 w-full h-full ${slides[currentIndex].bgClass} p-5 sm:p-8 md:p-10`}
            style={{
              backgroundImage: slides[currentIndex].glowColor,
            }}
          >
            {/* Background Image from Category Data */}
            {(() => {
              const slide = slides[currentIndex];
              const categoryMatch = categoryData?.find(
                (cat: any) => cat?.name?.toLowerCase() === slide.categoryName.toLowerCase()
              );
              if (categoryMatch?.image) {
                return (
                  <div className="absolute inset-y-0 right-0 w-[55%] md:w-1/2 pointer-events-none">
                    <Image
                      src={categoryMatch.image}
                      alt={slide.title}
                      fill
                      priority
                      className="object-cover opacity-80 mix-blend-screen"
                      style={{
                        maskImage: "linear-gradient(to left, rgba(0,0,0,1) 30%, transparent 100%)",
                        WebkitMaskImage: "linear-gradient(to left, rgba(0,0,0,1) 30%, transparent 100%)"
                      }}
                    />
                  </div>
                );
              }
              return null;
            })()}

            {/* Content Container */}
            <div className="relative h-full flex flex-col justify-between z-10 w-[70%] sm:w-2/3">
              {/* Badge */}
              <div className="self-start">
              <span className="inline-block bg-[#E5C984] text-[#42210B] text-[10px] sm:text-xs font-extrabold px-3 py-1 rounded-[6px] tracking-widest shadow-sm">
                {slides[currentIndex].badge}
              </span>
            </div>

            {/* Text Content */}
            <div className="mt-auto">
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-white text-[22px] leading-tight sm:text-3xl md:text-4xl font-extrabold tracking-tight mb-1"
              >
                {slides[currentIndex].title}
              </motion.h2>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-white/80 text-[13px] sm:text-base md:text-lg max-w-[280px] sm:max-w-md font-normal leading-snug"
              >
                {slides[currentIndex].description}
              </motion.p>
            </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dots Indicator */}
      <div className="flex justify-center items-center gap-1.5 mt-3 sm:mt-5">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`transition-all duration-300 rounded-full ${
              index === currentIndex
                ? "w-5 h-1.5 sm:w-8 sm:h-2 bg-[#E5C984]"
                : "w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white/20 hover:bg-white/40"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
