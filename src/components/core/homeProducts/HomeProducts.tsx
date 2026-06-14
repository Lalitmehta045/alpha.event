"use client";

import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store/store";
import { Product } from "@/@types/product";
import ProductCard from "@/components/core/product/ProductCard";
import HeadingV1 from "@/components/common/Texts/HeadingV1";
import ParagraphV1 from "@/components/common/Texts/paragraph";
import CTAButtonV1 from "@/components/common/ctaButton/ctaButtonV1";
import { FaArrowRight } from "react-icons/fa";
import { useRouter } from "next/navigation";

const HomeProducts = () => {
  const router = useRouter();
  const productData = useSelector(
    (state: RootState) => state.product.allProducts
  );
  
  const subCategories = useSelector(
    (state: RootState) => state.product.allSubCategory
  );

  const [productsToDisplay, setProductsToDisplay] = React.useState<Product[]>([]);

  React.useEffect(() => {
    if (productData.length === 0 || subCategories.length === 0) return;

    const selected: Product[] = [];
    const seenIds = new Set<string>();
    let totalProducts = 0;

    // Helper to shuffle array
    const shuffleArray = (arr: any[]) => [...arr].sort(() => Math.random() - 0.5);

    // Shuffle subcategories so we don't always pick the same ones first
    const shuffledSubCats = shuffleArray(subCategories);

    for (const subCat of shuffledSubCats) {
      if (totalProducts >= 32) break;

      const subCatProducts = productData.filter((prod) => {
        if (!prod.subCategory || !Array.isArray(prod.subCategory)) return false;
        return prod.subCategory.some((sc: any) => 
          typeof sc === 'string' ? sc === subCat._id : sc._id === subCat._id
        );
      });

      if (subCatProducts.length > 0) {
        // Shuffle products within this subcategory
        const shuffledSubCatProducts = shuffleArray(subCatProducts);

        // Filter out already selected products to avoid duplicate keys
        const uniqueProducts = shuffledSubCatProducts.filter(p => !seenIds.has(p._id));

        // Take up to 4 products from this subcategory
        const selectedProducts = uniqueProducts.slice(0, 4);
        
        // Ensure we don't exceed 32 total products
        const productsToAdd = selectedProducts.slice(0, 32 - totalProducts);
        
        if (productsToAdd.length > 0) {
          selected.push(...productsToAdd);
          productsToAdd.forEach(p => seenIds.add(p._id));
          totalProducts += productsToAdd.length;
        }
      }
    }

    // Shuffle the final selection so subcategories are mixed
    setProductsToDisplay(shuffleArray(selected));
  }, [productData, subCategories]);

  if (productsToDisplay.length === 0) {
    return null; // Don't show anything if there are no products
  }

  return (
    <section className="bg-(--mainBg1) w-full py-12 flex flex-col px-2 sm:px-6 md:px-10 lg:px-20">
      <div className="w-11/12 mx-auto flex flex-col gap-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {productsToDisplay.map((product) => (
            <ProductCard key={product._id} id={product._id} data={product} />
          ))}
        </div>

        <div className="flex justify-center mt-8">
          <CTAButtonV1
            variant="secondary"
            text="View More Products"
            icon={<FaArrowRight />}
            onClick={() => router.push("/products")}
            className="px-6 py-4"
          />
        </div>
      </div>
    </section>
  );
};

export default HomeProducts;
