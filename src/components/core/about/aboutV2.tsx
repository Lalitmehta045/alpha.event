"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import sampleImg from "@/assets/images/DummyImg.jpg";
import ParagraphV1 from "@/components/common/Texts/paragraph";

const AboutV2 = () => {
  return (
    <section className="relative w-full  bg-linear-to-br from-[#ecf4f9] via-[#cde1f1] to-[#c0d8f3] py-20 px-6 md:px-12 lg:px-24">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-22 items-center">
        {/* Left Side — Image */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="relative"
        >
          <div className="relative w-11/12 h-[400px] rounded-2xl  shadow-2xl">
            <Image
              src={sampleImg}
              alt="Alpha Art and Event"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="w-full object-cover hover:scale-105 transition-transform duration-700"
            />
          </div>
          <div className="absolute -bottom-6 right-1 bg-yellow-400 text-black px-6 py-3 rounded-lg font-bold shadow-lg">
            Since 2020
          </div>
        </motion.div>

        {/* Right Side — Content */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="flex flex-col gap-6 text-black"
        >
          <h2 className="text-3xl md:text-4xl text-(--mainHeading1) font-bold leading-tight">
            About <span className="text-indigo-600">Alpha Art and Event</span>
          </h2>
          <p className="text-(--primaryParagraph) text-lg font-medium leading-relaxed">
            At <span className="font-bold">Alpha Art and Event</span>, we
            believe luxury doesn’t have to be owned — it can be rented. With{" "}
            <span className="font-medium">Alpha Rentals</span>, we make it easy
            for individuals, event planners, and businesses to access premium
            event décor, lighting, and props — all without the burden of buying
            and storing.
          </p>
          <ParagraphV1
            text="Whether it’s a wedding, photoshoot, festival, or corporate event,
            our curated rental collection ensures your venue looks breathtaking.
            We deliver, install, and pick up — so you can focus on what truly
            matters: creating memories."
            size="lg"
            color="text-(--primaryParagraph)"
            className="mt-1"
          />
          <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-md p-6 border border-white/40">
            <h3 className="text-xl font-bold text-indigo-800 mb-2">
              Our Mission
            </h3>

            <p className="text-(--primaryParagraph) font-medium">
              To make professional-quality décor accessible, affordable, and
              sustainable through smart rentals.
            </p>
          </div>
          <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-md p-6 border border-white/40">
            <h3 className="text-xl font-bold text-indigo-800 mb-2">
              Our Vision
            </h3>
            <p className="text-(--primaryParagraph) font-medium">
              To become Central India’s leading event rental brand known for
              quality, reliability, and creativity.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutV2;
