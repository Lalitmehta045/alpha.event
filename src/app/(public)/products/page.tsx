"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useSearchParams, useRouter } from "next/navigation";
import { RootState } from "@/redux/store/store";
import { Product } from "@/@types/product";
import ProductCard from "@/components/core/product/ProductCard";
import LayoutV2 from "../layout/layoutV2";
import { getAllCategory } from "@/services/operations/category";
import { getAllSubCategory } from "@/services/operations/subcategory";
import { getAllProduct } from "@/services/operations/product";
import { getAllCartItems } from "@/services/operations/cartItem";
import { handleAddItemCart } from "@/redux/slices/cartSlice";
import { FaSearch, FaTimes, FaBoxOpen } from "react-icons/fa";
import { HiSparkles } from "react-icons/hi2";

const ProductsPage = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  const { isAuthenticated, token } = useSelector((state: RootState) => state.auth);
  const productData = useSelector((state: RootState) => state.product.allProducts);
  const subCategories = useSelector((state: RootState) => state.product.allSubCategory);

  const [productsToDisplay, setProductsToDisplay] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoaded, setIsLoaded] = useState(false);
  const itemsPerPage = 20;

  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([
          getAllCategory(dispatch),
          getAllSubCategory(dispatch),
          getAllProduct(dispatch),
        ]);
        if (isAuthenticated && token) {
          const mappedCartData = await getAllCartItems(token as string);
          dispatch(handleAddItemCart(mappedCartData));
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    if (productData.length === 0 || subCategories.length === 0) {
      fetchData();
    }
  }, [dispatch, isAuthenticated, token]);

  // Filter products based on search query
  const searchFilteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const query = searchQuery.toLowerCase().trim();
    return productData.filter((prod) => {
      const name = (prod.name || "").toLowerCase();
      const description = (prod.description || "").toLowerCase();
      const categoryMatch = prod.category?.some((cat: any) => {
        const catName = typeof cat === "string" ? "" : (cat.name || "").toLowerCase();
        return catName.includes(query);
      }) || false;
      const subCategoryMatch = prod.subCategory?.some((sc: any) => {
        const scName = typeof sc === "string" ? "" : (sc.name || "").toLowerCase();
        return scName.includes(query);
      }) || false;
      return name.includes(query) || description.includes(query) || categoryMatch || subCategoryMatch;
    });
  }, [productData, searchQuery]);

  useEffect(() => {
    if (productData.length === 0) return;

    if (searchFilteredProducts !== null) {
      setProductsToDisplay(searchFilteredProducts);
      setCurrentPage(1);
      setIsLoaded(true);
      return;
    }

    // Show all products when no search query
    setProductsToDisplay([...productData]);
    setIsLoaded(true);
  }, [productData, searchFilteredProducts]);

  useEffect(() => {
    setCurrentPage(1);
    setIsLoaded(false);
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Pagination logic
  const totalPages = Math.ceil(productsToDisplay.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = productsToDisplay.slice(indexOfFirstItem, indexOfLastItem);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const clearSearch = () => {
    router.push("/products");
  };

  return (
    <div className="relative flex flex-col w-full mx-auto items-center font-sans bg-(--mainBg) overflow-x-hidden">
      <LayoutV2>
        {/* Search Results Hero Banner */}
        {searchQuery && (
          <div className="w-full bg-gradient-to-br from-[#3a0103] via-[#5a1a1d] to-[#8b3a3d] pt-28 pb-10 px-4 sm:px-6 relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl" />
            <div className="absolute bottom-0 left-0 w-56 h-56 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4 blur-2xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#9c6567]/10 rounded-full blur-3xl" />

            <div className="max-w-4xl mx-auto text-center relative z-10">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-5">
                <FaSearch className="text-white/70 text-xs" />
                <span className="text-white/80 text-sm font-medium tracking-wide">Search Results</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 leading-tight">
                Results for{" "}
                <span className="relative inline-block">
                  <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-[#f0c8a0] to-[#e8a87c]">
                    &ldquo;{searchQuery}&rdquo;
                  </span>
                  <span className="absolute -bottom-1 left-0 w-full h-1 bg-gradient-to-r from-[#f0c8a0] to-[#e8a87c] rounded-full opacity-60" />
                </span>
              </h1>

              <p className="text-white/60 text-base sm:text-lg mt-4">
                {productsToDisplay.length > 0 ? (
                  <>
                    We found{" "}
                    <span className="text-white font-semibold">
                      {productsToDisplay.length}
                    </span>{" "}
                    product{productsToDisplay.length !== 1 ? "s" : ""} matching your search
                  </>
                ) : (
                  "Searching through our collection..."
                )}
              </p>

              <button
                onClick={clearSearch}
                className="mt-5 inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105 active:scale-95"
              >
                <FaTimes className="text-xs" />
                Clear Search
              </button>
            </div>
          </div>
        )}

        {/* Non-search heading */}
        {!searchQuery && (
          <div className="w-full pt-28 pb-10 px-4 bg-gradient-to-br from-[#3a0103] via-[#5a1a1d] to-[#8b3a3d] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl" />
            <div className="absolute bottom-0 left-0 w-56 h-56 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4 blur-2xl" />
            <div className="max-w-4xl mx-auto text-center relative z-10">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-5">
                <HiSparkles className="text-[#f0c8a0] text-sm" />
                <span className="text-white/80 text-sm font-medium tracking-wide">Our Collection</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3">
                All Products
              </h1>
              <p className="text-white/60 text-base sm:text-lg">
                Explore our curated collection of premium event decorations
              </p>
            </div>
          </div>
        )}

        <section className="bg-(--mainBg1) w-full py-10 flex flex-col px-2 sm:px-6 md:px-10 lg:px-20 min-h-[60vh]">
          <div className="w-11/12 mx-auto flex flex-col gap-8">
            {/* Results stats bar */}
            {productsToDisplay.length > 0 && (
              <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                <p className="text-gray-500 text-sm">
                  Showing{" "}
                  <span className="font-semibold text-gray-800">
                    {indexOfFirstItem + 1}–{Math.min(indexOfLastItem, productsToDisplay.length)}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-gray-800">
                    {productsToDisplay.length}
                  </span>{" "}
                  products
                </p>
                {totalPages > 1 && (
                  <p className="text-gray-500 text-sm">
                    Page <span className="font-semibold text-gray-800">{currentPage}</span> of{" "}
                    <span className="font-semibold text-gray-800">{totalPages}</span>
                  </p>
                )}
              </div>
            )}

            {/* Products Grid */}
            {currentProducts.length > 0 ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                  {currentProducts.map((product, index) => (
                    <div
                      key={product._id}
                      className="transition-all duration-500"
                      style={{
                        opacity: isLoaded ? 1 : 0,
                        transform: isLoaded ? "translateY(0)" : "translateY(20px)",
                        transitionDelay: `${index * 50}ms`,
                      }}
                    >
                      <ProductCard id={product._id} data={product} />
                    </div>
                  ))}
                </div>

                {/* Premium Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-1 sm:gap-2 mt-12">
                    <button
                      onClick={handlePrevPage}
                      disabled={currentPage === 1}
                      className={`px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center gap-1 ${currentPage === 1
                          ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                          : "bg-white text-gray-700 shadow-md hover:shadow-lg border border-gray-200 hover:bg-gray-50 hover:-translate-y-0.5 active:translate-y-0"
                        }`}
                      aria-label="Previous Page"
                    >
                      <span>←</span>
                      <span className="hidden sm:inline">Previous</span>
                    </button>

                    <div className="flex flex-wrap justify-center gap-1.5 mx-2">
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(page => {
                          // Show first, last, current, and +/- 1 from current
                          return page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1;
                        })
                        .map((page, index, array) => {
                          return (
                            <React.Fragment key={page}>
                              {index > 0 && array[index - 1] !== page - 1 && (
                                <span className="flex items-center justify-center px-1 text-gray-500">...</span>
                              )}
                              <button
                                onClick={() => {
                                  setCurrentPage(page);
                                  window.scrollTo({ top: 0, behavior: "smooth" });
                                }}
                                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center ${currentPage === page
                                    ? "bg-[#3a0103] text-white shadow-lg shadow-[#3a0103]/30 scale-110"
                                    : "bg-white text-gray-600 shadow-sm border border-gray-200 hover:bg-gray-50 hover:scale-105"
                                  }`}
                              >
                                {page}
                              </button>
                            </React.Fragment>
                          );
                        })}
                    </div>

                    <button
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      className={`px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center gap-1 ${currentPage === totalPages
                          ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                          : "bg-white text-gray-700 shadow-md hover:shadow-lg border border-gray-200 hover:bg-gray-50 hover:-translate-y-0.5 active:translate-y-0"
                        }`}
                      aria-label="Next Page"
                    >
                      <span className="hidden sm:inline">Next</span>
                      <span>→</span>
                    </button>
                  </div>
                )}
              </>
            ) : (
              /* Empty State */
              <div className="flex flex-col items-center justify-center py-20 gap-5">
                {searchQuery ? (
                  <>
                    <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-2">
                      <FaBoxOpen className="text-gray-300 text-4xl" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-700">
                      No results found
                    </h3>
                    <p className="text-gray-400 text-center max-w-md">
                      We couldn&apos;t find any products matching &ldquo;
                      <span className="font-semibold text-gray-600">{searchQuery}</span>
                      &rdquo;. Try using different or broader keywords.
                    </p>
                    <button
                      onClick={clearSearch}
                      className="mt-3 px-6 py-3 bg-[#3a0103] text-white rounded-xl font-semibold text-sm hover:bg-[#5a1a1d] transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg shadow-[#3a0103]/20"
                    >
                      Browse All Products
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center animate-pulse">
                      <HiSparkles className="text-gray-300 text-2xl" />
                    </div>
                    <p className="text-xl text-gray-400 font-semibold">
                      Loading products...
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </LayoutV2>
    </div>
  );
};

export default ProductsPage;
