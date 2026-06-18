"use client";

import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store/store";
import { Product } from "@/@types/product";
import ProductCard from "@/components/core/product/ProductCard";
import HeadingV1 from "@/components/common/Texts/HeadingV1";
import ParagraphV1 from "@/components/common/Texts/paragraph";
import CTAButtonV1 from "@/components/common/ctaButton/ctaButtonV1";
import { FaArrowRight } from "react-icons/fa";
import { useRouter } from "next/navigation";

const STORAGE_KEY = "home_products_order";

// Simple array shuffle (Fisher-Yates)
function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Check if this page load was triggered by a manual reload (F5 / Ctrl+R)
function isManualReload(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const navEntries = performance.getEntriesByType("navigation") as PerformanceNavigationTiming[];
    return navEntries.length > 0 && navEntries[0].type === "reload";
  } catch {
    return false;
  }
}

// Get saved product order from sessionStorage
function getSavedOrder(): string[] | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

// Save product order to sessionStorage
function saveOrder(ids: string[]): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // sessionStorage might be full or disabled
  }
}

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

    // On manual reload (F5), clear saved order so products re-shuffle
    if (isManualReload()) {
      sessionStorage.removeItem(STORAGE_KEY);
    }

    // Try to restore saved order (for back navigation / normal navigation)
    const savedOrder = getSavedOrder();
    if (savedOrder && savedOrder.length > 0) {
      // Build a map for quick product lookup
      const productMap = new Map<string, Product>();
      productData.forEach(p => productMap.set(p._id, p));

      // Reconstruct products in the saved order
      const restored = savedOrder
        .map(id => productMap.get(id))
        .filter((p): p is Product => !!p);

      if (restored.length > 0) {
        setProductsToDisplay(restored);
        return; // Use saved order, skip shuffle
      }
    }

    // No saved order (first visit or after reload) — generate fresh shuffle
    const selected: Product[] = [];
    const seenIds = new Set<string>();
    let totalProducts = 0;

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
        const shuffledSubCatProducts = shuffleArray(subCatProducts);
        const uniqueProducts = shuffledSubCatProducts.filter(p => !seenIds.has(p._id));
        const selectedProducts = uniqueProducts.slice(0, 4);
        const productsToAdd = selectedProducts.slice(0, 32 - totalProducts);
        
        if (productsToAdd.length > 0) {
          selected.push(...productsToAdd);
          productsToAdd.forEach(p => seenIds.add(p._id));
          totalProducts += productsToAdd.length;
        }
      }
    }

    const finalProducts = shuffleArray(selected);
    
    // Save the shuffled order for future back navigations
    saveOrder(finalProducts.map(p => p._id));
    setProductsToDisplay(finalProducts);
  }, [productData, subCategories]);

  if (productsToDisplay.length === 0) {
    return null;
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

