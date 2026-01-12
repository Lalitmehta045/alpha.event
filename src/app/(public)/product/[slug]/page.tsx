"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa6";
import { DisplayPriceInRupees } from "@/utils/DisplayPriceInRupees";
import { pricewithDiscount } from "@/utils/PriceWithDiscount";
import LayoutV2 from "../../layout/layoutV2";
import { useDispatch } from "react-redux";
import { getProductDetail } from "@/services/operations/product";
import { Product } from "@/@types/product";
import CTAButtonV1 from "@/components/common/ctaButton/ctaButtonV1";
import { IoCall, IoCartOutline } from "react-icons/io5";
import services from "@/assets/data/services.json";
import FeaturedProd from "@/components/core/featuredProd/featuredProd";
import CTASection from "@/components/common/ctaButton/ctaSection";
import AddToCartButton from "@/components/common/cart/AddToCartButton";
import { handleAddItemCart } from "@/redux/slices/cartSlice";
import { getAllCartItems } from "@/services/operations/cartItem";

export interface ProductDetailsType {
  _id: string;
  name: string;
  image: string[];
  category: string[];
  subCategory: string[];
  unit: string;
  stock: number;
  price: number;
  discount?: number;
  description?: string;
  more_details?: Record<string, string>;
}

const ProductDisplayPage = () => {
  const params = useParams();
  const slug = params?.slug as string;
  const productId = slug?.split("-")?.slice(-1)[0];
  const dispatch = useDispatch();
  const [data, setData] = useState<Product>({
    _id: "",
    name: "",
    image: [],
    category: [],
    subCategory: [],
    unit: "",
    stock: 0,
    price: 0,
    discount: 0,
    description: "",
    more_details: {},
  });

  const [imageIndex, setImageIndex] = useState(0);
  const imageContainerRef = useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);

      const res = await getProductDetail(productId, dispatch);

      if (res) {
        setData(res);
      }
    } catch (error) {
      console.error("Failed to fetch product:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCartItem = async () => {
    try {
      const mappedCartData = await getAllCartItems();
      dispatch(handleAddItemCart(mappedCartData));
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchProductDetails();
    fetchCartItem();
  }, [productId]);

  return (
    <div className="relative flex flex-col gap-10 w-full mx-auto h-min items-center font-sans bg-(--mainBg)">
      <LayoutV2>
        <section className="relative w-11/12 mt-20 md:mt-28 mx-auto py-10 md:py-10 px-2 sm:px-6 md:px-12 lg:px-24 gap-8 grid lg:grid-cols-2">
          {/* LEFT SIDE */}
          <div>
            {/* Main Image */}
            <div className="bg-white h-[65vh] py-6 px-4 rounded-lg">
              {data.image.length > 0 ? (
                <img
                  key={imageIndex} // force re-render
                  src={data.image[imageIndex]}
                  className="w-full h-full object-contain rounded-md cursor-pointer"
                  alt="product"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No Image Available
                </div>
              )}
            </div>

            {/* Photo Indicators */}
            <div className="flex items-center justify-center gap-3 my-4">
              {data.image.map((img, index) => (
                <div
                  key={img + index + "point"}
                  className={`bg-slate-200 w-3 h-3 lg:w-5 lg:h-5 rounded-full ${
                    index === imageIndex && "bg-slate-300"
                  }`}
                ></div>
              ))}
            </div>

            {/* All Images Strip */}
            <div className="grid relative">
              <div
                ref={imageContainerRef}
                className="flex gap-4 w-full overflow-x-auto scrollbar-none"
              >
                {data.image.map((img, index) => (
                  <div
                    key={img + index}
                    onClick={() => setImageIndex(index)}
                    className={`w-28 h-28 cursor-pointer shadow-md rounded-md border-2 ${
                      imageIndex === index
                        ? "border-gray-300"
                        : "border-transparent"
                    }`}
                  >
                    <img
                      src={img}
                      alt="thumbnail"
                      className="w-full h-full object-cover rounded-md"
                    />
                  </div>
                ))}
              </div>

              {/* Slider buttons */}
              <button
                onClick={() =>
                  imageContainerRef.current?.scrollBy({
                    left: -200,
                    behavior: "smooth",
                  })
                }
                className="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow-lg"
              >
                <FaAngleLeft />
              </button>

              <button
                onClick={() =>
                  imageContainerRef.current?.scrollBy({
                    left: 200,
                    behavior: "smooth",
                  })
                }
                className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow-lg"
              >
                <FaAngleRight />
              </button>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="p-0 md:p-4 text-base lg:text-lg text-(--secondaryParagraph)">
            {/* <p className="bg-green-300 w-fit px-2 rounded-full">10 Min</p> */}

            <div className="my-4 grid gap-3">
              <h3 className="font-bold">Description:</h3>
              <p className="font-semibold">{data.description}</p>

              {data.more_details &&
                Object.keys(data.more_details).map((key) => (
                  <div key={key}>
                    <p className="font-semibold">{key}</p>
                    <p>{data.more_details![key]}</p> {/* ✅ Safe now */}
                  </div>
                ))}
            </div>

            <h2 className="font-semibold text-3xl lg:text-5xl mb-3">
              {data.name}
            </h2>
            <p className="font-bold">Qty: {data.unit}</p>

            {/* PRICING */}
            <div>
              <p className="mt-2 font-bold">Price:</p>

              <div className="flex items-center gap-4">
                <div className="border border-gray-300 px-4 py-2 rounded bg-green-50 mt-1">
                  <p className="font-semibold text-xl text-gray-600">
                    {DisplayPriceInRupees(
                      pricewithDiscount(data.price, data.discount)
                    )}
                  </p>
                </div>

                {data.discount && (
                  <>
                    <p className="line-through">
                      {DisplayPriceInRupees(data.price)}
                    </p>
                    <p className="font-bold text-green-600 text-2xl">
                      {data.discount}%{" "}
                      <span className="text-base text-gray-300">Discount</span>
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Add to Cart */}
            {data.stock === 0 ? (
              <p className="text-lg text-red-500 my-2">Out of Stock</p>
            ) : (
              <div className="flex flex-col gap-3 my-4">
                <AddToCartButton
                  data={data}
                  icon={<IoCartOutline style={{ width: 20, height: 20 }} />}
                  className="w-full px-2 py-1.5 text-lg rounded-lg text-black"
                />

                <CTAButtonV1
                  variant="outline"
                  text="Call Now"
                  icon={<IoCall style={{ width: 20, height: 20 }} />}
                  // onClick={() => router.push("/recent")}
                  href="tel:+917440287174"
                  className="px-4 md:px-8 py-5 md:py-6 w-full text-lg bg-black border border-gray-300 text-white"
                />
              </div>
            )}
          </div>
        </section>

        <FeaturedProd productId={data._id} />
        <CTASection />
      </LayoutV2>
    </div>
  );
};

export default ProductDisplayPage;
