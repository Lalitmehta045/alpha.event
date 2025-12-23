"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import CTAButtonV1 from "../ctaButton/ctaButtonV1";
import { FaArrowRight } from "react-icons/fa";

export default function FAQSection() {
  const faqs = [
    {
      question: "Q1: How does the rental process work?",
      answer:
        "Simply browse our collection, select the props you need, and place a booking NextRequest. We’ll confirm availability and handle delivery, setup, and pickup.",
    },
    {
      question: "Q2: Do you offer event setup and styling services?",
      answer:
        "Yes! Our team provides full setup and styling services to make your event look amazing without any hassle on your part.",
    },
    {
      question: "Q3: Can I customize props or NextRequest a theme?",
      answer:
        "Absolutely! We love custom ideas — let us know your theme or vision, and we’ll work with you to bring it to life.",
    },
    {
      question: "Q4: What is your rental duration?",
      answer:
        "Our standard rental duration is 24 hours, but we can adjust it based on your event’s needs and availability.",
    },
  ];

  return (
    <section className="w-full py-10 sm:py-16 px-4 md:px-8">
      <div className="max-w-5/6 mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
        {/* LEFT SECTION */}
        <div className="w-full md:w-5/12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-(--mainHeading1) mb-6 leading-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-(--primaryParagraph) font-medium text-base sm:text-lg mb-6">
            Get quick answers to the most common questions about our rental
            process, customization options, and more.
          </p>
          <div className="mt-2">
            <CTAButtonV1
              variant="secondary"
              text="Read All Blogs"
              icon={<FaArrowRight />}
            />
          </div>
        </div>

        {/* RIGHT SECTION (FAQ Accordion) */}
        <div className="w-full md:w-7/12">
          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300"
              >
                <AccordionTrigger className="text-left text-gray-900 font-semibold py-5 px-6 sm:text-base text-sm">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-800 font-medium text-sm sm:text-base px-6 pb-5 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
