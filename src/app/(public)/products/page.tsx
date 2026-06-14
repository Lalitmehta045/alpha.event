"use client";

import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/store/store";
import { Product } from "@/@types/product";
import ProductCard from "@/components/core/product/ProductCard";
import HeadingV1 from "@/components/common/Texts/HeadingV1";
import LayoutV2 from "../layout/layoutV2";
import { getAllCategory } from "@/services/operations/category";
import { getAllSubCategory } from "@/services/operations/subcategory";
import { getAllProduct } from "@/services/operations/product";
import { getAllCartItems } from "@/services/operations/cartItem";
import { handleAddItemCart } from "@/redux/slices/cartSlice";

const ProductsPage = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, token } = useSelector((state: RootState) => state.auth);
  const productData = useSelector((state: RootState) => state.product.allProducts);
  const subCategories = useSelector((state: RootState) => state.product.allSubCategory);

  const [productsToDisplay, setProductsToDisplay] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
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

  useEffect(() => {
    if (productData.length === 0 || subCategories.length === 0) return;

    const selected: Product[] = [];
    const seenIds = new Set<string>();

    for (const subCat of subCategories) {
      const subCatProducts = productData.filter((prod) => {
        if (!prod.subCategory || !Array.isArray(prod.subCategory)) return false;
        return prod.subCategory.some((sc: any) => 
          typeof sc === 'string' ? sc === subCat._id : sc._id === subCat._id
        );
      });

      if (subCatProducts.length > 0) {
        // Filter out already selected products to avoid duplicate keys
        const uniqueProducts = subCatProducts.filter(p => !seenIds.has(p._id));

        // Take up to 4 products from this subcategory
        const selectedProducts = uniqueProducts.slice(0, 4);
        
        if (selectedProducts.length > 0) {
          selected.push(...selectedProducts);
          selectedProducts.forEach(p => seenIds.add(p._id));
        }
      }
    }

    setProductsToDisplay(selected);
  }, [productData, subCategories]);

  // Pagination logic
  const totalPages = Math.ceil(productsToDisplay.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = productsToDisplay.slice(indexOfFirstItem, indexOfLastItem);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="relative flex flex-col gap-10 w-full mx-auto h-min items-center font-sans bg-(--mainBg)">
      <LayoutV2>
        <section className="bg-(--mainBg1) w-full py-12 flex flex-col px-2 sm:px-6 md:px-10 lg:px-20 min-h-screen">
          <div className="w-11/12 mx-auto flex flex-col gap-8">
            <div className="text-center mt-20">
              <HeadingV1
                text="All Products"
                size="4xl"
                color="text-(--mainHeading1)"
                className="font-bold"
              />
            </div>

            {currentProducts.length > 0 ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                  {currentProducts.map((product) => (
                    <ProductCard key={product._id} id={product._id} data={product} />
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-4 mt-12">
                    <button
                      onClick={handlePrevPage}
                      disabled={currentPage === 1}
                      className={`px-4 py-2 rounded-lg font-semibold transition ${
                        currentPage === 1 
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed" 
                          : "bg-white text-gray-800 shadow-md hover:shadow-lg border border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      Previous
                    </button>
                    
                    <div className="flex gap-2">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => {
                            setCurrentPage(page);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className={`w-10 h-10 rounded-lg font-bold transition flex items-center justify-center ${
                            currentPage === page
                              ? "bg-(--cta-Bg) text-white shadow-md"
                              : "bg-white text-gray-600 shadow-sm border border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      className={`px-4 py-2 rounded-lg font-semibold transition ${
                        currentPage === totalPages 
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed" 
                          : "bg-white text-gray-800 shadow-md hover:shadow-lg border border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center h-64">
                <p className="text-xl text-gray-400 font-semibold animate-pulse">Loading products...</p>
              </div>
            )}
          </div>
        </section>
      </LayoutV2>
    </div>
  );
};

export default ProductsPage;
