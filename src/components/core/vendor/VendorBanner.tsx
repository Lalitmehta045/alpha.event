// src/components/core/vendor/VendorBanner.tsx
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FiArrowRight, FiPackage, FiTrendingUp, FiShield, FiLayout } from "react-icons/fi";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store/store";

const perks = [
  {
    icon: <FiPackage className="text-amber-400 text-xl" />,
    title: "Upload Products",
    desc: "List your rental items with photos & pricing",
  },
  {
    icon: <FiTrendingUp className="text-amber-400 text-xl" />,
    title: "Grow Sales",
    desc: "Reach thousands of customers in Indore",
  },
  {
    icon: <FiShield className="text-amber-400 text-xl" />,
    title: "Secure Platform",
    desc: "Your products & payments, fully protected",
  },
];

export default function VendorBanner() {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const isVendor = isAuthenticated && user && (user as any)?.role === "VENDOR";

  return (
    <section className="w-full py-2 md:py-16 px-2 sm:px-6 md:px-10 lg:px-20 bg-[#f8efde]">
      <div className="w-full sm:w-11/12 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative rounded-2xl md:rounded-3xl overflow-hidden bg-gradient-to-br from-[#1a0a00] via-[#2d1200] to-[#0f0500] p-3 md:p-12 shadow-2xl"
        >
          {/* Background dots pattern */}
          <div
            className="absolute inset-0 opacity-[0.06] pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(circle at 20px 20px, #f59e0b 1.5px, transparent 0)`,
              backgroundSize: "40px 40px",
            }}
          />

          {/* Glow orbs */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-3 lg:gap-10">
            {/* Left: Text */}
            <div className="flex-1 text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-1.5 md:gap-2 bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[9px] md:text-xs font-semibold px-2 py-1 md:px-4 md:py-2 rounded-full mb-2 md:mb-6 tracking-wide uppercase">
                <span className="w-1 h-1 md:w-1.5 md:h-1.5 bg-amber-400 rounded-full animate-pulse" />
                Vendor Program
              </div>

              <h2 className="text-lg md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-1 md:mb-4">
                Grow Your Business
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">
                  with Alpha
                </span>
              </h2>

              <p className="hidden md:block text-gray-400 text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed lg:mb-0">
                Join our vendor network. Upload your event decoration products, 
                reach thousands of customers in Indore, and manage everything 
                from one simple dashboard.
              </p>
            </div>

            {/* Right: Perks + CTA */}
            <div className="flex-1 w-full max-w-md mx-auto space-y-3 md:space-y-6">
              {/* Perks list */}
              <div className="grid grid-cols-3 md:grid-cols-1 gap-2 md:gap-3">
                {perks.map((perk, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 + 0.3, duration: 0.5 }}
                    className="flex flex-col md:flex-row items-center md:items-start gap-1 md:gap-4 p-1.5 md:p-4 bg-white/5 border border-white/10 rounded-lg md:rounded-2xl backdrop-blur-sm hover:bg-white/8 transition-colors duration-200 text-center md:text-left"
                  >
                    <div className="w-6 h-6 md:w-10 md:h-10 bg-amber-500/15 rounded-md md:rounded-xl flex items-center justify-center flex-shrink-0">
                      <div className="scale-[0.6] md:scale-100">{perk.icon}</div>
                    </div>
                    <div className="flex flex-col justify-center">
                      <p className="text-white font-semibold text-[9px] md:text-sm leading-tight">{perk.title}</p>
                      <p className="hidden md:block text-gray-400 text-xs mt-0.5 leading-tight">{perk.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-row gap-2 md:gap-3">
                {isVendor ? (
                  <Link
                    href="/vendor"
                    className="group w-full flex items-center justify-center gap-1.5 md:gap-2 px-3 py-2 md:px-6 md:py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs md:text-base rounded-lg md:rounded-2xl transition-all duration-200 shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:-translate-y-0.5"
                  >
                    <FiLayout className="text-sm md:text-lg" />
                    Dashboard
                    <FiArrowRight className="transition-transform duration-200 group-hover:translate-x-1 hidden md:block" />
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/auth/vendor-login"
                      className="flex-1 flex items-center justify-center gap-1.5 md:gap-2 px-2 py-2 md:px-6 md:py-4 bg-white/10 hover:bg-white/15 text-white font-semibold text-[10px] md:text-base rounded-lg md:rounded-2xl border border-white/20 transition-all duration-200 hover:-translate-y-0.5"
                    >
                      Login
                    </Link>

                    <Link
                      href="/auth/vendor-register"
                      className="group flex-1 flex items-center justify-center gap-1.5 md:gap-2 px-2 py-2 md:px-6 md:py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold text-[10px] md:text-base rounded-lg md:rounded-2xl transition-all duration-200 shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:-translate-y-0.5"
                    >
                      Register
                      <FiArrowRight className="transition-transform duration-200 group-hover:translate-x-1 hidden md:block" />
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}