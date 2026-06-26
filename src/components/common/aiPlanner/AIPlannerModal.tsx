"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store/store";
import { Product } from "@/@types/product";
import ProductCard from "@/components/core/product/ProductCard";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Sparkle, Check, RotateCcw, ChevronRight, ChevronLeft,
  Palette, Crown, LayoutTemplate, Bot, X, Download, Eye
} from "lucide-react";
import { IoLogoWhatsapp } from "react-icons/io";
import { useRouter } from "next/navigation";

// ── Pastel Balloon Colors ──
const BALLOON_COLORS = [
  { name: "Pastel Pink", hex: "#F9A8D4", class: "bg-[#F9A8D4]" },
  { name: "Pastel Blue", hex: "#93C5FD", class: "bg-[#93C5FD]" },
  { name: "Pastel Yellow", hex: "#FDE68A", class: "bg-[#FDE68A]" },
  { name: "Pastel Green", hex: "#A7F3D0", class: "bg-[#A7F3D0]" },
  { name: "Pastel Lavender", hex: "#C4B5FD", class: "bg-[#C4B5FD]" },
  { name: "Pastel Peach", hex: "#FDBA74", class: "bg-[#FDBA74]" },
  { name: "Pastel Mint", hex: "#6EE7B7", class: "bg-[#6EE7B7]" },
  { name: "Rose Gold", hex: "#E8B4B8", class: "bg-[#E8B4B8]" },
  { name: "White", hex: "#FFFFFF", class: "bg-white border border-gray-300" },
  { name: "Gold", hex: "#F5D08A", class: "bg-gradient-to-r from-[#F5D08A] to-[#E8C36A]" },
  { name: "Silver", hex: "#C0C0C0", class: "bg-gradient-to-r from-[#D4D4D8] to-[#A1A1AA]" },
];

const LoadingStates = [
  { text: "Analyzing Your Selection...", icon: Sparkles },
  { text: "Preparing Balloon Design...", icon: LayoutTemplate },
  { text: "Applying Your Colors...", icon: Palette },
  { text: "Generating HD Concept...", icon: Crown },
];

