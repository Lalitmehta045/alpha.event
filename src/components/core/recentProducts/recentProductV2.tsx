"use client";

import HeadingV1 from "@/components/common/Texts/HeadingV1";
import ParagraphV1 from "@/components/common/Texts/paragraph";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import axios from "axios";

interface RecentItem {
  _id: string;
  image: string;
  title: string;
  description?: string;
}

export const RecentProductV2 = () => {
  const [recentProducts, setRecentProducts] = useState<RecentItem[]>([]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchRecentProducts = async () => {
      try {
        const res = await axios.get("/api/recent");
        if (res.data?.success && Array.isArray(res.data.data)) {
          setRecentProducts(res.data.data);
        }
      } catch (error) {
        console.error("Failed to load recent products", error);
      }
    };

    fetchRecentProducts();
  }, []);

  const toggleExpanded = (id: string) => {
    setExpanded(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };
  return (
    <section className="bg-(--mainBg) w-full h-full max-h-5/6 md:max-h-10/12 lg:max-h-11/12 xl:max-h-full pt-32 sm:pt-28 md:pt-38 lg:pt-36 py-20 flex flex-col items-center justify-center text-center text-white px-0 sm:px-6 md:px-10 lg:px-20">
      <div className="w-11/12 mx-auto">
        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full text-start mb-10"
        >
          <HeadingV1
            text="Our Recent Products"
            size="5xl"
            color="text-(--mainHeading2)"
          />
          <ParagraphV1
            text="Get inspired with expert tips and creative ideas designed to make your celebration one to remember."
            size="lg"
            color="text-(--secondaryParagraph)"
            className="mt-3 max-w-max"
          />
        </motion.section>

        {/* Blog Grid */}
        <section className="w-full mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {recentProducts.map((recent, index) => (
            <motion.div
              key={recent._id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card
                key={recent._id}
                className="group w-full h-68 sm:h-72 max-w-sm md:max-w-md lg:max-w-4xl mx-auto sm:mx-0 hover:shadow-xl transition-all duration-300 cursor-pointer"
              >
                <div className="relative w-full h-56 sm:h-64 md:h-60 lg:78 overflow-hidden">
                  <Image
                    src={recent.image}
                    alt={recent.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {recent.title}
                  </h3>
                  {recent.description && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">
                        {expanded.has(recent._id) ? recent.description : `${recent.description.substring(0, 100)}${recent.description.length > 100 ? '...' : ''}`}
                      </p>
                      {recent.description.length > 100 && (
                        <button
                          onClick={() => toggleExpanded(recent._id)}
                          className="text-blue-500 text-sm mt-1 hover:underline"
                        >
                          {expanded.has(recent._id) ? 'Read Less' : 'Read More'}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </section>
      </div>
    </section>
  );
};
