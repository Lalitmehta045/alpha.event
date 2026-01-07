"use client";

import HeadingV1 from "@/components/common/Texts/HeadingV1";
import ParagraphV1 from "@/components/common/Texts/paragraph";
import { RootState } from "@/redux/store/store";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { BentoCard } from "@/components/ui/newbentogrid";
import { useRouter } from "next/navigation";
import { Category } from "@/@types/catregory";

export const valideURLConvert = (name: string) => {
  return name
    ?.toString()
    .replaceAll(" ", "-")
    .replaceAll(",", "-")
    .replaceAll("&", "-");
};

export const createSlug = (name: string, id: string) => {
  return `${name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/,/g, "-")
    .replace(/&/g, "-")}-${id}`;
};

const CategoryV2 = () => {
  const router = useRouter();

  const categoryData: Category[] = useSelector(
    (state: RootState) => state.product.allCategory
  );

  const handleRedirectProductListpage = (id: string, cat: string) => {
    const url = `/category/${createSlug(cat, id)}`;
    router.push(url);
  };
  return (
    <section className="bg-(--mainBg) w-full h-full max-h-5/6 md:max-h-10/12 lg:max-h-11/12 xl:max-h-full pt-32 sm:pt-28 md:pt-38 lg:pt-36 py-20 flex flex-col items-center justify-center text-center text-white px-0 sm:px-6 md:px-10 lg:px-20">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-11/12 text-start mb-10"
      >
        <HeadingV1
          text="Our Category"
          size="5xl"
          color="text-(--mainHeading2)"
        />
        <ParagraphV1
          text="Explore expert tips, event inspirations, and creative ideas to make your special day truly extraordinary."
          size="lg"
          color="text-(--secondaryParagraph)"
          className="mt-3 max-w-max"
        />
      </motion.section>

      {/* Simple Responsive Grid */}
      <div className="w-11/12 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 place-items-center md:place-items-start mx-auto">
        {categoryData.map((cat: any, index: number) => (
          <BentoCard
            key={cat._id}
            title={cat.name}
            image={cat.image}
            description={cat.description}
            onClick={() => handleRedirectProductListpage(cat._id, cat.name)}
            className="rounded-2xl cursor-pointer"
            loading={index === 0 ? "eager" : "lazy"}
            priority={index === 0}
          />
        ))}
      </div>
    </section>
  );
};

export default CategoryV2;
