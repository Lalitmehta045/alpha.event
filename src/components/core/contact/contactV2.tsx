"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import contactImg from "@/assets/images/img.png";
import CTAButtonV1 from "@/components/common/ctaButton/ctaButtonV1";
import HeadingV1 from "@/components/common/Texts/HeadingV1";
import ParagraphV1 from "@/components/common/Texts/paragraph";

export default function ContactV2() {
  return (
    <section className="w-full h-full max-h-5/6 md:max-h-10/12 lg:max-h-11/12 xl:max-h-full pt-32 sm:pt-28 md:pt-32 lg:pt-36 py-20 flex flex-col items-center justify-center text-center text-white px-0 sm:px-6 md:px-10 lg:px-20">
      <div className="w-11/12 mx-auto">
        {/* Section Heading */}
        <motion.section
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full text-start"
        >
          <HeadingV1
            text="We’re Here to Help"
            size="5xl"
            color="text-gray-900"
          />

          <ParagraphV1
            text="Our support team is always ready to assist you with any questions or feedback. 
          Drop us a line — we’ll respond as soon as possible."
            size="lg"
            color="text-gray-700"
            className="mt-3 max-w-2xl"
          />
        </motion.section>

        {/* Content Grid */}
        <div className="w-full max-w-11/12 mx-auto grid lg:grid-cols-2 gap-0 md:gap-12 items-center">
          {/* Left Side — Image */}
          <motion.div
            initial={{ opacity: 0, x: -80 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
            className="relative h-80 sm:h-[360px] md:h-[500px] "
          >
            <Image
              src={contactImg}
              alt="Contact Us"
              fill
              className="object-contain sm:object-cover object-center"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </motion.div>

          {/* Right Side — Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 80 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            viewport={{ once: true }}
          >
            <Card className="border border-gray-200 shadow-2xl">
              <CardContent className="p-8">
                <h2 className="text-4xl font-semibold mb-4 text-gray-900">
                  Get in Touch
                </h2>
                <p className="text-gray-800 mb-8">
                  Have questions, event inquiries, or custom NextRequests? Fill
                  out the form below and our team will get back to you shortly.
                </p>

                <form className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-4">
                    <Input
                      type="text"
                      placeholder="Full Name"
                      className="border-gray-300 py-5 focus:ring-2 focus:ring-black"
                    />
                    <Input
                      type="email"
                      placeholder="Email Address"
                      className="border-gray-300 py-5 focus:ring-2 focus:ring-black"
                    />
                  </div>

                  <Input
                    type="text"
                    placeholder="Subject"
                    className="border-gray-300 py-5 mb-4 focus:ring-2 focus:ring-black"
                  />

                  <Textarea
                    placeholder="Your Message"
                    className="border-gray-300 py-5 mb-4 focus:ring-2 focus:ring-black min-h-[120px]"
                  />

                  <CTAButtonV1
                    type="submit"
                    variant="secondary"
                    className="w-full py-7 rounded-lg"
                    text="Send Message"
                  />
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
