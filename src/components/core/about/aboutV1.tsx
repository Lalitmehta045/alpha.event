"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import Company from "@/assets/images/company.jpg";
import ParagraphV1 from "@/components/common/Texts/paragraph";

const AboutV1 = () => {
  return (
    <section className="bg-(--mainBg) w-full h-full max-h-5/6 md:max-h-10/12 lg:max-h-11/12 xl:max-h-full pt-32 sm:pt-28 md:pt-32 lg:pt-36 py-20 flex flex-col items-center justify-center text-center text-white px-0 sm:px-6 md:px-10 lg:px-20">
      <div className="w-11/12 mx-auto grid xl:grid-cols-2 gap-15 lg:gap-10 items-center">
        {/* Left Side — Image */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="relative"
        >
          <div className="relative w-full max-w-sm md:max-w-xl xl:max-w-4xl mx-auto h-96 sm:h-[510px] rounded-2xl">
            <Image
              src={Company}
              alt="Alpha Art and Event"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 30vw"
              className="object-contain hover:scale-105 transition-transform duration-700"
            />
          </div>
          <div className="absolute -bottom-5 sm:bottom-8 md:-bottom-5 right-0 sm:right-12 md:right-26 lg:right-40 xl:right-8 bg-yellow-400 text-black px-6 py-3 rounded-lg font-semibold shadow-lg">
            Since 2014
          </div>
        </motion.div>

        {/* Right Side — Content */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="flex flex-col gap-8"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white text-center md:text-start leading-tight tracking-tight">
            About <span className="text-indigo-600">Alpha Art and Event</span>
          </h2>

          <ParagraphV1
            text="At Alpha Art and Event, we believe luxury doesn’t have to be owned — it can be rented. With Alpha Rentals, we make it easy for individuals, event planners, and businesses to access premium event décor, lighting, and props — all without the burden of buying and storing."
            size="lg"
            color="text-gray-200 text-start"
          />

          <ParagraphV1
            text="Whether it’s a wedding, photoshoot, festival, or corporate event, our curated rental collection ensures your venue looks breathtaking. We deliver, install, and pick up — so you can focus on what truly matters: creating memories."
            size="lg"
            color="text-gray-200 text-start"
          />

          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-md p-6 border border-white/40">
              <h3 className="text-xl font-semibold text-indigo-800 mb-2">
                Our Mission
              </h3>
              <p className="text-gray-900 font-medium leading-relaxed">
                To make professional-quality décor accessible, affordable, and
                sustainable through smart rentals.
              </p>
            </div>

            <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-md p-6 border border-white/40">
              <h3 className="text-xl font-semibold text-indigo-800 mb-2">
                Our Vision
              </h3>
              <p className="text-gray-900 font-medium leading-relaxed">
                To become Central India’s leading event rental brand known for
                quality, reliability, and creativity.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutV1;
