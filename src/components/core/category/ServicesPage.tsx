"use client";

import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store/store";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FiArrowRight } from "react-icons/fi";
import { createSlug } from "@/components/core/category/categoryV2";
import { Category, SubCategory } from "@/@types/catregory";
import Link from "next/link";

const ServicesPage = () => {
  const router = useRouter();
  const categories = useSelector(
    (state: RootState) => state.product.allCategory
  );
  const subCategories = useSelector(
    (state: RootState) => state.product.allSubCategory
  );

  const handleExploreClick = (id: string, catName: string) => {
    router.push(`/category/${createSlug(catName, id)}`);
  };

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="w-full bg-[#550000] text-white pt-32 pb-16 px-4 text-center">
        <span className="inline-block border border-amber-500 text-amber-500 text-xs font-bold uppercase tracking-wide px-3 py-1 rounded-full mb-4">
          What We Offer
        </span>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Services</h1>
        <p className="text-gray-300 max-w-2xl mx-auto text-lg">
          From intimate gatherings to grand celebrations — explore our complete range of event services and find exactly what you need.
        </p>
      </section>

      {/* SECTION 2 — TAG CLOUD */}
      <section className="bg-[#f8efde] py-20 px-4 sm:px-10 lg:px-20">
        <div className="max-w-5xl mx-auto">
          {/* Heading */}
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-[#7c0a1e] mb-2">
              Everything We Offer
            </h2>
            <p className="text-gray-500 text-sm">
              Click any service to explore products
            </p>
          </div>

          {/* Tag Cloud — ALL subcategories mixed, no grouping */}
          {subCategories.length === 0 ? (
            // Skeleton loading
            <div className="flex flex-col gap-3 max-w-lg mx-auto px-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="h-14 w-full bg-gray-200 rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-3 max-w-lg mx-auto px-2">
              {(() => {
                // Rearrange to put "Cakes And More" in the middle if it's at the top
                const list = [...subCategories];
                const cakeIndex = list.findIndex(s => s.name.toLowerCase().includes('cake'));
                if (cakeIndex !== -1 && cakeIndex < 2) { // if it's near the top
                  const cakeItem = list.splice(cakeIndex, 1)[0];
                  const middleIndex = Math.floor(list.length / 2);
                  list.splice(middleIndex, 0, cakeItem);
                }
                
                return list.map((sub: SubCategory, index: number) => {
                  // Find parent category to build correct URL
                  const parentCat = categories.find(
                    (c: Category) =>
                      c._id === sub.category._id ||
                      c._id === (sub.category as any)
                  );
                  return (
                    <motion.button
                      key={sub._id}
                      onClick={() => {
                        if (parentCat) {
                          router.push(
                            `/category/${createSlug(
                              parentCat.name,
                              parentCat._id
                            )}`
                          );
                        }
                      }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03, duration: 0.2 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full flex items-center justify-between px-6 py-4 rounded-xl border border-[#7c0a1e]/20 bg-white text-[#7c0a1e] text-base font-medium hover:bg-[#7c0a1e] hover:text-white transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer group"
                    >
                      <span>{sub.name}</span>
                      <FiArrowRight className="text-[#7c0a1e]/50 group-hover:text-white group-hover:translate-x-1 transition-all" />
                    </motion.button>
                  );
                });
              })()}
            </div>
          )}

          {/* Category strip below tags */}
          <div className="mt-16 pt-8 border-t border-[#7c0a1e]/10">
            <p className="text-xs text-gray-400 text-center mb-5 uppercase tracking-widest">
              Browse by Category
            </p>
            <div className="flex flex-col gap-3 max-w-lg mx-auto px-2">
              {categories.map((cat: Category) => (
                <button
                  key={cat._id}
                  onClick={() =>
                    router.push(`/category/${createSlug(cat.name, cat._id)}`)
                  }
                  className="w-full flex items-center justify-between px-6 py-3.5 rounded-xl bg-[#7c0a1e]/5 border border-[#7c0a1e]/10 text-[#7c0a1e] text-sm font-semibold hover:bg-[#7c0a1e] hover:text-white transition-all duration-200 group"
                >
                  <span>{cat.name}</span>
                  <FiArrowRight className="text-[#7c0a1e]/40 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA Section */}
      <section className="bg-[#7c0a1e] py-16 px-4 text-center text-white">
        <h2 className="text-3xl font-bold mb-4">
          Can't find what you're looking for?
        </h2>
        <p className="text-gray-300 mb-8 max-w-lg mx-auto">
          Contact us and we'll create a custom package for your event.
        </p>
        <Link
          href="/contact"
          className="inline-block bg-white text-[#7c0a1e] font-bold rounded-full px-8 py-3 hover:bg-gray-100 transition-colors"
        >
          Get in Touch
        </Link>
      </section>
    </div>
  );
};

export default ServicesPage;
