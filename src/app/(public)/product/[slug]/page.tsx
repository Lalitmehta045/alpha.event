"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa6";
import { DisplayPriceInRupees } from "@/utils/DisplayPriceInRupees";
import { pricewithDiscount } from "@/utils/PriceWithDiscount";
import LayoutV2 from "../../layout/layoutV2";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store/store";
import { getProductDetail } from "@/services/operations/product";
import { Product } from "@/@types/product";
import CTAButtonV1 from "@/components/common/ctaButton/ctaButtonV1";
import { IoCall, IoCartOutline, IoClose } from "react-icons/io5";
import services from "@/assets/data/services.json";
import FeaturedProd from "@/components/core/featuredProd/featuredProd";
import CTASection from "@/components/common/ctaButton/ctaSection";
import AddToCartButton from "@/components/common/cart/AddToCartButton";
import { handleAddItemCart } from "@/redux/slices/cartSlice";
import { getAllCartItems } from "@/services/operations/cartItem";
import { Bot } from "lucide-react";
import AIPlannerModal from "@/components/common/aiPlanner/AIPlannerModal";

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
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const token = useSelector((state: RootState) => state.auth.token) as string;
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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [aiPlannerOpen, setAiPlannerOpen] = useState(false);

  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const minSwipeDistance = 50;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      setImageIndex((prev) => (prev < data.image.length - 1 ? prev + 1 : 0));
    }
    if (isRightSwipe) {
      setImageIndex((prev) => (prev > 0 ? prev - 1 : data.image.length - 1));
    }
  };

  const handlePrevImage = () => {
    setImageIndex((prev) => (prev > 0 ? prev - 1 : data.image.length - 1));
  };

  const handleNextImage = () => {
    setImageIndex((prev) => (prev < data.image.length - 1 ? prev + 1 : 0));
  };

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
    // Only fetch cart if user is authenticated
    if (!isAuthenticated) return;

    try {
      const mappedCartData = await getAllCartItems(token);
      dispatch(handleAddItemCart(mappedCartData));
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchProductDetails();
    fetchCartItem();
  }, [productId, token]);

  return (
    <div className="relative flex flex-col gap-10 w-full mx-auto h-min items-center font-sans bg-(--mainBg) pt-[100px] md:pt-[130px] lg:pt-[160px]">
      <LayoutV2>
        <section className="relative w-11/12 mx-auto pb-10 md:py-10 px-2 sm:px-6 md:px-12 lg:px-24 gap-6 md:gap-8 grid lg:grid-cols-2">
          {/* LEFT SIDE */}
          <div>
            {/* Main Image */}
            <div className="relative bg-white h-[40vh] sm:h-[50vh] md:h-[65vh] p-4 md:py-6 md:px-4 rounded-lg group overflow-hidden">
              {data.image.length > 0 ? (
                <>
                  <div
                    className="w-full h-full relative"
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                  >
                    <img
                      key={imageIndex} // force re-render
                      src={data.image[imageIndex]}
                      className="w-full h-full object-contain rounded-md cursor-pointer animate-in fade-in zoom-in-95 duration-500 hover:scale-105 transition-transform"
                      alt="product"
                      onClick={() => setIsFullscreen(true)}
                    />

                    {/* Gallery Icon Indicator (Professional Touch) */}
                    {data.image.length > 1 && (
                      <div className="absolute bottom-3 left-3 bg-black/40 backdrop-blur-md px-2.5 py-1.5 rounded-full flex items-center gap-1.5 text-white/90 shadow-sm border border-white/10 z-10">
                        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="14" width="14" xmlns="http://www.w3.org/2000/svg"><path fill="none" d="M0 0h24v24H0z"></path><path d="M22 16V4c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2zm-11-4l2.03 2.71L16 11l4 5H8l3-4zM2 6v14c0 1.1.9 2 2 2h14v-2H4V6H2z"></path></svg>
                        <span className="text-xs font-semibold tracking-wider">
                          {imageIndex + 1}/{data.image.length}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Swipe Buttons (Premium Glassmorphism) */}
                  {data.image.length > 1 && (
                    <>
                      <button
                        onClick={handlePrevImage}
                        className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/50 backdrop-blur-md border border-white/20 text-white p-2.5 sm:p-3 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100 hover:scale-105 active:scale-95 z-20"
                        aria-label="Previous image"
                      >
                        <FaAngleLeft className="text-xl sm:text-2xl drop-shadow-md" />
                      </button>
                      <button
                        onClick={handleNextImage}
                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/50 backdrop-blur-md border border-white/20 text-white p-2.5 sm:p-3 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100 hover:scale-105 active:scale-95 z-20"
                        aria-label="Next image"
                      >
                        <FaAngleRight className="text-xl sm:text-2xl drop-shadow-md" />
                      </button>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 font-medium">
                  No Image Available
                </div>
              )}
            </div>

            {/* Premium Photo Indicators */}
            {data.image.length > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8 md:mt-12 mb-4">
                {data.image.map((img, index) => (
                  <button
                    key={img + index + "point"}
                    onClick={() => setImageIndex(index)}
                    className={`transition-all duration-500 ease-out rounded-full ${index === imageIndex
                        ? "bg-gradient-to-r from-red-900 to-red-700 w-8 h-2 sm:h-2.5 shadow-md shadow-red-900/20"
                        : "bg-gray-200 hover:bg-gray-300 w-2 h-2 sm:w-2.5 sm:h-2.5"
                      }`}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>
            )}

            {/* All Images Strip */}
            <div className="grid relative mt-8 md:mt-12">
              <div
                ref={imageContainerRef}
                className="flex gap-4 w-full overflow-x-auto scrollbar-none"
              >
                {data.image.map((img, index) => (
                  <div
                    key={img + index}
                    onClick={() => setImageIndex(index)}
                    className={`w-28 h-28 cursor-pointer shadow-md rounded-md border-2 ${imageIndex === index
                      ? "border-gray-300"
                      : "border-transparent"
                      }`}
                  >
                    <img
                      src={data.thumbnails?.[index] || img}
                      alt="thumbnail"
                      className="w-full h-full object-cover rounded-md"
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (target.src !== img) {
                          target.src = img;
                        }
                      }}
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

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-2">
              <div>
                <h2 className="font-semibold text-3xl lg:text-5xl mb-3">
                  {data.name}
                </h2>
                <p className="font-bold">Qty: {data.unit}</p>
              </div>
              
              <button
                onClick={() => setAiPlannerOpen(true)}
                className="flex shrink-0 items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-fuchsia-50 to-purple-50 border border-purple-200 text-purple-700 hover:shadow-md transition-all hover:-translate-y-0.5 group"
              >
                <Bot className="w-5 h-5 text-purple-600 group-hover:scale-110 transition-transform" />
                <span className="font-bold text-sm tracking-wide">AI Customization</span>
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur opacity-0 group-hover:opacity-20 transition duration-500 -z-10"></div>
              </button>
            </div>

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
                  text="Contact Now 7389288488"
                  icon={<IoCall style={{ width: 20, height: 20 }} />}
                  // onClick={() => router.push("/recent")}
                  href="tel:+917389288488"
                  className="px-4 md:px-8 py-5 md:py-6 w-full text-lg bg-black border border-gray-300 text-white"
                />
              </div>
            )}
          </div>
        </section>

        <FeaturedProd productId={data._id} />
        <CTASection />
      </LayoutV2>

      <AIPlannerModal 
        externalOpen={aiPlannerOpen} 
        onExternalClose={() => setAiPlannerOpen(false)} 
        defaultProduct={data} 
        hideFloatingButton={true}
      />

      {/* Fullscreen Image Lightbox Modal */}
      {isFullscreen && data.image.length > 0 && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors z-[110]"
            aria-label="Close fullscreen"
          >
            <IoClose className="text-3xl" />
          </button>

          {/* Main Image in Fullscreen */}
          <div
            className="relative w-full h-full max-w-5xl max-h-screen flex items-center justify-center"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <img
              key={imageIndex + "fullscreen"}
              src={data.image[imageIndex]}
              className="max-w-full max-h-full object-contain animate-in fade-in zoom-in-95 duration-300"
              alt={`Fullscreen ${data.name}`}
            />

            {/* Swipe Buttons (Fullscreen) */}
            {data.image.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); handlePrevImage(); }}
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 sm:p-4 rounded-full backdrop-blur-sm transition-colors z-[110]"
                  aria-label="Previous image"
                >
                  <FaAngleLeft className="text-2xl sm:text-3xl" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleNextImage(); }}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 sm:p-4 rounded-full backdrop-blur-sm transition-colors z-[110]"
                  aria-label="Next image"
                >
                  <FaAngleRight className="text-2xl sm:text-3xl" />
                </button>
              </>
            )}

            {/* Fullscreen Photo Indicators */}
            {data.image.length > 1 && (
              <div className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 flex items-center justify-center gap-2">
                {data.image.map((img, index) => (
                  <button
                    key={img + index + "fs-point"}
                    onClick={() => setImageIndex(index)}
                    className={`transition-all duration-300 rounded-full ${index === imageIndex
                        ? "bg-white w-6 h-2 sm:h-2.5"
                        : "bg-white/40 hover:bg-white/60 w-2 h-2 sm:w-2.5 sm:h-2.5"
                      }`}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDisplayPage;
