"use client";

import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store/store";
import { Product } from "@/@types/product";
import ProductCard from "@/components/core/product/ProductCard";
import { HiArrowRight, HiSparkles } from "react-icons/hi2";
import Link from "next/link";

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

let handledReload = false;

// Check if this page load was triggered by a manual reload (F5 / Ctrl+R)
function isManualReload(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (handledReload) return false;

    const navEntries = performance.getEntriesByType("navigation") as PerformanceNavigationTiming[];
    const isReload = navEntries.length > 0 && navEntries[0].type === "reload";
    
    if (isReload) {
      handledReload = true;
      return true;
    }
    return false;
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
      if (totalProducts >= 16) break;

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
        const productsToAdd = selectedProducts.slice(0, 16 - totalProducts);
        
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
    <section className="bg-[#f8efde] w-full py-12 flex flex-col px-2 sm:px-6 md:px-10 lg:px-20">
      <div className="w-11/12 mx-auto flex flex-col gap-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {productsToDisplay.map((product) => (
            <ProductCard key={product._id} id={product._id} data={product} />
          ))}
        </div>

        {/* Premium View More Section */}
        <div className="flex flex-col items-center gap-6 mt-4">
          {/* Gradient divider */}
          <div className="w-full max-w-md h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />

          <Link
            href="/products"
            className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-[var(--cta-Bg)] to-[color-mix(in_srgb,var(--cta-Bg),#000_15%)] text-white font-semibold text-base shadow-lg shadow-[var(--cta-Bg)]/25 hover:shadow-xl hover:shadow-[var(--cta-Bg)]/35 hover:-translate-y-0.5 active:translate-y-0 active:shadow-md transition-all duration-300 overflow-hidden"
          >
            {/* Shimmer effect */}
            <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/15 to-transparent" />

            <HiSparkles className="text-white/80 text-lg relative z-10" />
            <span className="relative z-10">View More Products</span>
            <HiArrowRight className="text-lg relative z-10 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>


        </div>
      </div>
    </section>
  );
};

export default HomeProducts;

