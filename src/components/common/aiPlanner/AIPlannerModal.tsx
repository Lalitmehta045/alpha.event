"use client";

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store/store";
import { Product } from "@/@types/product";
import ProductCard from "@/components/core/product/ProductCard";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Cake, Heart, PartyPopper, Sparkle, Baby, Briefcase,
  Compass, Users, Check, RotateCcw, Copy, ChevronRight, ChevronLeft,
  DollarSign, TrendingUp, ListTodo, Palette, Download, Crown, LayoutTemplate, Bot
} from "lucide-react";
import { IoLogoWhatsapp } from "react-icons/io";

const EVENT_TYPES = [
  { name: "Birthday", icon: Cake, description: "Celebrate life milestones" },
  { name: "Anniversary", icon: Heart, description: "Milestones of togetherness" },
  { name: "Surprise Party", icon: PartyPopper, description: "Sudden celebrations" },
  { name: "Wedding", icon: Sparkle, description: "Grand fairytale beginnings" },
  { name: "Baby Shower", icon: Baby, description: "Welcoming new beginnings" },
  { name: "Corporate Event", icon: Briefcase, description: "Corporate elegance" },
];

const COLOR_OPTIONS = [
  { name: "Maroon", class: "bg-[#800000]", hex: "#800000" },
  { name: "Gold", class: "bg-amber-500 bg-gradient-to-r from-amber-400 to-yellow-600 shadow-sm", hex: "#d97706" },
  { name: "Rose Gold", class: "bg-rose-400 bg-gradient-to-r from-rose-300 to-rose-500", hex: "#fb7185" },
  { name: "Royal Blue", class: "bg-blue-800", hex: "#1e40af" },
  { name: "Emerald", class: "bg-emerald-700", hex: "#047857" },
  { name: "White", class: "bg-white border border-gray-300", hex: "#ffffff" },
  { name: "Black", class: "bg-zinc-950", hex: "#09090b" },
  { name: "Silver", class: "bg-slate-300 bg-gradient-to-r from-slate-200 to-slate-400", hex: "#cbd5e1" },
];

