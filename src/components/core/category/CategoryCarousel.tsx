"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store/store";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createSlug } from "./categoryV1";

const glowColors = [
  "radial-gradient(circle at 80% 20%, rgba(212, 175, 55, 0.4) 0%, transparent 65%)",
  "radial-gradient(circle at 80% 20%, rgba(199, 84, 112, 0.45) 0%, transparent 65%)",
  "radial-gradient(circle at 80% 20%, rgba(235, 122, 52, 0.4) 0%, transparent 65%)",
  "radial-gradient(circle at 80% 20%, rgba(220, 20, 60, 0.4) 0%, transparent 65%)",
  "radial-gradient(circle at 80% 20%, rgba(52, 235, 155, 0.4) 0%, transparent 65%)"
];

export default function CategoryCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const router = useRouter();
  
  const subCategoryData = useSelector((state: RootState) => state.product.allSubCategory);
  
  // Create dynamic slides from subcategories
  const slides = subCategoryData?.slice(0, 5).map((sub, index) => ({
    id: sub._id,
    badge: sub.category?.name?.toUpperCase() || "TRENDING",
    title: sub.name,
    description: sub.description || "Explore our exclusive premium collections and products",
    image: sub.image || sub.category?.image,
    glowColor: glowColors[index % glowColors.length],
    bgClass: "bg-[#2A0F12]",
    subCategory: sub,
  })) || [];

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    setTouchEnd(null);
    if ('targetTouches' in e) {
      setTouchStart(e.targetTouches[0].clientX);
    } else {
      setTouchStart((e as React.MouseEvent).clientX);
    }
  };

  const onTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if ('targetTouches' in e) {
      setTouchEnd(e.targetTouches[0].clientX);
    } else {
      setTouchEnd((e as React.MouseEvent).clientX);
    }
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd || slides.length === 0) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    } else if (isRightSwipe) {
      setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
    }
    
    setTouchStart(null);
    setTouchEnd(null);
  };

  useEffect(() => {
    if (slides.length === 0) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [currentIndex, slides.length]);

  const handleSlideClick = (sub: any) => {
    if (!sub || !sub.category) return;
    const catSlug = createSlug(sub.category.name, sub.category._id);
    const subSlug = createSlug(sub.name, sub._id);
    router.push(`/category/${catSlug}/${subSlug}`);
  };

  if (slides.length === 0) return null;

  return (
    <div className="w-full mx-auto px-2 sm:px-6 lg:px-8 mb-4">
      <div 
        className="relative w-full aspect-[16/10] sm:aspect-[21/9] md:aspect-[24/9] lg:aspect-[32/9] rounded-[22px] overflow-hidden shadow-xl border border-white/5 touch-pan-y select-none cursor-grab active:cursor-grabbing"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onMouseDown={onTouchStart}
        onMouseMove={(e) => {
          if (touchStart !== null) onTouchMove(e);
        }}
        onMouseUp={onTouchEnd}
        onMouseLeave={onTouchEnd}
        onClick={() => handleSlideClick(slides[currentIndex]?.subCategory)}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className={`absolute inset-0 w-full h-full ${slides[currentIndex].bgClass} p-5 sm:p-8 md:p-10 cursor-pointer`}
            style={{
              backgroundImage: slides[currentIndex].glowColor,
            }}
          >
            {/* Background Image */}
            {slides[currentIndex].image && (
              <div className="absolute inset-y-0 right-0 w-[55%] md:w-1/2 pointer-events-none">
                <Image
                  src={slides[currentIndex].image}
                  alt={slides[currentIndex].title}
                  fill
                  priority
                  className="object-cover opacity-80 mix-blend-screen"
                  style={{
                    maskImage: "linear-gradient(to left, rgba(0,0,0,1) 30%, transparent 100%)",
                    WebkitMaskImage: "linear-gradient(to left, rgba(0,0,0,1) 30%, transparent 100%)"
                  }}
                />
              </div>
            )}

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
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="mt-3 sm:mt-4 inline-block text-[11px] sm:text-sm font-semibold text-[#E5C984] bg-white/10 px-3 py-1.5 rounded-full hover:bg-white/20 transition-colors"
              >
                View Products →
              </motion.div>
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
