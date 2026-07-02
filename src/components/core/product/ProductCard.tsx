import { Card } from "@/components/ui/card";
import { DisplayPriceInRupees } from "@/utils/DisplayPriceInRupees";
import { pricewithDiscount } from "@/utils/PriceWithDiscount";
import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { CiHeart } from "react-icons/ci";
import { FaHeart, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import Link from "next/link";
import { valideURLConvert } from "@/utils/valideURLConvert";
import { Product } from "@/@types/product";
import { RootState } from "@/redux/store/store";
import AddToCartButton from "@/components/common/cart/AddToCartButton";
import AnimatedCategoryBadge from "@/components/common/AnimatedCategoryBadge";

interface ProductCardProps {
  data: Product;
  id: any;
  hidePrice?: boolean;
  customButtonText?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ data, id, hidePrice, customButtonText }) => {
  const [likedItems, setLikedItems] = useState<{ [key: string]: boolean }>({});
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = useMemo(() => {
    let imgs: string[] = [];
    if (data.image && data.image.length > 0) {
      imgs = data.image;
    } else if (data.thumbnails && data.thumbnails.length > 0) {
      imgs = data.thumbnails;
    } else {
      imgs = ["/no-image.png"];
    }
    return imgs;
  }, [data.image, data.thumbnails]);

  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Resolve category IDs to names from Redux store
  const allCategory = useSelector(
    (state: RootState) => state.product.allCategory
  );
  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    allCategory.forEach((cat) => map.set(cat._id, cat.name));
    return map;
  }, [allCategory]);

  const allSubCategory = useSelector(
    (state: RootState) => state.product.allSubCategory
  );
  const subCategoryMap = useMemo(() => {
    const map = new Map<string, string>();
    allSubCategory?.forEach((sub) => map.set(sub._id, sub.name));
    return map;
  }, [allSubCategory]);

  // Resolve product category to display name (showing subcategory for specific categories)
  const displayTag = useMemo(() => {
    if (!data.category || data.category.length === 0) return null;

    const cat = data.category[0] as any;
    const catName = typeof cat === "string" ? categoryMap.get(cat) : cat?.name;

    if (catName) {
      const lowerCatName = catName.toLowerCase();
      if (lowerCatName.includes("theme decor") || lowerCatName.includes("decoration")) {
        if (data.subCategory && data.subCategory.length > 0) {
          const subCat = data.subCategory[0] as any;
          const subCatName = typeof subCat === "string" ? subCategoryMap.get(subCat) : subCat?.name;
          if (subCatName) return subCatName;
        }
      }
    }

    return catName || null;
  }, [data.category, data.subCategory, categoryMap, subCategoryMap]);

  // Compute root category explicitly for coloring
  const rootCategoryName = useMemo(() => {
    if (!data.category || data.category.length === 0) return null;
    const cat = data.category[0] as any;
    return typeof cat === "string" ? categoryMap.get(cat) : cat?.name;
  }, [data.category, categoryMap]);

  const toggleLike = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setLikedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const url = `/product/${valideURLConvert(data.name)}-${data._id}`;

  return (
    <Card
      key={id}
      className="group h-full flex flex-col cursor-pointer bg-white w-full max-w-sm mx-auto shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-2xl overflow-hidden relative"
    >
      <Link href={url} className="w-full relative">
        <div className="relative w-full aspect-[4/3] bg-gray-50 overflow-hidden">
          {/* Discount Badge — top left */}
          {data.discount > 0 && (
            <span className="absolute z-10 top-3 left-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
              {data.discount}% OFF
            </span>
          )}

          {/* Category Tag — top left below discount or at top */}
          {displayTag && (
            <AnimatedCategoryBadge
              text={displayTag}
              category={rootCategoryName || displayTag}
              style={{ top: data.discount > 0 ? '2.5rem' : '0.5rem' }}
            />
          )}

          <img
            src={images[currentImageIndex]}
            alt={data.name}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-contain bg-gray-50 transition-transform duration-700 group-hover:scale-105"
            onError={(e) => {
              const target = e.currentTarget;
              const fallback = "/no-image.png";
              if (target.src !== fallback) {
                target.src = fallback;
              }
            }}
          />

          {images.length > 1 && (
            <>
              <button
                onClick={handlePrevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 h-7 w-7 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center shadow-md hover:bg-white transition-all duration-300 opacity-0 group-hover:opacity-100 z-20"
              >
                <FaChevronLeft className="text-gray-700 pr-0.5" size={12} />
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center shadow-md hover:bg-white transition-all duration-300 opacity-0 group-hover:opacity-100 z-20"
              >
                <FaChevronRight className="text-gray-700 pl-0.5" size={12} />
              </button>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {images.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-1.5 rounded-full transition-all duration-300 shadow-sm ${
                      idx === currentImageIndex ? "w-3 bg-[var(--cta-Bg)]" : "w-1.5 bg-gray-300"
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          {/* ❤️ Wishlist Button */}
          <button
            onClick={(e) => toggleLike(e, data._id!)}
            className="absolute top-3 right-3 z-10 h-9 w-9 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-all duration-300"
          >
            {likedItems[data._id!] ? (
              <FaHeart fontSize={18} className="text-red-500" />
            ) : (
              <CiHeart fontSize={22} className="text-gray-600 hover:text-red-500 transition-colors" />
            )}
          </button>
        </div>
      </Link>

      <div className="flex flex-col flex-grow p-4">
        <Link href={url}>
          <h3 className="font-bold text-lg text-gray-900 line-clamp-1 group-hover:text-(--cta-Bg) transition-colors">
            {data.name}
          </h3>
        </Link>

        <div className="mt-auto pt-3">
          {/* Price */}
          {!hidePrice && (
            <div className="flex items-center gap-2 mb-4">
              {data.discount > 0 ? (
                <>
                  <p className="text-gray-400 line-through text-sm">
                    ₹{data.price}
                  </p>
                  <p className="text-gray-900 font-extrabold text-lg">
                    {DisplayPriceInRupees(
                      pricewithDiscount(data.price, data.discount)
                    )}
                  </p>
                </>
              ) : (
                <p className="text-gray-900 font-extrabold text-lg">₹{data.price}</p>
              )}
            </div>
          )}

          <div className="w-full">
            {customButtonText ? (
              <div className="w-full py-2.5 rounded-xl text-white font-semibold text-center shadow-md bg-(--cta-Bg)">
                {customButtonText}
              </div>
            ) : data.stock == 0 ? (
              <div className="w-full py-2 bg-red-50 text-red-500 font-semibold text-center rounded-xl border border-red-100">
                Out of Stock
              </div>
            ) : (
              <AddToCartButton
                data={data}
                className="w-full py-2.5 rounded-xl text-white font-semibold shadow-md hover:shadow-lg transition-all active:scale-[0.98] bg-(--cta-Bg) hover:opacity-90"
              />
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ProductCard;