const GUEST_OPTIONS = ["10-25", "25-50", "50-100", "100-300", "500+"];
const VENUE_OPTIONS = [
  { name: "Banquet", image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=300&q=80" },
  { name: "Garden", image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=300&q=80" },
  { name: "Terrace", image: "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=300&q=80" },
  { name: "Home", image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=300&q=80" }
];

const LoadingStates = [
  { text: "Analyzing Event Details...", icon: Sparkles },
  { text: "Planning Premium Decorations...", icon: LayoutTemplate },
  { text: "Generating 4K Concepts...", icon: Crown },
  { text: "Finalizing Luxury Designs...", icon: Palette }
];

export default function AIPlannerModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);

  // Form State
  const [eventType, setEventType] = useState("Wedding");
  const [selectedColors, setSelectedColors] = useState<string[]>(["Maroon", "Gold"]);
  const [budget, setBudget] = useState<number>(25000);
  const [guestCount, setGuestCount] = useState("50-100");
  const [venueType, setVenueType] = useState("Banquet");

  // AI Output State
  const [aiPlan, setAiPlan] = useState<any>(null);
  const [checklistProgress, setChecklistProgress] = useState<Record<number, boolean>>({});
  const [loadingTextIndex, setLoadingTextIndex] = useState(0);
  const [selectedVariation, setSelectedVariation] = useState<"A" | "B" | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const products = useSelector((state: RootState) => state.product.allProducts) || [];

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

  const handleColorToggle = (colorName: string) => {
    setSelectedColors((prev) => {
      if (prev.includes(colorName)) {
        if (prev.length === 1) return prev;
        return prev.filter((c) => c !== colorName);
      }
      if (prev.length >= 3) {
        toast.error("Maximum 3 colors recommended");
        return prev;
      }
      return [...prev, colorName];
    });
  };

  const compileRecommendations = (
    type: string,
    colors: string[],
    budgetValue: number,
    guests: string,
    venue: string
  ) => {
    const primaryColor = colors[0] || "Gold";
    const secondaryColor = colors[1] || "White";
    const themeName = `The ${primaryColor} & ${secondaryColor} Royale ${type}`;

    const description = `A premium, ultra-realistic event configuration customized for a ${type} with ${guests} guests. The theme integrates a luxurious palette of ${colors.join(" and ")} across a stunning ${venue.toLowerCase()} venue to create a grand, memorable ambiance.`;

    const decorAmt = Math.round(budgetValue * 0.45);
    const venueAmt = Math.round(budgetValue * 0.25);
    const avAmt = Math.round(budgetValue * 0.15);
    const favorAmt = Math.round(budgetValue * 0.10);
    const bufferAmt = Math.round(budgetValue * 0.05);

    let recommendedProducts: Product[] = [];
    if (products.length > 0) {
      recommendedProducts = products.filter((p) => {
        const pName = p.name.toLowerCase();
        const matchesColor = colors.some(c => pName.includes(c.toLowerCase()));
        return matchesColor || pName.includes(type.toLowerCase());
      }).slice(0, 4);
    }

    const checklists = [
      `Confirm luxury booking details for ${venue}.`,
      `Finalize gourmet catering for ${guests} guests.`,
      `Set up ambient and spot lighting using ${colors.join(", ")} tones.`,
      `Erect premium floral backdrop for photography.`,
      `Coordinate premium seating arrangements.`,
    ];

    return {
      themeName,
      description,
      budgetBreakdown: [
        { category: "Decoration & Styling", percentage: 45, amount: decorAmt, color: "bg-red-900" },
        { category: "Venue Logistics", percentage: 25, amount: venueAmt, color: "bg-amber-600" },
        { category: "Audio/Visual", percentage: 15, amount: avAmt, color: "bg-blue-900" },
        { category: "Guest Favors", percentage: 10, amount: favorAmt, color: "bg-rose-600" },
        { category: "Contingency", percentage: 5, amount: bufferAmt, color: "bg-emerald-700" },
      ],
      checklists,
      products: recommendedProducts
    };
  };

  const startPlanGeneration = async () => {
    if (selectedColors.length === 0) {
      toast.error("Please pick a color scheme!");
      return;
    }
    setWizardStep(4);
    setIsGenerating(true);

    try {
      const response = await fetch("/api/ai/generate-event-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventType,
          venueType,
          guestCount,
          themeColors: selectedColors,
          budget
        })
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.message);

      const localPlan = compileRecommendations(eventType, selectedColors, budget, guestCount, venueType);

      setAiPlan({
        ...localPlan,
        _id: result.data._id,
        variationAUrl: result.data.variationAUrl,
        variationBUrl: result.data.variationBUrl,
      });

      setChecklistProgress({});
      setIsGenerating(false);
      setWizardStep(5);
    } catch (error: any) {
      toast.error(error.message || "Failed to generate concept.");
      setIsGenerating(false);
      setWizardStep(3);
    }
  };

  const resetForm = () => {
    setWizardStep(1);
    setAiPlan(null);
    setSelectedVariation(null);
    setChecklistProgress({});
  };

  return (
    <>
      <div className="fixed bottom-36 md:bottom-24 right-4 md:right-8 z-50 pointer-events-auto">
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
                borderRadius: "50%"
              }}
            />
          </div>

          <motion.button
            whileHover="hover"
            whileTap={{ scale: 0.95 }}
            onClick={() => { setIsOpen(true); resetForm(); }}
            initial="rest"
            animate="rest"
            className="group relative flex items-center bg-transparent rounded-full shadow-[0_0_20px_rgba(0,0,0,0.5)] overflow-hidden h-14 sm:h-16"
          >
            {/* Inner Multicolor Spinning Border */}
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] z-0"
              style={{
                background: "conic-gradient(from 0deg, #ff007f, #7928ca, #00d4ff, #ffdf00, #ff007f)"
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
                hover: { width: 130, opacity: 1 }
              }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="flex flex-col items-start whitespace-nowrap overflow-hidden z-20"
            >
              <div className="pl-1 pr-6">
                <span className="block text-[10px] sm:text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 uppercase tracking-widest leading-none mb-1">
                  Alpha Magic
                </span>
                <span className="block text-base sm:text-lg font-black text-white leading-none tracking-wide">
                  Use AI
                </span>
              </div>
            </motion.div>
          </motion.button>
        </motion.div>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-[95vw] md:max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl p-0 bg-white/95 backdrop-blur-xl border border-slate-200/50 shadow-2xl">

          {/* Header */}
          <div className="bg-gradient-to-r from-[#2A0001] via-[#4A0404] to-[#2A0001] p-6 text-white sticky top-0 z-20 shadow-lg">
            <div className="flex justify-between items-center">
              <div>
                <DialogTitle className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-500 flex items-center gap-2">
                  <Crown className="w-6 h-6 text-amber-400" />
                  Event Architect
                </DialogTitle>
                <DialogDescription className="text-amber-100/70 text-xs mt-1 font-medium">
                  Experience luxury planning. Let AI craft your perfect event concept.
                </DialogDescription>
              </div>
            </div>

            {wizardStep <= 3 && (
              <div className="mt-6 flex items-center gap-2">
                {[1, 2, 3].map((step) => (
                  <React.Fragment key={step}>
                    <div className={`h-1.5 flex-1 rounded-full ${wizardStep >= step ? 'bg-amber-400' : 'bg-white/10'}`} />
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>

          <div className="p-6 md:p-8">
            <AnimatePresence mode="wait">

              {/* STEP 1: Event & Venue */}
              {wizardStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-amber-600" /> Select Occasion
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {EVENT_TYPES.map((e) => {
                        const Icon = e.icon;
                        const isSelected = eventType === e.name;
                        return (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            key={e.name}
                            onClick={() => setEventType(e.name)}
                            className={`p-4 rounded-2xl border-2 text-left transition-all ${isSelected ? "border-[#4A0404] bg-[#4A0404]/5 shadow-lg" : "border-slate-100 hover:border-slate-200"}`}
                          >
                            <Icon className={`w-6 h-6 mb-3 ${isSelected ? "text-[#4A0404]" : "text-slate-400"}`} />
                            <p className={`font-bold ${isSelected ? "text-[#4A0404]" : "text-slate-700"}`}>{e.name}</p>
                            <p className="text-xs text-slate-500 mt-1">{e.description}</p>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <Compass className="w-5 h-5 text-amber-600" /> Choose Venue
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {VENUE_OPTIONS.map((v) => {
                        const isSelected = venueType === v.name;
                        return (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            key={v.name}
                            onClick={() => setVenueType(v.name)}
                            className={`relative h-24 rounded-2xl overflow-hidden border-2 transition-all ${isSelected ? "border-amber-500 shadow-xl" : "border-transparent"}`}
                          >
                            <img src={v.image} alt={v.name} className="absolute inset-0 w-full h-full object-cover" />
                            <div className={`absolute inset-0 bg-black/40 transition-opacity ${isSelected ? "opacity-60" : "hover:opacity-50"}`} />
                            <span className="absolute inset-0 flex items-center justify-center text-white font-bold tracking-wide z-10">
                              {v.name}
                            </span>
                            {isSelected && (
                              <div className="absolute top-2 right-2 bg-amber-500 rounded-full p-1 z-20">
                                <Check className="w-3 h-3 text-white stroke-[3px]" />
                              </div>
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button onClick={() => setWizardStep(2)} className="bg-[#4A0404] text-white hover:bg-[#2A0001] px-8 py-6 rounded-xl text-md font-bold shadow-xl">
                      Next Step <ChevronRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: Guests & Theme */}
              {wizardStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <Users className="w-5 h-5 text-amber-600" /> Guest Count
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {GUEST_OPTIONS.map((g) => (
                        <button
                          key={g}
                          onClick={() => setGuestCount(g)}
                          className={`px-6 py-3 rounded-full text-sm font-bold transition-all ${guestCount === g ? "bg-[#4A0404] text-white shadow-lg" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <Palette className="w-5 h-5 text-amber-600" /> Color Palette
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {COLOR_OPTIONS.map((color) => {
                        const isSelected = selectedColors.includes(color.name);
                        return (
                          <button
                            key={color.name}
                            onClick={() => handleColorToggle(color.name)}
                            className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${isSelected ? "border-[#4A0404] bg-[#4A0404]/5 shadow-md" : "border-slate-100 hover:border-slate-200"}`}
                          >
                            <span className={`w-6 h-6 rounded-full shadow-inner ${color.class}`} />
                            <span className="text-sm font-bold text-slate-700">{color.name}</span>
                            {isSelected && <Check className="w-4 h-4 text-[#4A0404] ml-auto stroke-[3px]" />}
                          </button>
                        );
                      })}
                    </div>

                    {/* Live Palette Preview */}
                    {selectedColors.length > 0 && (
                      <div className="mt-6 p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4">
                        <span className="text-sm font-bold text-slate-500">Active Palette:</span>
                        <div className="flex -space-x-2">
                          {selectedColors.map(c => {
                            const col = COLOR_OPTIONS.find(o => o.name === c);
                            return (
                              <div key={c} className={`w-8 h-8 rounded-full border-2 border-white shadow-md ${col?.class}`} />
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button onClick={() => setWizardStep(1)} variant="outline" className="px-6 py-6 rounded-xl text-md font-bold">
                      <ChevronLeft className="w-5 h-5 mr-2" /> Back
                    </Button>
                    <Button onClick={() => setWizardStep(3)} className="bg-[#4A0404] text-white hover:bg-[#2A0001] px-8 py-6 rounded-xl text-md font-bold shadow-xl">
                      Next Step <ChevronRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: Budget */}
              {wizardStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="bg-gradient-to-br from-[#4A0404]/5 to-amber-500/5 p-8 rounded-3xl border border-amber-500/20">
                    <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center justify-center gap-2">
                      <Crown className="w-6 h-6 text-amber-600" /> Target Budget
                    </h3>

                    <div className="flex justify-center mb-8">
                      <div className="relative inline-flex items-baseline gap-1 bg-white px-8 py-4 rounded-2xl shadow-lg border border-slate-100">
                        <span className="text-2xl font-black text-amber-600">₹</span>
                        <input
                          type="number"
                          value={budget}
                          onChange={(e) => setBudget(Number(e.target.value))}
                          className="text-5xl font-black text-[#4A0404] w-48 text-center bg-transparent focus:outline-none"
                        />
                      </div>
                    </div>

                    <input
                      type="range"
                      min="5000"
                      max="200000"
                      step="5000"
                      value={budget}
                      onChange={(e) => setBudget(Number(e.target.value))}
                      className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#4A0404]"
                    />
                    <div className="flex justify-between text-sm font-bold text-slate-400 mt-3 px-1">
                      <span>₹5K</span>
                      <span>₹100K</span>
                      <span>₹200K+</span>
                    </div>
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button onClick={() => setWizardStep(2)} variant="outline" className="px-6 py-6 rounded-xl text-md font-bold">
                      <ChevronLeft className="w-5 h-5 mr-2" /> Back
                    </Button>
                    <Button onClick={startPlanGeneration} className="bg-gradient-to-r from-amber-500 to-yellow-600 text-white hover:opacity-90 px-8 py-6 rounded-xl text-md font-bold shadow-xl shadow-amber-500/20 group">
                      <Sparkles className="w-5 h-5 mr-2 group-hover:animate-spin" /> Generate Premium Concept
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* STEP 4: Loading State */}
              {wizardStep === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-24 flex flex-col items-center justify-center text-center space-y-10 relative overflow-hidden rounded-3xl"
                >
                  {/* Decorative background rays */}
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 z-0 opacity-10 pointer-events-none"
                    style={{
                      background: "repeating-conic-gradient(from 0deg, transparent 0deg 10deg, #f59e0b 10deg 20deg)"
                    }}
                  />

                  <div className="relative z-10 flex items-center justify-center mt-4">
                    {/* Expanding Rings */}
                    <motion.div
                      animate={{ scale: [1, 2, 3], opacity: [0.8, 0.3, 0] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut" }}
                      className="absolute w-28 h-28 border-[3px] border-amber-400 rounded-full"
                    />
                    <motion.div
                      animate={{ scale: [1, 2, 3], opacity: [0.8, 0.3, 0] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut", delay: 1 }}
                      className="absolute w-28 h-28 border-[3px] border-rose-400 rounded-full"
                    />

                    {/* Central Glowing Orb */}
                    <motion.div
                      animate={{ scale: [1, 1.1, 1], opacity: [0.9, 1, 0.9], rotate: [0, 360] }}
                      transition={{ scale: { duration: 2, repeat: Infinity }, rotate: { duration: 10, repeat: Infinity, ease: "linear" } }}
                      className="w-32 h-32 bg-gradient-to-tr from-[#4A0404] via-rose-800 to-amber-500 rounded-full flex items-center justify-center shadow-[0_0_60px_rgba(245,158,11,0.6)] relative"
                    >
                      <div className="absolute inset-1 border-[3px] border-dashed border-white/30 rounded-full" />
                      {React.createElement(LoadingStates[loadingTextIndex].icon, { className: "w-14 h-14 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] relative z-10" })}
                    </motion.div>

                    {/* Orbiting Sparkles */}
                    <motion.div
                      animate={{ rotate: -360 }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      className="absolute w-48 h-48 rounded-full border border-transparent"
                    >
                      <Sparkles className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-6 text-amber-500" />
                      <Sparkle className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-5 text-rose-500" />
                    </motion.div>
                  </div>

                  <div className="space-y-3 h-20 relative z-10">
                    <motion.h3
                      key={loadingTextIndex}
                      initial={{ opacity: 0, y: 10, filter: "blur(5px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#4A0404] to-amber-600"
                    >
                      {LoadingStates[loadingTextIndex].text}
                    </motion.h3>
                    <p className="text-slate-500 font-bold text-sm md:text-base animate-pulse">
                      Please wait, it will take some time to generate your premium live images...
                    </p>
                  </div>

                  <div className="w-72 h-3 bg-slate-100 rounded-full overflow-hidden relative z-10 shadow-inner">
                    <motion.div
                      className="h-full bg-gradient-to-r from-amber-400 via-rose-500 to-[#4A0404] relative"
                      initial={{ width: "0%" }}
                      animate={{ width: `${((loadingTextIndex + 1) / LoadingStates.length) * 100}%` }}
                      transition={{ duration: 0.8, ease: "easeInOut" }}
                    >
                      <div className="absolute inset-0 bg-white/20" />
                    </motion.div>
                  </div>
                </motion.div>
              )}

              {/* STEP 5: Concept Selection (A vs B) */}
              {wizardStep === 5 && aiPlan && (
                <motion.div
                  key="step5"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-black text-slate-800">Select Your Luxury Concept</h2>
                    <p className="text-slate-500 mt-2">Our AI has generated two distinct styles based on your preferences.</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Variation A */}
                    <div className="bg-white border-2 border-slate-100 rounded-3xl overflow-hidden hover:border-amber-400 transition-all shadow-lg group">
                      <div className="relative h-64 bg-slate-100">
                        <img src={aiPlan.variationAUrl} alt="Variation A" className="w-full h-full object-cover" />
                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-slate-800 shadow-sm">
                          Option A: Elegant Premium
                        </div>
                      </div>
                      <div className="p-6">
                        <h4 className="text-lg font-bold text-slate-800 mb-2">{aiPlan.themeName}</h4>
                        <p className="text-sm text-slate-500 line-clamp-2 mb-6">Refined styling with emphasis on sophisticated elegance and symmetry.</p>
                        <Button onClick={() => { setSelectedVariation("A"); setWizardStep(6); }} className="w-full bg-[#4A0404] hover:bg-[#2A0001] text-white py-6 rounded-xl font-bold">
                          Select Concept A
                        </Button>
                      </div>
                    </div>

                    {/* Variation B */}
                    <div className="bg-white border-2 border-slate-100 rounded-3xl overflow-hidden hover:border-amber-400 transition-all shadow-lg group">
                      <div className="relative h-64 bg-slate-100">
                        <img src={aiPlan.variationBUrl} alt="Variation B" className="w-full h-full object-cover" />
                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-slate-800 shadow-sm">
                          Option B: Creative Luxury
                        </div>
                      </div>
                      <div className="p-6">
                        <h4 className="text-lg font-bold text-slate-800 mb-2">{aiPlan.themeName}</h4>
                        <p className="text-sm text-slate-500 line-clamp-2 mb-6">Bold, artistic interpretation focusing on opulence and dramatic lighting.</p>
                        <Button onClick={() => { setSelectedVariation("B"); setWizardStep(6); }} className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:opacity-90 text-white py-6 rounded-xl font-bold">
                          Select Concept B
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 6: Final Selected Screen & WhatsApp Redirect */}
              {wizardStep === 6 && aiPlan && selectedVariation && (
                <motion.div
                  key="step6"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-8"
                >
                  <div className="relative h-80 md:h-[450px] rounded-3xl overflow-hidden shadow-2xl group border-4 border-white">
                    <img
                      src={selectedVariation === "A" ? aiPlan.variationAUrl : aiPlan.variationBUrl}
                      alt="Selected Concept"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />
                    
                    <div className="absolute top-6 left-6 flex gap-2 z-10">
                      <span className="bg-amber-500/90 backdrop-blur text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-lg flex items-center gap-2">
                        <Check className="w-4 h-4 stroke-[3px]" /> Concept {selectedVariation} Selected
                      </span>
                    </div>

                    <div className="absolute bottom-0 left-0 p-6 md:p-8 text-white w-full">
                      <h2 className="text-3xl md:text-4xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-500">{aiPlan.themeName}</h2>
                      
                      <div className="flex flex-wrap gap-3 items-center mb-8">
                        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20">
                          <Users className="w-4 h-4 text-amber-400" />
                          <span className="text-sm font-bold">{guestCount} Guests</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20">
                          <Crown className="w-4 h-4 text-amber-400" />
                          <span className="text-sm font-bold">₹{budget.toLocaleString()} Budget</span>
                        </div>
                      </div>

                      <Button 
                        onClick={() => {
                          const baseUrl = window.location.origin;
                          const imageUrl = `${baseUrl}/api/concept-image/${aiPlan._id}?opt=${selectedVariation}`;
                          
                          const msg = `Hello Alpha Events! 👑\n\nI just used your AI Event Architect and I absolutely love this luxury concept.\n\n*Theme:* ${aiPlan.themeName}\n*Budget:* ₹${budget.toLocaleString()}\n*Guests:* ${guestCount}\n*Colors:* ${selectedColors.join(", ")}\n*Selected Option:* ${selectedVariation}\n*Concept ID:* ${aiPlan._id}\n\n*Concept Image:* ${imageUrl}\n\nPlease check the availability for this and let me know how we can proceed!`;
                          
                          // Redirect to WhatsApp with the correct phone number
                          window.location.href = `https://wa.me/919302282860?text=${encodeURIComponent(msg)}`;
                        }} 
                        className="w-full sm:w-auto bg-[#25D366] hover:bg-[#128C7E] text-white px-8 py-7 rounded-2xl text-lg font-black shadow-[0_0_30px_rgba(37,211,102,0.4)] hover:shadow-[0_0_40px_rgba(37,211,102,0.6)] transition-all flex items-center justify-center gap-3 group"
                      >
                        <IoLogoWhatsapp className="w-8 h-8 group-hover:scale-110 transition-transform" /> 
                        Check Availability on WhatsApp
                      </Button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-center pt-2">
                    <Button onClick={resetForm} variant="ghost" className="text-slate-500 hover:text-slate-800 font-bold">
                      <RotateCcw className="w-4 h-4 mr-2" /> Design Another Concept
                    </Button>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
