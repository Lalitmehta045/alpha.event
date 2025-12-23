"use client";

import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import LayoutV2 from "../../layout/layoutV2";
import HeadingV1 from "@/components/common/Texts/HeadingV1";
import ParagraphV1 from "@/components/common/Texts/paragraph";
import { RootState } from "@/redux/store/store";
import { motion } from "framer-motion";
import { getAllCategory } from "@/services/operations/category";
import { getAllSubCategory } from "@/services/operations/subcategory";
import { getAllProduct } from "@/services/operations/product";
import CTASection from "@/components/common/ctaButton/ctaSection";
import { useEffect, useState } from "react";
import { BentoCard } from "@/components/ui/newbentogrid";
import SimpleLoading from "../loading";
import { getAllCartItems } from "@/services/operations/cartItem";
import SubCategorySlug from "@/components/core/subcategory/subcategorySlug";
import { ArrowRight, ShoppingBag } from "lucide-react";
import Link from "next/link";

export default function CategoryResolverPage() {
  const { slugParts } = useParams<{ slugParts: string[] }>();
  const router = useRouter();
  const dispatch = useDispatch();

  const categories = useSelector(
    (state: RootState) => state.product.allCategory
  );
  const subCategories = useSelector(
    (state: RootState) => state.product.allSubCategory
  );
  const productData = useSelector(
    (state: RootState) => state.product.allProducts
  );

  const [isLoaded, setIsLoaded] = useState(false);

  const fetchData = async () => {
    try {
      await Promise.all([
        getAllCategory(dispatch),
        getAllSubCategory(dispatch),
        getAllProduct(dispatch),
        getAllCartItems(),
      ]);
      setIsLoaded(true);
    } catch (error) {
      console.log("Fetch error:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ⛔ Stop rendering until all data fully fetched
  if (!isLoaded) {
    return <SimpleLoading />;
  }

  if (!slugParts || slugParts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] px-4 py-12 text-center sm:px-8 sm:py-16 lg:px-16 lg:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-xl sm:max-w-2xl lg:max-w-3xl mx-auto"
        >
          {/* Icon / Placeholder */}
          <div className="mx-auto w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 bg-yellow-500 rounded-full flex items-center justify-center mb-6 shadow-lg">
            <ShoppingBag
              className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 text-gray-900"
              strokeWidth={2.5}
            />
          </div>

          {/* Heading */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4 sm:mb-6 tracking-tight">
            Something Exciting is Coming!
          </h2>

          {/* Description */}
          <p className="text-gray-200 text-base sm:text-lg lg:text-xl mb-8 sm:mb-10 leading-relaxed">
            We’re currently working on this category. Amazing products will
            appear here soon. Stay tuned—you won’t want to miss it!
          </p>

          {/* Explore button */}
          <Link
            href="/category"
            className="inline-flex items-center justify-center px-6 sm:px-8 lg:px-10 py-3 sm:py-4 bg-white text-[#610C04] font-bold text-base sm:text-lg lg:text-xl rounded-full shadow-lg hover:bg-gray-100 transition-all duration-300 transform hover:-translate-y-1"
          >
            Explore Other Categories
            <ArrowRight className="ml-2 sm:ml-3 w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-[#610C04]" />
          </Link>
        </motion.div>
      </div>
    );
  }

  const [categorySlug, subSlug] = slugParts;

  const extractId = (slug: string) => slug.split("-").pop();

  const categoryId: any = extractId(categorySlug);
  const subCategoryId: any = subSlug ? extractId(subSlug) : null;

  const category: any = categories.find((c) => c._id === categoryId);
  const subCategory: any = subCategories.find((s) => s._id === subCategoryId);

  // CASE 1: CATEGORY PAGE
  if (slugParts.length === 1) {
    const subCatsOfCategory = subCategories.filter(
      (s) => s.category?._id === categoryId
    );

    return (
      <div className="relative flex flex-col gap-10 w-full mx-auto h-min items-center font-sans bg-(--mainBg)">
        <LayoutV2>
          <section className="relative mt-20 md:mt-28 w-11/12 flex flex-col items-start justify-start min-h-min py-10 md:py-10 px-2 sm:px-6 md:px-16 lg:px-20">
            <motion.section
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="w-full text-start mb-5"
            >
              <HeadingV1
                text={category.name}
                size="5xl"
                color="text-(--mainHeading2)"
              />
              <ParagraphV1
                text={category.description}
                size="lg"
                color="text-(--secondaryParagraph)"
                className="mt-3 max-w-max"
              />
            </motion.section>

            <div className="w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-14 mt-3 mx-auto md:mt-10">
              {subCatsOfCategory.map((sub, index) => {
                const subUrl = `/category/${categorySlug}/${sub.name
                  .toLowerCase()
                  .replace(/\s+/g, "-")}-${sub._id}`;

                return (
                  <motion.div
                    key={sub._id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <BentoCard
                      key={sub._id}
                      title={sub.name}
                      image={sub.image as any}
                      onClick={() => router.push(subUrl)}
                      className="rounded-2xl cursor-pointer"
                    />
                  </motion.div>
                );
              })}
            </div>
          </section>

          {/* CTA Section */}
          <CTASection />
        </LayoutV2>
      </div>
    );
  }

  // CASE 2: SUBCATEGORY PAGE
  if (slugParts.length === 2) {
    const filteredProducts = productData.filter((p) =>
      p.subCategory?.includes(subCategoryId)
    );

    return (
      <div className="relative flex flex-col gap-10 w-full mx-auto h-min items-center font-sans bg-(--mainBg)">
        <LayoutV2>
          <SubCategorySlug
            category={category}
            subCategory={subCategory}
            data={filteredProducts}
          />

          {/* CTA Section */}
          <CTASection />
        </LayoutV2>
      </div>
    );
  }

  return <div>Invalid route depth</div>;
}
