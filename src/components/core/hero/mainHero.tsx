"use client";

import React, { useState } from "react";
import ContainerV1 from "@/app/(public)/layout/containerV1";
import SearchBar from "@/components/common/searchBar/searchBar";
import CategoryV1 from "@/components/core/category/categoryV1";
import bgImage from "../../../../public/desktop-banner.jpeg";
import { motion } from "framer-motion";
import { FaMapMarkerAlt } from "react-icons/fa";

const ComingSoon = ({ location }: { location: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -30 }}
    transition={{ duration: 0.6, ease: "easeOut" }}
    className="flex flex-col items-center justify-center py-20 px-4 text-center mt-12 w-full max-w-4xl mx-auto rounded-3xl bg-black/40 backdrop-blur-md border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]"
  >
    <motion.div
      initial={{ scale: 0.8 }}
      animate={{ scale: 1 }}
      transition={{
        repeat: Infinity,
        repeatType: "reverse",
        duration: 1.5,
        ease: "easeInOut",
      }}
      className="w-20 h-20 mb-6 bg-gradient-to-br from-[#9c6567] to-[#3a0103] rounded-full flex items-center justify-center shadow-2xl"
    >
      <FaMapMarkerAlt className="text-3xl text-white" />
    </motion.div>

    <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight drop-shadow-lg">
      Coming Soon in <span className="text-[#ffccd5]">{location}</span>
    </h2>
    <p className="text-lg md:text-xl text-gray-200 max-w-2xl font-light drop-shadow-md">
      We are working hard to bring our premium event rentals and decorations to your city. Stay tuned for updates!
    </p>
  </motion.div>
);

const MainHero = () => {
  const [location, setLocation] = useState("Indore");

  return (
    <section
      className="bg-cover bg-[position:60%_top] bg-no-repeat w-full min-h-screen pt-24 sm:pt-40 md:pt-32 lg:pt-32 flex flex-col items-center justify-center text-center text-white px-0 sm:px-6 md:px-10 lg:px-20"
      style={{ backgroundImage: `url(${bgImage.src})` }}
    >
      {/* Hero Content */}
      <ContainerV1>
        <SearchBar onLocationChange={setLocation} />
        {["Bhopal", "Jabalpur"].includes(location) ? <ComingSoon location={location} /> : <CategoryV1 />}
      </ContainerV1>
    </section>
  );
};

export default MainHero;
