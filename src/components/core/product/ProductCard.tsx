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

  const toggleLike = (id: string) => {
    setLikedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const url = `/product/${valideURLConvert(data.name)}-${data._id}`;

  return (
    <Card
      key={id}
      className=" cursor-pointer mx-auto p-2 bg-gray-100 w-full max-w-xs md:max-w-lg lg:max-w-xl min-h-min gap-0 shadow-sm hover:shadow-md transition rounded-1"
    >
      <Link
        href={url}
        // className="border py-2 lg:p-4 grid gap-1 lg:gap-3 min-w-min md:min-w-36 lg:min-w-min rounded cursor-pointer bg-white"
      >
        <div className="group relative w-full h-48 rounded-md overflow-hidden">
          <span className="absolute z-10 top-0 left-0 bg-(--cta-Bg) text-white text-[10px] px-2 py-1 rounded-full">
            {data.discount}% off
          </span>
          <img
            src={data.image?.[0] || "/no-image.png"}
            alt={data.name}
            className="absolute inset-0 h-full w-full object-contain transition-transform duration-500 group-hover:scale-110"
          />
        </div>
      </Link>

      <CardHeader className="px-2 pt-1.5 pb-0">
        <h3 className="font-bold text-xl">{data.name}</h3>
      </CardHeader>

      <CardContent className="px-2">
        {/* Price */}
        {data.discount > 0 ? (
          <>
            <div className="flex gap-2">
              <p className="text-gray-400 line-through font-bold text-base">
                ₹{data.price}
              </p>
              <p className="text-green-600 font-bold text-base">
                {DisplayPriceInRupees(
                  pricewithDiscount(data.price, data.discount)
                )}
              </p>
            </div>
          </>
        ) : (
          <p className="text-gray-700 font-semibold">₹{data.price}</p>
        )}

        <p className="text-gray-500 text-sm mt-1 line-clamp-2">
          {data.description.length > 35
            ? `${data.description.substring(0, 35)}...`
            : data.description}
        </p>
      </CardContent>

      <CardFooter className="px-2 py-1 mt-2 flex justify-between">
        <div className="">
          {data.stock == 0 ? (
            <p className="text-red-500 text-sm text-center">Out of stock</p>
          ) : (
            <AddToCartButton
              data={data}
              className="py-2 px-3 text-white text-base bg-(--cta-Bg)"
            />
          )}
        </div>

        {/* ❤️ Wishlist Button */}
        <button
          onClick={() => toggleLike(data._id!)}
          className="h-10 w-10 flex items-center justify-center transition duration-500 cursor-pointer"
        >
          {likedItems[data._id!] ? (
            <FaHeart fontSize={26} className="text-red-500" />
          ) : (
            <CiHeart fontSize={30} className="text-gray-500" />
          )}
        </button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
