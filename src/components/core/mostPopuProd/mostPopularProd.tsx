import { Product } from "@/@types/product";
import AddToCartButton from "@/components/common/cart/AddToCartButton";
import HeadingV1 from "@/components/common/Texts/HeadingV1";
import ParagraphV1 from "@/components/common/Texts/paragraph";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { getMostPopularProduct } from "@/services/operations/product";
import { DisplayPriceInRupees } from "@/utils/DisplayPriceInRupees";
import { pricewithDiscount } from "@/utils/PriceWithDiscount";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CiHeart } from "react-icons/ci";
import { FaHeart } from "react-icons/fa";
import { useDispatch } from "react-redux";

export type LikedState = Record<string, boolean>;

const MostPopularProd = () => {
  const dispatch = useDispatch();

  const [popularProducts, setPopularProducts] = useState<Product[]>([]);

  const [likedItems, setLikedItems] = useState<LikedState>({});

  const toggleLike = (id: string): void => {
    setLikedItems((prev: LikedState) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const getPopularProduct = async () => {
    try {
      const res = await getMostPopularProduct(dispatch);
      setPopularProducts(res);
    } catch (error) {
      console.error("Error fetching popular products:", error);
    }
  };

  useEffect(() => {
    getPopularProduct();
  }, []);

  const productNameShort = (name: string) =>
    name.length > 15 ? name.slice(0, 15) + "..." : name;

  if (popularProducts.length === 0) {
    return (
      <section className="w-full py-8 text-center text-gray-500">
        <p>Loading most popular products...</p>
      </section>
    );
  }

  return (
    <section className="bg-white w-full py-8 flex flex-col text-white px-2 sm:px-6 md:px-10 lg:px-20">
      <div className="w-11/12 mx-auto">
        <div className="w-full mx-auto text-start mb-10">
          <HeadingV1
            text={"Most popular products"}
            size={"3xl"}
            color="text-gray-900" // Adjusted for white background
          />
          <ParagraphV1
            text="Loved by our clients— these bestsellers add charm, color, and character to every event."
            size="lg"
            color="text-gray-700" // Adjusted for white background
            className="mt-1"
          />
        </div>

        <div className="w-full mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-y-8 gap-1.5 sm:gap-4 place-items-center">
          {popularProducts.map((product) => {
            // Discount is now a number
            const discount = product.discount || 0;
            const discountedPrice = pricewithDiscount(product.price, discount);

            // Ensure product.image[0] exists before rendering
            const imageUrl =
              product.image && product.image.length > 0 ? product.image[0] : "";

            return (
              <Link
                href={`/product/${product._id}`}
                key={product._id}
                className="w-full max-w-48 sm:max-w-56 md:max-w-54 lg:max-w-52 block"
              >
                <Card className="border border-gray-300 w-full max-w-xs h-6/12 p-2 rounded-xl bg-white cursor-pointer  flex flex-col gap-0.5 min-h-[245px]">
                  <CardContent className="p-0 grow">
                    <div className="relative w-full h-32 overflow-hidden rounded-lg shadow-sm">
                      {/* Discount is now a number, display it */}
                      {discount > 0 && (
                        <span className="absolute z-10 top-0 left-0 bg-red-500 text-white text-[10px] px-2 py-1 rounded-bl-lg rounded-tr-lg font-bold">
                          {discount}% OFF
                        </span>
                      )}

                      <Image
                        src={product.image[0]}
                        alt={product.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="w-full object-contain hover:scale-110 transition-transform duration-300"
                      />
                    </div>

                    <div className="mt-2 px-1 text-black">
                      <h3 className="text-base font-medium text-gray-900 line-clamp-2">
                        {/* Use helper for consistent name length */}
                        {productNameShort(product.name)}
                      </h3>

                      <p className="text-sm text-gray-600 mt-1">
                        Qty: {product.unit} unit
                      </p>

                      <div className="flex items-center gap-2 mt-1">
                        {/* Display original price if discount exists */}
                        {discount > 0 && (
                          <span className="text-gray-400 line-through text-xs">
                            {DisplayPriceInRupees(product.price)}
                          </span>
                        )}

                        {/* Display final price */}
                        <span className="text-black font-semibold text-xs sm:text-sm">
                          {DisplayPriceInRupees(discountedPrice)}
                        </span>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="flex items-center justify-between p-1 mt-auto">
                    <AddToCartButton
                      data={product}
                      // className="bg-(--cta-Bg) text-white rounded-lg w-max px-3 md:px-4 py-1 md:py-2 text-xs sm:text-sm"
                      className="bg-indigo-600 text-white w-max px-3 py-2 text-xs sm:text-sm font-medium shadow-md hover:bg-indigo-700 transition duration-200"
                    />

                    <button
                      // Pass the string _id to toggleLike
                      onClick={(e) => {
                        e.preventDefault(); // Stop event from triggering the card Link
                        toggleLike(product._id);
                      }}
                      className="h-10 w-10 transition-transform duration-100 hover:scale-110"
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

export default MostPopularProd;
