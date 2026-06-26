"use client";

import React from "react";
import { motion } from "framer-motion";
import { IoLogoWhatsapp } from "react-icons/io";

const WhatsAppButton = () => {
  const handleWhatsAppClick = () => {
    const phoneNumber = "919302282860"; // Same as in AIPlannerModal
    const defaultMessage = encodeURIComponent("Hello Alpha Events! I am interested in your services.");
    window.open(`https://wa.me/${phoneNumber}?text=${defaultMessage}`, "_blank");
  };

  return (
    <div className="fixed bottom-36 md:bottom-24 right-4 md:right-8 z-50 pointer-events-auto">
      <motion.button
        onClick={handleWhatsAppClick}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          type: "spring",
          stiffness: 260,
          damping: 20 
        }}
        className="group relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-[#25D366] text-white rounded-full shadow-[0_4px_14px_0_rgba(37,211,102,0.39)] hover:shadow-[0_6px_20px_rgba(37,211,102,0.5)] transition-shadow duration-300"
        aria-label="Chat on WhatsApp"
      >
        {/* Pulsing rings effect */}
        <div className="absolute inset-0 rounded-full animate-ping opacity-20 bg-[#25D366]"></div>
        
        <IoLogoWhatsapp className="w-8 h-8 sm:w-9 sm:h-9 relative z-10" />

        {/* Tooltip */}
        <div className="absolute right-full mr-4 px-3 py-1.5 bg-white text-slate-800 text-sm font-bold rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 whitespace-nowrap border border-slate-100 flex items-center gap-2">
          Need help? Chat with us!
          <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 bg-white rotate-45 border-t border-r border-slate-100"></div>
        </div>
      </motion.button>
    </div>
  );
};

export default WhatsAppButton;