export default function AIPlannerModal() {
  const [isOpen, setIsOpen] = useState(false);
  // Steps: 1 = Select Product, 2 = Choose Colors, 3 = Loading, 4 = Result
  const [step, setStep] = useState(1);

  // State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [generatedData, setGeneratedData] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingTextIndex, setLoadingTextIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Redux & Router
  const products = useSelector((state: RootState) => state.product.allProducts) || [];
  const allCategory = useSelector((state: RootState) => state.product.allCategory) || [];
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const router = useRouter();

  // Pagination for Step 1
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  // ── Filter balloon products from all products ──
  const balloonProducts = useMemo(() => {
    return products.filter((p) => {
      const hasBalloonCategory = p.category?.some((cat: any) => {
        const catName =
          typeof cat === "string"
            ? allCategory.find((c) => c._id === cat)?.name || ""
            : cat?.name || "";
        return catName.toLowerCase().includes("balloon") || catName.toLowerCase().includes("ballon");
      });
      const nameLower = p.name.toLowerCase();
      const hasBalloonName = nameLower.includes("balloon") || nameLower.includes("ballon");
      return hasBalloonCategory || hasBalloonName;
    });
  }, [products, allCategory]);

  // Loading text cycle
  useEffect(() => {
    let interval: any;
    if (isGenerating) {
      interval = setInterval(() => {
        setLoadingTextIndex((prev) => (prev + 1) % LoadingStates.length);
      }, 2000);
    } else {
      setLoadingTextIndex(0);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  // ── Color Toggle (max 5) ──
  const handleColorToggle = (colorName: string) => {
    setSelectedColors((prev) => {
      if (prev.includes(colorName)) {
        if (prev.length === 1) return prev;
        return prev.filter((c) => c !== colorName);
      }
      if (prev.length >= 5) {
        toast.error("Maximum 5 colors allowed");
        return prev;
      }
      return [...prev, colorName];
    });
  };

  // ── Generate Image ──
  const handleGenerate = async () => {
    if (!selectedProduct || selectedColors.length === 0) return;

    setStep(3);
    setIsGenerating(true);

    try {
      const response = await fetch("/api/ai/generate-event-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "balloon-recolor",
          productName: selectedProduct.name,
          productDescription: selectedProduct.description || "",
          productImageUrl: selectedProduct.image?.[0] || "",
          balloonColors: selectedColors,
          // Required fields for existing API compat
          eventType: "Balloon Decoration",
          venueType: "Event Venue",
          guestCount: "50-100",
          themeColors: selectedColors,
          budget: 25000,
        }),
      });

      const result = await response.json();
      if (!result.success) throw new Error(result.message);

      setGeneratedData({
        _id: result.data._id,
        imageUrl: result.data.variationAUrl || result.data.imageUrl,
      });
      setIsGenerating(false);
      setStep(4);
    } catch (error: any) {
      toast.error(error.message || "Failed to generate image");
      setIsGenerating(false);
      setStep(2);
    }
  };

  // ── Download Image ──
  const handleDownload = async (url: string) => {
    try {
      const toastId = toast.loading("Downloading image...");
      const res = await fetch(url);
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `Alpha-AI-Design-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      toast.success("Download complete", { id: toastId });
    } catch (error) {
      toast.error("Failed to download image");
    }
  };

  // ── Reset ──
  const resetForm = () => {
    setStep(1);
    setSelectedProduct(null);
    setSelectedColors([]);
    setGeneratedData(null);
  };

  // Handle Auth check
  const handleOpenClick = () => {
    if (!isAuthenticated) {
      toast.error("Please login first to use AI Planner");
      router.push("/auth/sign-in");
    } else {
      setIsOpen(true);
    }
  };

  return (
    <>
      {/* ═══════════════ Floating AI Button ═══════════════ */}
      <div className="fixed bottom-52 md:bottom-44 right-4 md:right-8 z-50 pointer-events-auto">
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="relative"
        >
          {/* Outer Multicolor Spinning Aura */}
          <div className="absolute inset-0 rounded-full z-0 pointer-events-none flex justify-center items-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="w-[150%] h-[150%] opacity-50 blur-xl"
              style={{
                background: "conic-gradient(from 0deg, #ff007f, #7928ca, #00d4ff, #ffdf00, #ff007f)",
                borderRadius: "50%",
              }}
            />
          </div>

          <motion.button
            whileHover="hover"
            whileTap={{ scale: 0.95 }}
            onClick={handleOpenClick}
            initial="rest"
            animate="rest"
            className="group relative flex items-center bg-transparent rounded-full shadow-[0_0_20px_rgba(0,0,0,0.5)] overflow-hidden h-14 sm:h-16 grayscale-[30%]"
          >
            {/* Inner Multicolor Spinning Border */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] z-0"
              style={{
                background: "conic-gradient(from 0deg, #ff007f, #7928ca, #00d4ff, #ffdf00, #ff007f)",
              }}
            />

            {/* Solid Mask Background */}
            <div className="absolute inset-[3px] bg-[#110101] rounded-full z-10" />

            {/* The circular icon part */}
            <div className="relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 shrink-0 z-20">
              <Bot className="w-6 h-6 sm:w-7 sm:h-7 text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.8)] relative z-10" />
            </div>

            {/* Expanding Text Container */}
            <motion.div
              variants={{
                rest: { width: 0, opacity: 0 },
                hover: { width: 140, opacity: 1 },
              }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="flex flex-col items-start whitespace-nowrap overflow-hidden z-20"
            >
              <div className="pl-1 pr-6">
                <span className="block text-[10px] sm:text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 uppercase tracking-widest leading-none mb-1">
                  Alpha Magic
                </span>
                <span className="block text-sm sm:text-base font-black text-white leading-none tracking-wide">
                  AI Planner
                </span>
              </div>
            </motion.div>
          </motion.button>
        </motion.div>
      </div>

      {/* ═══════════════ Modal ═══════════════ */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-[95vw] md:max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl p-0 bg-white/95 backdrop-blur-xl border border-slate-200/50 shadow-2xl">
          {/* ── Header ── */}
          <div className="bg-gradient-to-r from-[#2A0001] via-[#4A0404] to-[#2A0001] p-5 md:p-6 text-white sticky top-0 z-20 shadow-lg">
            <div className="flex justify-between items-center">
              <div>
                <DialogTitle className="text-xl md:text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-500 flex items-center gap-2">
                  <Sparkle className="w-5 h-5 md:w-6 md:h-6 text-amber-400" />
                  Balloon Color Studio
                </DialogTitle>
                <DialogDescription className="text-amber-100/70 text-xs mt-1 font-medium">
                  Select a product, choose your colors — AI will visualize it for you.
                </DialogDescription>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-9 h-9 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Step Indicator (2 steps visible) */}
            {step <= 2 && (
              <div className="mt-5 flex items-center gap-3">
                {[1, 2].map((s) => (
                  <div key={s} className="flex-1 flex items-center gap-2">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 transition-all ${
                        step > s
                          ? "bg-amber-400 text-[#2A0001]"
                          : step === s
                          ? "bg-white text-[#4A0404] shadow-lg"
                          : "bg-white/15 text-white/50"
                      }`}
                    >
                      {step > s ? <Check className="w-3.5 h-3.5 stroke-[3px]" /> : s}
                    </div>
                    <span className={`text-xs font-bold hidden sm:block ${step >= s ? "text-amber-200" : "text-white/30"}`}>
                      {s === 1 ? "Select Product" : "Choose Colors"}
                    </span>
                    {s < 2 && <div className={`flex-1 h-0.5 rounded-full ${step > 1 ? "bg-amber-400" : "bg-white/10"}`} />}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Content ── */}
          <div className="p-5 md:p-8">
            <AnimatePresence mode="wait">

              {/* ═══ STEP 1: Select Your Balloon Product ═══ */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-5"
                >
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 mb-1 flex items-center gap-2">
                      <Sparkle className="w-5 h-5 text-amber-600" />
                      Select Your Balloon Product
                    </h3>
                    <p className="text-slate-500 text-sm font-medium">
                      Choose 1 balloon product — AI will generate it in your chosen colors.
                    </p>
                  </div>

                  {balloonProducts.length > 0 ? (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {balloonProducts
                          .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
                          .map((product) => {
                            const isSelected = selectedProduct?._id === product._id;
                            return (
                              <motion.div
                                key={product._id}
                                whileHover={{ y: -4 }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                className={`relative cursor-pointer rounded-2xl transition-all duration-300 ${
                                  isSelected
                                    ? "ring-[3px] ring-amber-500 shadow-xl shadow-amber-500/15 scale-[1.02]"
                                    : "hover:shadow-lg"
                                }`}
                                onClick={() => setSelectedProduct(isSelected ? null : product)}
                              >
                                <div className="pointer-events-none">
                                  <ProductCard data={product} id={product._id} />
                                </div>
                                {/* Selection Badge */}
                                {isSelected && (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute top-3 left-3 bg-amber-500 text-white p-1.5 rounded-full z-20 shadow-lg shadow-amber-500/30"
                                  >
                                    <Check className="w-4 h-4 stroke-[3px]" />
                                  </motion.div>
                                )}
                                <div className="absolute inset-0 z-10 bg-transparent rounded-2xl" />
                              </motion.div>
                            );
                          })}
                      </div>

                      {/* Pagination Controls */}
                      {Math.ceil(balloonProducts.length / ITEMS_PER_PAGE) > 1 && (
                        <div className="flex items-center justify-center gap-4 mt-8 pt-4 border-t border-slate-100">
                          <Button
                            variant="outline"
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="rounded-full w-10 h-10 p-0 border-slate-200"
                          >
                            <ChevronLeft className="w-5 h-5 text-slate-600" />
                          </Button>
                          <span className="text-slate-600 font-bold text-sm">
                            Page {currentPage} of {Math.ceil(balloonProducts.length / ITEMS_PER_PAGE)}
                          </span>
                          <Button
                            variant="outline"
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(balloonProducts.length / ITEMS_PER_PAGE)))}
                            disabled={currentPage === Math.ceil(balloonProducts.length / ITEMS_PER_PAGE)}
                            className="rounded-full w-10 h-10 p-0 border-slate-200"
                          >
                            <ChevronRight className="w-5 h-5 text-slate-600" />
                          </Button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                        <Sparkle className="w-8 h-8 text-slate-300" />
                      </div>
                      <p className="text-slate-600 font-bold text-lg mb-1">No Balloon Products Found</p>
                      <p className="text-slate-400 text-sm max-w-sm">
                        Try exploring other categories.
                      </p>
                    </div>
                  )}

                  {/* Next Button */}
                  <div className="flex justify-end pt-2">
                    <Button
                      onClick={() => {
                        if (!selectedProduct) {
                          toast.error("Please select a product first");
                          return;
                        }
                        setStep(2);
                      }}
                      disabled={!selectedProduct}
                      className="bg-[#4A0404] text-white hover:bg-[#2A0001] px-8 py-6 rounded-xl text-md font-bold shadow-xl disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Choose Colors <ChevronRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* ═══ STEP 2: Choose Balloon Colors ═══ */}
              {step === 2 && selectedProduct && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {/* Selected Product Preview */}
                  <div className="flex items-center gap-4 bg-gradient-to-r from-slate-50 to-white p-4 rounded-2xl border border-slate-100">
                    <img
                      src={selectedProduct.thumbnails?.[0] || selectedProduct.image?.[0] || "/no-image.png"}
                      alt={selectedProduct.name}
                      className="w-20 h-20 rounded-xl object-cover shadow-md border border-white"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-0.5">Selected Product</p>
                      <p className="text-lg font-black text-slate-800 truncate">{selectedProduct.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">AI will generate this design with your chosen colors</p>
                    </div>
                    <button
                      onClick={() => { setSelectedProduct(null); setStep(1); }}
                      className="text-slate-400 hover:text-slate-600 text-xs font-bold shrink-0"
                    >
                      Change
                    </button>
                  </div>

                  {/* Color Picker */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-800 mb-1 flex items-center gap-2">
                        <Palette className="w-5 h-5 text-amber-600" />
                        Choose Balloon Colors
                      </h3>
                      <p className="text-slate-500 text-sm">Pick the colors you want for the balloons (select 1 to 5)</p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {BALLOON_COLORS.map((color) => {
                        const isSelected = selectedColors.includes(color.name);
                        return (
                          <motion.button
                            key={color.name}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => handleColorToggle(color.name)}
                            className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all duration-200 ${
                              isSelected
                                ? "border-amber-500 bg-amber-50 shadow-md shadow-amber-500/10"
                                : "border-slate-100 bg-white hover:border-slate-200 hover:shadow-sm"
                            }`}
                          >
                            <div
                              className={`w-8 h-8 rounded-full shadow-inner shrink-0 ${color.class} ${
                                isSelected ? "ring-2 ring-amber-400 ring-offset-2" : ""
                              }`}
                            />
                            <div className="text-left min-w-0">
                              <span className={`text-sm font-bold block truncate ${isSelected ? "text-amber-700" : "text-slate-700"}`}>
                                {color.name}
                              </span>
                            </div>
                            {isSelected && (
                              <Check className="w-4 h-4 text-amber-500 ml-auto shrink-0 stroke-[3px]" />
                            )}
                          </motion.button>
                        );
                      })}
                    </div>

                    {/* Selected Colors Preview */}
                    {selectedColors.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-r from-amber-50/80 to-orange-50/50 p-4 rounded-2xl border border-amber-200/40"
                      >
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Your Palette:</span>
                          <div className="flex -space-x-1.5">
                            {selectedColors.map((cn) => {
                              const col = BALLOON_COLORS.find((c) => c.name === cn);
                              return (
                                <div
                                  key={cn}
                                  className={`w-7 h-7 rounded-full border-2 border-white shadow-sm ${col?.class}`}
                                  title={cn}
                                />
                              );
                            })}
                          </div>
                          <span className="text-xs text-amber-600 font-medium">
                            {selectedColors.join(" · ")}
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-between pt-2">
                    <Button
                      onClick={() => setStep(1)}
                      variant="outline"
                      className="px-6 py-6 rounded-xl text-md font-bold"
                    >
                      <ChevronLeft className="w-5 h-5 mr-2" /> Back
                    </Button>
                    <Button
                      onClick={handleGenerate}
                      disabled={selectedColors.length === 0}
                      className="bg-gradient-to-r from-amber-500 to-yellow-600 text-white hover:opacity-90 px-8 py-6 rounded-xl text-md font-bold shadow-xl shadow-amber-500/20 group disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Sparkles className="w-5 h-5 mr-2 group-hover:animate-spin" />
                      Generate AI Image
                      <ChevronRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* ═══ STEP 3: Loading ═══ */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-16 md:py-24 flex flex-col items-center justify-center text-center space-y-10 relative overflow-hidden rounded-3xl bg-slate-950"
                >
                  {/* Digital Grid Background */}
                  <div
                    className="absolute inset-0 z-0 opacity-20 pointer-events-none"
                    style={{
                      backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)",
                      backgroundSize: "20px 20px"
                    }}
                  />

                  {/* Scanning Animation */}
                  <div className="relative z-10 w-48 h-48 md:w-64 md:h-64 border border-amber-500/30 rounded-2xl overflow-hidden bg-slate-900/50 shadow-[0_0_50px_rgba(245,158,11,0.15)] flex items-center justify-center">
                    {/* Placeholder Product Silhouette */}
                    {selectedProduct?.image?.[0] ? (
                      <img src={selectedProduct.image[0]} alt="Processing" className="w-full h-full object-cover opacity-30 grayscale blur-sm" />
                    ) : (
                      <Sparkles className="w-16 h-16 text-slate-700" />
                    )}

                    {/* Scanning Laser Line */}
                    <motion.div
                      animate={{ y: ["-100%", "200%"] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="absolute left-0 right-0 h-1 bg-amber-400 shadow-[0_0_15px_#fbbf24] z-20"
                    />

                    {/* Color Overlay Hint */}
                    <motion.div
                      animate={{ opacity: [0, 0.4, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute inset-0 z-10"
                      style={{
                        background: `linear-gradient(45deg, ${BALLOON_COLORS.find(c => c.name === selectedColors[0])?.hex || '#F5D08A'} 0%, transparent 100%)`
                      }}
                    />
                  </div>

                  <div className="space-y-3 h-20 relative z-10">
                    <motion.h3
                      key={loadingTextIndex}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xl md:text-2xl font-black text-amber-400 tracking-wide"
                    >
                      {LoadingStates[loadingTextIndex].text}
                    </motion.h3>
                    <p className="text-slate-400 font-medium text-sm md:text-base animate-pulse">
                      Synthesizing AI vision in high resolution...
                    </p>
                  </div>
                </motion.div>
              )}

              {/* ═══ STEP 4: Result ═══ */}
              {step === 4 && generatedData && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-6"
                >
                  {/* Generated Image */}
                  <div className="relative h-72 md:h-[450px] rounded-3xl overflow-hidden shadow-2xl group border-4 border-white">
                    <img
                      src={generatedData.imageUrl}
                      alt="Generated Balloon Concept"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />

                    {/* Color Palette Used */}
                    <div className="absolute top-5 right-5 flex -space-x-1.5 z-10">
                      {selectedColors.map((cn) => {
                        const col = BALLOON_COLORS.find((c) => c.name === cn);
                        return (
                          <div
                            key={cn}
                            className={`w-7 h-7 rounded-full border-2 border-white shadow-md ${col?.class}`}
                            title={cn}
                          />
                        );
                      })}
                    </div>

                    {/* Bottom Info */}
                    <div className="absolute bottom-0 left-0 p-5 md:p-8 text-white w-full">
                      <h2 className="text-2xl md:text-3xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-500 drop-shadow-md">
                        {selectedProduct?.name}
                      </h2>
                      <p className="text-white/80 text-sm mb-6 font-medium">
                        Custom Palette: {selectedColors.join(", ")}
                      </p>

                      <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
                        <Button
                          onClick={() => {
                            const origin = window.location.origin;
                            const baseUrl = origin.includes("localhost") ? "https://alphaartandevents.com" : origin;
                            const fullImgUrl = `${baseUrl}/api/concept-image/${generatedData._id}?opt=A`;

                            const msg = `Hello Alpha Events! 🎈\n\nI just used your AI Balloon Color Studio and I love this concept!\n\n*Product:* ${selectedProduct?.name}\n*Balloon Colors:* ${selectedColors.join(", ")}\n*Concept ID:* ${generatedData._id}\n\n*Concept Image:* ${fullImgUrl}\n\nPlease let me know the availability and pricing!`;

                            window.location.href = `https://wa.me/919302282860?text=${encodeURIComponent(msg)}`;
                          }}
                          className="w-full sm:w-1/2 bg-[#25D366] hover:bg-[#128C7E] text-white px-4 py-6 rounded-2xl text-md md:text-lg font-black shadow-[0_0_30px_rgba(37,211,102,0.4)] hover:shadow-[0_0_40px_rgba(37,211,102,0.6)] transition-all flex items-center justify-center gap-2 group"
                        >
                          <IoLogoWhatsapp className="w-6 h-6 group-hover:scale-110 transition-transform" />
                          Enquire
                        </Button>
                        
                        <div className="flex w-full sm:w-1/2 gap-2">
                          <Button
                            onClick={() => setIsLightboxOpen(true)}
                            className="w-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white border border-white/20 py-6 rounded-2xl text-sm font-bold transition-all flex items-center justify-center gap-2"
                          >
                            <Eye className="w-5 h-5" /> View
                          </Button>
                          
                          <Button
                            onClick={() => handleDownload(generatedData.imageUrl)}
                            className="w-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white border border-white/20 py-6 rounded-2xl text-sm font-bold transition-all flex items-center justify-center gap-2"
                          >
                            <Download className="w-5 h-5" /> Save
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-center pt-2">
                    <Button onClick={resetForm} variant="ghost" className="text-slate-500 hover:text-slate-800 font-bold">
                      <RotateCcw className="w-4 h-4 mr-2" /> Try Another Product
                    </Button>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </DialogContent>
      </Dialog>

      {/* ═══════════════ Lightbox Modal ═══════════════ */}
      <AnimatePresence>
        {isLightboxOpen && generatedData?.imageUrl && (
          <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
            <DialogContent className="max-w-[95vw] md:max-w-5xl h-[90vh] p-0 bg-transparent shadow-none border-none flex flex-col items-center justify-center">
              <div className="relative w-full h-full flex items-center justify-center">
                <img
                  src={generatedData.imageUrl}
                  alt="Generated Concept Fullscreen"
                  className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                />
                <button
                  onClick={() => setIsLightboxOpen(false)}
                  className="absolute top-0 right-0 md:-right-12 md:-top-5 w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center transition-all text-white shadow-lg border border-white/30"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </>
  );
}
