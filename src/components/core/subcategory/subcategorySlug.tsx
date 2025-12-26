import React, { useEffect, useState } from "react";
import ProductCard from "../product/ProductCard";
import HeadingV1 from "@/components/common/Texts/HeadingV1";
import ParagraphV1 from "@/components/common/Texts/paragraph";
import { motion } from "framer-motion";
import { Product } from "@/@types/product";
import { getAllCategory } from "@/services/operations/category";
import { getAllSubCategory } from "@/services/operations/subcategory";
import { getAllProduct } from "@/services/operations/product";
import { getAllCartItems } from "@/services/operations/cartItem";
import { useDispatch, useSelector } from "react-redux";
import { handleAddItemCart } from "@/redux/slices/cartSlice";
import { RootState } from "@/redux/store/store";
import { ArrowRight, ShoppingBag, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Props {
  data: Product[]; // ✅ FIXED
  category?: any;
  subCategory?: any;
}

const SubCategorySlug: React.FC<Props> = ({ data, category, subCategory }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const token = useSelector((state: RootState) => state.auth.token);
  const [isLoaded, setIsLoaded] = useState(false);

  const fetchData = async () => {
    try {
      await Promise.all([
        getAllCategory(dispatch),
        getAllSubCategory(dispatch),
        getAllProduct(dispatch),
      ]);
      setIsLoaded(true);
    } catch (error) {
      console.log("Fetch error:", error);
    }
  };

  const fetchCartItem = async () => {
    if (!token) return;
    
    try {
      const mappedCartData = await getAllCartItems(token);
      dispatch(handleAddItemCart(mappedCartData));
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchData();
    fetchCartItem();
  }, [token]);

  return (
    <>
      <section className="relative mt-20 md:mt-28 w-11/12 flex flex-col gap-4 items-start justify-start min-h-min py-10 md:py-10 px-2 sm:px-6 md:px-16 lg:px-20">
        <motion.section
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full text-start mb-5"
        >
          <HeadingV1
            text={subCategory?.name ?? ""}
            size="5xl"
            color="text-(--mainHeading2)"
          />

          <ParagraphV1
            text={category?.description ?? ""}
            size="lg"
            color="text-(--secondaryParagraph)"
            className="mt-3 max-w-max"
          />
        </motion.section>

        <div className="w-full mx-auto">
          {data.length === 0 ? (
            // === BEAUTIFUL COMING SOON MESSAGE - RESPONSIVE START ===
            <div className="flex flex-col items-center justify-center min-h-[50vh] px-1 py-6 text-center sm:px-8 sm:py-16 lg:px-16 lg:py-20">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="max-w-xl sm:max-w-2xl lg:max-w-3xl mx-auto"
              >
                {/* Placeholder/Icon for the image */}
                <div className="mx-auto w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 bg-yellow-500 rounded-full flex items-center justify-center mb-6 shadow-xl">
                  <ShoppingBag
                    className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 text-gray-900"
                    strokeWidth={2.5}
                  />
                </div>

                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4 sm:mb-6 tracking-tight">
                  Magic in the Making!
                </h2>

                <p className="text-gray-200 text-base sm:text-lg lg:text-xl mb-8 sm:mb-10 leading-relaxed">
                  {`We're currently stocking this ${subCategory?.name} product with incredible items.
        Check back soon—you won't want to miss what's coming next!`}
                </p>

                {/* Themed Contact Us button */}
                <button
                  className="inline-flex items-center justify-center px-6 sm:px-8 lg:px-10 py-3 sm:py-4 bg-white text-[#610C04] font-bold text-base sm:text-lg lg:text-xl rounded-full shadow-lg hover:bg-gray-100 transition-all duration-300 transform hover:-translate-y-1"
                  onClick={() => router.back()}
                >
                  Explore more
                  <ArrowRight className="ml-2 sm:ml-3 w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-[#610C04]" />
                </button>
              </motion.div>
            </div>
          ) : (
            // === BEAUTIFUL COMING SOON MESSAGE - THEMED END ===
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {data.map((p, index) => (
                <motion.div
                  key={p._id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <ProductCard data={p} id={p._id + "productSubCategory"} />
                </motion.div>
              ))}
            </div>
            // === PRODUCT GRID END ===
          )}
        </div>
      </section>
    </>
  );
};

export default SubCategorySlug;
