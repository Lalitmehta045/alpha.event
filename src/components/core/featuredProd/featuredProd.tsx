"use client";

import Image from "next/image";
// Import Link component for clickable cards
import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import HeadingV1 from "@/components/common/Texts/HeadingV1";

import { FaHeart } from "react-icons/fa";
import { CiHeart } from "react-icons/ci";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store/store";
import { getProductSubCategory } from "@/services/operations/product";
import { DisplayPriceInRupees } from "@/utils/DisplayPriceInRupees";
import { pricewithDiscount } from "@/utils/PriceWithDiscount";
import { Product } from "@/@types/product";
import AddToCartButton from "@/components/common/cart/AddToCartButton";

export type LikedState = Record<string, boolean>;

interface featureprops {
  productId: string;
}

const FeaturedProd = ({ productId }: featureprops) => {
  const dispatch = useDispatch();

  const subcatproductData: Product[] = useSelector(
    (state: RootState) => state.product.subcatproduct
  );

  // Filter out the current product from the list of similar products
  const filteredProducts = subcatproductData?.filter(
    (product) => product._id !== productId
  );

  // ✅ Wishlist state typed
  const [likedItems, setLikedItems] = useState<LikedState>({});

  // ✅ Toggle wishlist with type-safe function using string ID
  const toggleLike = (id: string): void => {
    setLikedItems((prev: LikedState) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const getsubcatproduct = async () => {
    try {
      await getProductSubCategory(productId, dispatch);
    } catch (error) {
      console.error("Error fetching subcategory products:", error);
    }
  };

  useEffect(() => {
    if (productId) getsubcatproduct();
  }, [productId]);

  if (!filteredProducts || filteredProducts.length === 0) {
    return null;
  }

  return (
    <section className="bg-(--mainBg1) w-full py-8 flex flex-col text-white px-2 sm:px-6 md:px-10 lg:px-20">
      <div className="w-11/12 mx-auto">
        <div className="w-full mx-auto text-start mb-10">
          <HeadingV1
            text="Similar Products"
            size="3xl"
            color="text-(--mainHeading1)"
          />
        </div>

        <div className="w-full mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-3 place-items-center">
          {filteredProducts.map((product) => {
            const discountedPrice = pricewithDiscount(
              product.price,
              product.discount
            );

            return (
              <Link
                href={`/product/${product._id}`}
                key={product._id}
                className="w-full max-w-44 md:max-w-48 lg:max-w-52"
              >
                <Card className="border border-gray-300 w-full max-w-max md:max-w-xs h-6/12 p-2 rounded-xl bg-white cursor-pointer transition-all duration-300 hover:shadow-lg flex flex-col gap-2">
                  <CardContent className="p-0">
                    <div className="relative w-full h-32 overflow-hidden rounded-lg shadow-sm">
                      <span className="absolute z-10 top-0 left-0 bg-black text-white text-[10px] px-2 py-1 rounded-full">
                        {product.discount}%
                      </span>

                      <Image
                        src={product.image[0]}
                        alt={product.name}
                        fill
                        className="w-full object-contain hover:scale-110 transition-transform duration-300"
                      />
                    </div>

                    <div className="mt-1 px-1">
                      <h3 className="text-base font-medium text-gray-900 line-clamp-2">
                        {product.name.length > 15
                          ? product.name.slice(0, 15) + "..."
                          : product.name}
                      </h3>

                      <p className="text-sm text-gray-700">
                        Qty: {product.unit} unit
                      </p>

                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 line-through text-xs">
                          {DisplayPriceInRupees(product.price)}
                        </span>
                        <span className="text-black font-medium text-xs">
                          {/* {DisplayPriceInRupees(discountedPrice)} */}
                          {DisplayPriceInRupees(
                            pricewithDiscount(product.price, product.discount)
                          )}
                        </span>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="flex items-center justify-between p-0 mt-auto">
                    <AddToCartButton
                      data={product}
                      // icon={<IoCartOutline style={{ width: 20, height: 20 }} />}
                      className="bg-(--cta-Bg) text-white rounded-lg w-max px-3 md:px-4 py-1 md:py-2 text-xs sm:text-sm"
                    />

                    <button
                      // 🚀 Pass the string _id to toggleLike
                      onClick={(e) => {
                        e.preventDefault(); // Stop event from triggering the card Link
                        toggleLike(product._id);
                      }}
                      className="h-10 w-10 transition"
                    >
                      {likedItems[product._id] ? (
                        <FaHeart
                          fontSize={25}
                          className="text-red-500 mx-auto"
                        />
                      ) : (
                        <CiHeart
                          fontSize={28}
                          className="text-gray-500 mx-auto"
                        />
                      )}
                    </button>
                  </CardFooter>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProd;
