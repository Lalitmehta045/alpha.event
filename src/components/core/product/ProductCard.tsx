import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { DisplayPriceInRupees } from "@/utils/DisplayPriceInRupees";
import { pricewithDiscount } from "@/utils/PriceWithDiscount";
import React, { useState } from "react";
import { CiHeart } from "react-icons/ci";
import { FaHeart } from "react-icons/fa";
import Link from "next/link";
import { valideURLConvert } from "@/utils/valideURLConvert";
import { Product } from "@/@types/product";
import AddToCartButton from "@/components/common/cart/AddToCartButton";

interface ProductCardProps {
  data: Product;
  id: any;
}

const ProductCard: React.FC<ProductCardProps> = ({ data, id }) => {
  const [likedItems, setLikedItems] = useState<{ [key: string]: boolean }>({});

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
      className="group flex flex-col cursor-pointer bg-white w-full max-w-sm mx-auto shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-2xl overflow-hidden relative"
    >
      <Link href={url} className="w-full relative">
        <div className="relative w-full aspect-[4/3] bg-gray-50 overflow-hidden">
          {data.discount > 0 && (
            <span className="absolute z-10 top-3 left-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
              {data.discount}% OFF
            </span>
          )}

          <img
            src={data.thumbnails?.[0] || data.image?.[0] || "/no-image.png"}
            alt={data.name}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            onError={(e) => {
              const target = e.currentTarget;
              const fallback = data.image?.[0] || "/no-image.png";
              if (target.src !== fallback) {
                target.src = fallback;
              }
            }}
          />

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

        <p className="text-gray-500 text-sm mt-1 mb-3 line-clamp-2 min-h-[40px]">
          {data.description}
        </p>

        <div className="mt-auto">
          {/* Price */}
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

          <div className="w-full">
            {data.stock == 0 ? (
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
