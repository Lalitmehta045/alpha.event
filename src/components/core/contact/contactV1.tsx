"use client";

import Image from "next/image";
import contactImg from "@/assets/images/newcontactImg.png";
import HeadingV1 from "@/components/common/Texts/HeadingV1";
import ParagraphV1 from "@/components/common/Texts/paragraph";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import CTAButtonV1 from "@/components/common/ctaButton/ctaButtonV1";

export default function ContactV1() {
  return (
    <section className="w-full py-8 flex flex-col justify-start text-white px-2 sm:px-6 md:px-10 lg:px-20 ">
      {/* Heading Section */}
      <div className="w-11/12 mx-auto text-center md:text-left mb-10 sm:mb-2 lg:mb-12">
        <HeadingV1
          text="We’re Here to Help"
          size="3xl"
          color="text-(--mainHeading1)"
        />

        <ParagraphV1
          text="Our support team is always ready to assist you with any questions or feedback. 
          Drop us a line — we’ll respond as soon as possible."
          size="lg"
          color="text-(--primaryParagraph)"
          className="mt-2 text-justify"
        />
      </div>

      {/* Contact Section */}
      <div className="w-11/12 mx-auto grid grid-cols-1 lg:grid-cols-2 gap-0 md:gap-8 items-center ">
        {/* Left Side Image */}
        <div className="relative w-full hidden md:block h-[300px] sm:h-[400px] md:h-[500px] rounded-2xl">
          <Image
            src={contactImg}
            alt="Contact Us"
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>

        {/* Right Side Form */}
        <Card className="border border-gray-200 shadow-lg order-1 md:order-2">
          <CardContent className="p-6 sm:p-8">
            <h2 className="text-2xl sm:text-3xl font-semibold mb-4 text-(--mainHeading1)">
              Get in Touch
            </h2>
            <p className="text-(--primaryParagraph) mb-8 text-sm sm:text-base">
              Have questions, event inquiries, or custom NextRequests? Fill out
              the form below and our team will get back to you shortly.
            </p>

            <form className="space-y-5">
              {/* Name + Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Input
                  type="text"
                  placeholder="Full Name"
                  className="border-gray-300 py-4 sm:py-5 focus:ring-2 focus:ring-black"
                />
                <Input
                  type="email"
                  placeholder="Email Address"
                  className="border-gray-300 py-4 sm:py-5 focus:ring-2 focus:ring-black"
                />
              </div>

              {/* Subject */}
              <Input
                type="text"
                placeholder="Subject"
                className="border-gray-300 py-4 sm:py-5 focus:ring-2 focus:ring-black"
              />

              {/* Message */}
              <Textarea
                placeholder="Your Message"
                className="border-gray-300 py-4 sm:py-5 focus:ring-2 focus:ring-black min-h-[120px]"
              />

              {/* Submit Button */}
              <CTAButtonV1
                type="submit"
                variant="secondary"
                className="w-full py-6 sm:py-7 rounded-lg"
                text="Send Message"
              />
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
