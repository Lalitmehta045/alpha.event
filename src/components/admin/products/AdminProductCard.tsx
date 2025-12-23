"use client";

import { Product } from "@/@types/product";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { DisplayPriceInRupees } from "@/utils/DisplayPriceInRupees";
import { pricewithDiscount } from "@/utils/PriceWithDiscount";
import { Pencil } from "lucide-react";
import { MdDelete } from "react-icons/md";

interface AdminProductCardProps {
  item: Product;
  setSelectedProduct: (id: string) => void;
  setDeleteData: (item: Product) => void;
  setOpenDeleteConfirm: (open: boolean) => void;
}

export default function AdminProductCard({
  item,
  setDeleteData,
  setOpenDeleteConfirm,
  setSelectedProduct,
}: AdminProductCardProps) {
  return (
    <Card className="relative w-full max-w-md h-66 md:h-72 lg:h-78 p-3 gap-0 sm:gap-1 shadow-sm hover:shadow-md transition rounded-xl border border-gray-200">
      {/* Action Buttons */}
      <div className="absolute top-2 right-2 flex flex-col gap-2 z-20">
        {/* Edit */}
        <button
          onClick={() => setSelectedProduct(item._id)}
          className="p-2 bg-green-200 rounded-lg hover:bg-green-300"
        >
          <Pencil size={18} className="text-gray-900 mx-auto" />
        </button>

        {/* Delete */}
        <button
          onClick={() => {
            setDeleteData(item);
            setOpenDeleteConfirm(true);
          }}
          className="p-2 bg-red-200 rounded-lg hover:bg-red-300"
        >
          <MdDelete size={18} className="text-red-700 mx-auto" />
        </button>
      </div>

      {item.discount > 0 && (
        <span className="absolute z-10 top-0.5 left-0.5 bg-red-500 text-white text-[10px] px-2 py-1 rounded-bl-lg rounded-tl-lg rounded-tr-lg font-bold">
          {item.discount}% OFF
        </span>
      )}

      {/* Product Image */}
      <div className="w-full h-30 md:h-34 lg:h-38  bg-gray-50 rounded-xl">
        <img
          src={item.image?.[0]}
          alt={item.name}
          className="w-full h-full object-contain"
        />
      </div>

      <CardHeader className="px-0 mt-2">
        <h3 className="font-semibold text-base md:text-lg line-clamp-1">
          {item.name}
        </h3>
      </CardHeader>

      <CardContent className="px-0">
        {/* Price Section */}
        {item.discount && item.discount > 0 ? (
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="flex items-center gap-2">
              <span className="text-gray-400 line-through text-sm">
                ₹{item.price}
              </span>

              <span className="text-green-600 text-sm font-semibold">
                {DisplayPriceInRupees(
                  pricewithDiscount(item.price, item.discount)
                )}
              </span>
            </div>

            {/* <span className="text-xs w-max text-red-600 font-medium bg-red-100 px-2 py-0.5 rounded">
              {item.discount}% OFF
            </span> */}
          </div>
        ) : (
          <span className="text-gray-800 font-semibold">₹{item.price}</span>
        )}

        {/* Description */}
        <p className="text-gray-600 text-sm mt-2 line-clamp-2">
          {item.description}
        </p>
      </CardContent>
    </Card>
  );
}
