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
  Sparkles, Check, RotateCcw, ChevronRight, ChevronLeft,
  X, Download, Eye, Bot
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
  { name: "White", hex: "#FFFFFF", class: "bg-[#ffffff] border border-[#dadad3]" },
  { name: "Gold", hex: "#F5D08A", class: "bg-[#F5D08A]" },
  { name: "Silver", hex: "#C0C0C0", class: "bg-[#D4D4D8]" },
];

const LoadingStates = [
  { text: "Analyzing Your Selection..." },
  { text: "Preparing Balloon Design..." },
  { text: "Applying Your Colors..." },
  { text: "Generating Concept..." },
];

export default function AIPlannerModal() {
  const [isOpen, setIsOpen] = useState(false);
  // Steps: 1 = Select Product, 2 = Choose Colors, 3 = Customize, 4 = Loading, 5 = Result
  const [step, setStep] = useState(1);

  // State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [userCustomPrompt, setUserCustomPrompt] = useState("");
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

    setStep(4);
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
          userCustomPrompt,
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
      setStep(5);
    } catch (error: any) {
      toast.error(error.message || "Failed to generate image");
      setIsGenerating(false);
      setStep(3);
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
    setUserCustomPrompt("");
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
        <DialogContent 
          overlayClassName="bg-black/50 backdrop-blur-sm" 
          className="max-w-[95vw] md:max-w-4xl max-h-[90vh] overflow-y-auto rounded-[32px] p-0 bg-[#ffffff] border-none shadow-[0_16px_32px_rgba(0,0,0,0.2)]"
        >
          {/* ── Header ── */}
          <div className="bg-[#ffffff] p-6 md:p-8 sticky top-0 z-20 border-b border-[#dadad3]">
            <div className="flex justify-between items-start">
              <div>
                <DialogTitle className="text-2xl md:text-[28px] font-bold text-[#000000] tracking-[-1.2px] leading-[1.2]">
                  AI Design Studio
                </DialogTitle>
                <DialogDescription className="text-[#62625b] text-[16px] mt-1 font-normal">
                  Select a product, choose your colors, and let AI visualize it.
                </DialogDescription>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center bg-[#f6f6f3] hover:bg-[#e5e5e0] transition-colors"
              >
                <X className="w-5 h-5 text-[#000000]" />
              </button>
            </div>
            
            {/* Step Indicator */}
            {step <= 3 && (
               <div className="mt-6 flex items-center gap-2">
                 {[1, 2, 3].map(s => (
                   <div key={s} className={`h-2 flex-1 rounded-full transition-colors ${step >= s ? 'bg-[#e60023]' : 'bg-[#e5e5e0]'}`} />
                 ))}
               </div>
            )}
          </div>

          {/* ── Content ── */}
          <div className="p-6 md:p-8 bg-[#ffffff]">
            <AnimatePresence mode="wait">

              {/* ═══ STEP 1: Select Your Balloon Product ═══ */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-[22px] font-bold text-[#000000] tracking-tight mb-4">Select a Base Product</h3>
                  </div>

                  {balloonProducts.length > 0 ? (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {balloonProducts
                          .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
                          .map((product) => {
                            const isSelected = selectedProduct?._id === product._id;
                            return (
                              <div
                                key={product._id}
                                onClick={() => {
                                  if (isSelected) {
                                    setSelectedProduct(null);
                                  } else {
                                    setSelectedProduct(product);
                                    setTimeout(() => setStep(2), 150);
                                  }
                                }}
                                className={`relative cursor-pointer rounded-[16px] transition-all bg-[#f6f6f3] ${
                                  isSelected
                                    ? "ring-2 ring-[#e60023] ring-offset-2 ring-offset-white"
                                    : "hover:bg-[#e5e5e0]"
                                }`}
                              >
                                <div className="pointer-events-none rounded-[16px] overflow-hidden">
                                  <ProductCard data={product} id={product._id} />
                                </div>
                                {isSelected && (
                                  <div className="absolute top-3 left-3 bg-[#e60023] text-white p-1.5 rounded-full shadow-sm">
                                    <Check className="w-4 h-4 stroke-[3px]" />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                      </div>

                      {/* Pagination Controls */}
                      {Math.ceil(balloonProducts.length / ITEMS_PER_PAGE) > 1 && (
                        <div className="flex items-center justify-center gap-4 mt-8 pt-4 border-t border-[#dadad3]">
                          <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="w-10 h-10 rounded-full flex items-center justify-center bg-[#f6f6f3] hover:bg-[#e5e5e0] disabled:opacity-50 text-[#000000] transition-colors"
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          <span className="text-[#000000] font-bold text-[14px]">
                            Page {currentPage} of {Math.ceil(balloonProducts.length / ITEMS_PER_PAGE)}
                          </span>
                          <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(balloonProducts.length / ITEMS_PER_PAGE)))}
                            disabled={currentPage === Math.ceil(balloonProducts.length / ITEMS_PER_PAGE)}
                            className="w-10 h-10 rounded-full flex items-center justify-center bg-[#f6f6f3] hover:bg-[#e5e5e0] disabled:opacity-50 text-[#000000] transition-colors"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <div className="w-16 h-16 bg-[#f6f6f3] rounded-full flex items-center justify-center mb-4">
                        <Sparkles className="w-8 h-8 text-[#91918c]" />
                      </div>
                      <p className="text-[#000000] font-bold text-[18px] mb-1">No Balloon Products Found</p>
                      <p className="text-[#62625b] text-[14px]">Try exploring other categories.</p>
                    </div>
                  )}

                  {/* Next Button */}
                  <div className="flex justify-end pt-4">
                    <button
                      onClick={() => {
                        if (!selectedProduct) {
                          toast.error("Please select a product first");
                          return;
                        }
                        setStep(2);
                      }}
                      disabled={!selectedProduct}
                      className="bg-[#e60023] text-white px-6 py-3 rounded-[16px] font-bold text-[16px] hover:bg-[#cc001f] disabled:bg-[#f6f6f3] disabled:text-[#91918c] transition-colors"
                    >
                      Choose Colors
                    </button>
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
                  className="space-y-8"
                >
                  {/* Selected Product Preview */}
                  <div className="flex items-center gap-4 bg-[#f6f6f3] p-4 rounded-[16px]">
                    <img
                      src={selectedProduct.thumbnails?.[0] || selectedProduct.image?.[0] || "/no-image.png"}
                      alt={selectedProduct.name}
                      className="w-20 h-20 rounded-[16px] object-cover border border-[#dadad3]"
                      onError={(e) => {
                        const target = e.currentTarget;
                        const fallback = selectedProduct.image?.[0] || "/no-image.png";
                        if (target.src !== fallback) {
                          target.src = fallback;
                        }
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-bold text-[#62625b] uppercase">Selected Product</p>
                      <p className="text-[18px] font-bold text-[#000000] truncate">{selectedProduct.name}</p>
                    </div>
                    <button
                      onClick={() => { setSelectedProduct(null); setStep(1); }}
                      className="bg-[#e5e5e0] hover:bg-[#c8c8c1] text-[#000000] px-4 py-2 rounded-[16px] font-bold text-[14px] transition-colors"
                    >
                      Change
                    </button>
                  </div>

                  {/* Color Picker */}
                  <div>
                    <h3 className="text-[22px] font-bold text-[#000000] tracking-tight mb-4">Color Palette</h3>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {BALLOON_COLORS.map((color) => {
                        const isSelected = selectedColors.includes(color.name);
                        return (
                          <button
                            key={color.name}
                            onClick={() => handleColorToggle(color.name)}
                            className={`flex items-center gap-3 p-3 rounded-[16px] border transition-colors text-left ${
                              isSelected
                                ? "border-[#e60023] bg-[#fff0f2]"
                                : "border-[#dadad3] hover:bg-[#f6f6f3] bg-[#ffffff]"
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-full border border-[#dadad3] shrink-0 ${color.class}`} />
                            <span className="font-bold text-[14px] text-[#000000] flex-1 truncate">{color.name}</span>
                            {isSelected && (
                              <Check className="w-5 h-5 text-[#e60023] shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-between items-center pt-6 mt-4 border-t border-[#dadad3]">
                    <button
                      onClick={() => setStep(1)}
                      className="bg-[#e5e5e0] hover:bg-[#c8c8c1] text-[#000000] px-6 py-3 rounded-[16px] font-bold text-[16px] transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => setStep(3)}
                      disabled={selectedColors.length === 0}
                      className="bg-[#e60023] text-white px-6 py-3 rounded-[16px] font-bold text-[16px] hover:bg-[#cc001f] disabled:bg-[#f6f6f3] disabled:text-[#91918c] transition-colors"
                    >
                      Customize
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ═══ STEP 3: Customize ═══ */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div>
                    <h3 className="text-[22px] font-bold text-[#000000] tracking-tight mb-2">Add Custom Touches</h3>
                    <p className="text-[#62625b] text-[16px]">
                      Describe any extra elements like confetti, backdrops, or lighting. (Optional)
                    </p>
                  </div>

                  <div className="relative">
                    <textarea
                      value={userCustomPrompt}
                      onChange={(e) => {
                        if (e.target.value.length <= 200) {
                          setUserCustomPrompt(e.target.value);
                        }
                      }}
                      placeholder="e.g. change backdrop to red, add gold confetti..."
                      className="w-full h-32 bg-[#ffffff] border border-[#dadad3] rounded-[16px] p-4 focus:ring-2 focus:ring-[#435ee5] focus:border-transparent focus:outline-none text-[16px] text-[#000000] transition-shadow resize-none"
                    />
                    <div className="absolute bottom-4 right-4 bg-[#f6f6f3] px-2 py-1 rounded-[8px] border border-[#dadad3]">
                      <span className={`text-[12px] font-medium ${userCustomPrompt.length >= 200 ? 'text-[#9e0a0a]' : 'text-[#62625b]'}`}>
                        {200 - userCustomPrompt.length} chars
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-between items-center pt-6 mt-4 border-t border-[#dadad3]">
                    <button
                      onClick={() => setStep(2)}
                      className="bg-[#e5e5e0] hover:bg-[#c8c8c1] text-[#000000] px-6 py-3 rounded-[16px] font-bold text-[16px] transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleGenerate}
                      className="bg-[#e60023] text-white px-6 py-3 rounded-[16px] font-bold text-[16px] hover:bg-[#cc001f] flex items-center gap-2 transition-colors"
                    >
                      <Sparkles className="w-5 h-5 fill-current" /> 
                      Generate Concept
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ═══ STEP 4: Loading ═══ */}
              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-24 flex flex-col items-center justify-center text-center space-y-6"
                >
                  <div className="relative w-16 h-16 flex items-center justify-center mb-4">
                     <div className="absolute inset-0 rounded-full border-4 border-[#e5e5e0]" />
                     <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#e60023] animate-spin" />
                  </div>

                  <h3 className="text-[22px] md:text-[28px] font-bold text-[#000000] tracking-tight">
                    {LoadingStates[loadingTextIndex].text}
                  </h3>
                  <p className="text-[#62625b] text-[16px]">
                    Synthesizing AI vision in 4K resolution...
                  </p>
                </motion.div>
              )}

              {/* ═══ STEP 5: Result ═══ */}
              {step === 5 && generatedData && (
                <motion.div
                  key="step5"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  {/* Generated Image */}
                  <div className="relative rounded-[32px] overflow-hidden bg-[#f6f6f3] border border-[#dadad3] cursor-zoom-in" onClick={() => setIsLightboxOpen(true)}>
                    <img
                      src={generatedData.imageUrl}
                      alt="Generated Balloon Concept"
                      className="w-full h-auto max-h-[500px] object-contain mx-auto"
                    />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5 border border-[#dadad3]">
                      <Sparkles className="w-3.5 h-3.5 text-[#e60023] fill-current" />
                      <span className="text-[12px] font-bold text-[#000000]">AI Concept</span>
                    </div>
                  </div>

                  {/* Actions & Info */}
                  <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                    <div>
                      <h2 className="text-[28px] font-bold text-[#000000] tracking-[-1.2px]">{selectedProduct?.name}</h2>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className="text-[#62625b] text-[14px] font-medium">Palette:</span>
                        <div className="flex gap-1.5">
                          {selectedColors.map((cn) => {
                            const col = BALLOON_COLORS.find((c) => c.name === cn);
                            return (
                              <div
                                key={cn}
                                className={`w-5 h-5 rounded-full border border-[#dadad3] ${col?.class}`}
                                title={cn}
                              />
                            );
                          })}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap sm:flex-nowrap gap-3 w-full md:w-auto">
                      <button
                        onClick={() => {
                          const origin = window.location.origin;
                          const baseUrl = origin.includes("localhost") ? "https://alphaartandevents.com" : origin;
                          const fullImgUrl = `${baseUrl}/api/concept-image/${generatedData._id}?opt=A`;
                          const msg = `Hello Alpha Events! 🎈\n\nI just used your AI Balloon Color Studio and I love this concept!\n\n*Product:* ${selectedProduct?.name}\n*Balloon Colors:* ${selectedColors.join(", ")}\n*Concept ID:* ${generatedData._id}\n\n*Concept Image:* ${fullImgUrl}\n\nPlease let me know the availability and pricing!`;
                          window.location.href = `https://wa.me/917389288488?text=${encodeURIComponent(msg)}`;
                        }}
                        className="bg-[#25D366] hover:bg-[#128C7E] text-white px-6 py-3 rounded-[16px] font-bold text-[16px] transition-colors flex items-center justify-center gap-2 flex-1 md:flex-none"
                      >
                        <IoLogoWhatsapp className="w-5 h-5" /> Enquire Now
                      </button>
                      <button
                        onClick={() => handleDownload(generatedData.imageUrl)}
                        className="bg-[#e5e5e0] hover:bg-[#c8c8c1] text-[#000000] px-6 py-3 rounded-[16px] font-bold text-[16px] transition-colors flex items-center justify-center gap-2 flex-1 md:flex-none"
                      >
                        <Download className="w-5 h-5" /> Save
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-center pt-6 border-t border-[#dadad3]">
                    <button 
                      onClick={resetForm} 
                      className="text-[#000000] font-bold text-[16px] flex items-center gap-2 hover:bg-[#f6f6f3] px-4 py-2 rounded-[16px] transition-colors"
                    >
                      <RotateCcw className="w-4 h-4" /> Design Another Concept
                    </button>
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
                  className="max-w-full max-h-full object-contain rounded-[16px] shadow-[0_16px_64px_rgba(0,0,0,0.5)]"
                />
                <button
                  onClick={() => setIsLightboxOpen(false)}
                  className="absolute top-2 right-2 md:-right-12 md:-top-5 w-10 h-10 bg-[#ffffff] hover:bg-[#f6f6f3] rounded-full flex items-center justify-center transition-colors text-[#000000] shadow-md"
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
