"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function Loading() {
  const [show, setShow] = useState(false);

  // Show loader only after 1 second delay
  useEffect(() => {
    const timer = setTimeout(() => setShow(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null; // Prevent flicker for fast loads

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-screen bg-linear-to-br from-indigo-100 via-purple-100 to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-500">
      {/* Spinner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1, rotate: 360 }}
        transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
        className="flex items-center justify-center mb-3"
      >
        <Loader2 className="w-10 h-10 text-indigo-600 dark:text-indigo-400 animate-spin" />
      </motion.div>

      {/* Text */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
        className="text-base font-medium text-gray-700 dark:text-gray-300"
      >
        Loading...
      </motion.p>
    </div>
  );
}
