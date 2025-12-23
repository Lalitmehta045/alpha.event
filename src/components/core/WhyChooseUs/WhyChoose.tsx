"use client";

import CTAButtonV1 from "@/components/common/ctaButton/ctaButtonV1";
import HeadingV1 from "@/components/common/Texts/HeadingV1";
import { NumberTicker } from "@/components/ui/number-ticker";
import { motion } from "framer-motion";
import { FaArrowRight } from "react-icons/fa";

const WhyChooseUs = () => {
  return (
    <section className="relative w-full bg-neutral-800 text-white py-14 sm:py-20 px-4 sm:px-8 lg:px-16">
      <div className="max-w-5/6 mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-start">
        {/* Left Side — Heading & Button */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="flex flex-col gap-6 text-center md:text-left"
        >
          <HeadingV1
            text="Why Choose Us for Your Event Styling Needs?"
            size="4xl"
            className="leading-tight text-white ml-3 md:ml-0"
          />

          <CTAButtonV1
            variant="secondary"
            className="w-fit ml-3 md:m-0"
            text="Read All Blogs"
            icon={<FaArrowRight />}
          />
        </motion.div>

        {/* Right Side — Text & Stats */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="flex flex-col gap-8 text-center md:text-left"
        >
          {/* Description */}
          <p className="text-gray-200 text-base sm:text-lg leading-relaxed">
            We believe every celebration deserves to feel special. Our curated
            prop collections and design services help you create an atmosphere
            that tells your story beautifully — without the stress of owning or
            managing bulky décor.
          </p>

          {/* Stats */}
          <div className="flex flex-col sm:flex-row gap-8 sm:gap-14 justify-center md:justify-start">
            {/* Stat 1 */}
            <div>
              <p className="text-4xl font-bold flex items-baseline justify-center md:justify-start">
                <NumberTicker
                  value={99}
                  delay={0.8}
                  className="text-4xl font-extrabold tracking-tight text-white"
                />
                <span className="text-2xl font-semibold ml-1">%</span>
              </p>
              <p className="text-gray-400 text-sm sm:text-base mt-2 leading-snug">
                Customer <br className="hidden sm:block" /> Satisfaction Rate
              </p>
            </div>

            {/* Stat 2 */}
            <div>
              <p className="text-4xl font-bold flex items-baseline justify-center md:justify-start">
                <NumberTicker
                  value={100}
                  delay={1}
                  className="text-4xl font-extrabold tracking-tight text-white"
                />
                <span className="text-2xl font-semibold ml-1">%</span>
              </p>
              <p className="text-gray-400 text-sm sm:text-base mt-2 leading-snug">
                Quality & On-Time <br className="hidden sm:block" /> Delivery
                Guarantee
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
