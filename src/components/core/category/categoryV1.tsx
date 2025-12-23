"use client";

import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import React from "react";
import { RootState } from "@/redux/store/store";
import { BentoCard } from "@/components/ui/newbentogrid";

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

const CategoryV1: React.FC = () => {
  const router = useRouter();

  const categoryData = useSelector(
    (state: RootState) => state.product.allCategory
  );

  const handleRedirectProductListpage = (id: string, cat: string) => {
    const url = `/category/${createSlug(cat, id)}`;
    router.push(url);
  };

  // /${valideURLConvert(subcategory.name)}-${subcategory._id}

  return (
    <section className="py-8 px-0 md:px-8 mx-auto">
      <div className="max-w-max grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 place-items-center md:place-items-start mx-auto">
        {categoryData.map((cat: any) => (
          <BentoCard
            key={cat._id}
            title={cat.name}
            image={cat.image}
            description={cat.description}
            onClick={() => handleRedirectProductListpage(cat._id, cat.name)}
            className="rounded-2xl cursor-pointer"
          />
        ))}
      </div>
    </section>
  );
};

export default CategoryV1;
