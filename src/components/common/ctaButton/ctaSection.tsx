"use client";

import { motion } from "framer-motion";
import { SlCallOut } from "react-icons/sl";
import CTAButtonV1 from "./ctaButtonV1";

const CTASection = () => {
  return (
    <section className="w-full mx-auto py-14 px-2 text-white text-center">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-3xl md:text-4xl font-bold mb-4"
      >
        Ready to Create Your Dream Event?
      </motion.h2>
      <p className="text-lg tracking-wide text-indigo-100 mb-8">
        Let’s make your occasion unforgettable — elegant décor, flawless
        coordination, and unique experiences.
      </p>
      {/* <Button
        variant="secondary"
        className="text-indigo-700 bg-white hover:bg-gray-100 font-semibold text-lg px-8 py-6"
      >
        Contact Us <SlCallOut fontSize={40} />
      </Button> */}

      <CTAButtonV1
        variant="secondary"
        text="Contact Us"
        href="tel:+919876543210"
        icon={<SlCallOut fontSize={20} fontWeight={900} width={0} height={0} />}
        // onClick={() => router.push("/auth/sign-in")}
        className="text-gray-900 w-max bg-white mx-auto font-semibold text-lg px-8 py-6"
      />
    </section>
  );
};

export default CTASection;
