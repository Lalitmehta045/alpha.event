"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import Image from "next/image";
import { FaCaretRight } from "react-icons/fa";
import { useSelector } from "react-redux";
import Link from "next/link";
import imageEmpty from "@/assets/images/DummyImg.jpg";
import toast from "react-hot-toast";
import { DisplayPriceInRupees } from "@/utils/DisplayPriceInRupees";
import { pricewithDiscount } from "@/utils/PriceWithDiscount";
import { RootState } from "@/redux/store/store";
import { useRouter } from "next/navigation";
import AddToCartButton from "./AddToCartButton";

interface CartSheetProps {
  openCart: boolean;
  setOpenCart: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function CartSheet({ openCart, setOpenCart }: CartSheetProps) {
  const token = useSelector((state: RootState) => state.auth.token);
  const router = useRouter();
  const { items, totalPrice, totalQuantity, totalOriginalPrice } = useSelector(
    (state: RootState) => state.cart
  );

  const redirectToCheckoutPage = () => {
    if (!token) {
      toast.error("Please Login First"); // Correct: Prompts user to log in
      router.push("/auth/sign-in");
      return;
    } // If token exists, proceed to orders
    router.push("/orders");
  };

  return (
    <Sheet open={openCart} onOpenChange={setOpenCart}>
      <SheetContent
        side="right"
        className="p-0 w-80 md:w-md flex flex-col bg-white"
      >
        {/* HEADER */}
        <SheetHeader>
          <SheetTitle>My Cart</SheetTitle>
        </SheetHeader>

        {/* BODY */}
        <div className="min-h-[70vh] max-h-[calc(100vh-160px)] overflow-auto p-3 flex flex-col gap-3">
          {items.length ? (
            <>
              {/* SAVINGS SECTION */}
              <div className="flex items-center justify-between px-4 py-2 bg-red-950 text-white rounded-full">
                <p>Your total savings</p>
                <p>{DisplayPriceInRupees(totalOriginalPrice - totalPrice)}</p>
              </div>

              {/* CART ITEMS */}
              <div className="rounded-lg p-4 grid gap-4">
                {items.map((item: any) => (
                  <div key={item._id} className="flex gap-4 w-full">
                    {/* IMAGE */}
                    <div className="w-16 h-16 border rounded ">
                      <Image
                        src={item.product.image[0] || imageEmpty}
                        alt={item.name || "empty.jpg"}
                        width={64}
                        height={64}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-contain"
                      />
                    </div>

                    {/* PRODUCT INFO */}
                    <div className="flex-1 text-sm">
                      <p className="line-clamp-2">
                        Product Name: {item.product.name}
                      </p>
                      <p className="text-gray-400">unit: {item.product.unit}</p>
                      <p className="font-semibold">
                        Price:{" "}
                        {DisplayPriceInRupees(
                          pricewithDiscount(
                            item.product.price,
                            item.product.discount
                          )
                        )}
                      </p>
                    </div>

                    {/* ADD TO CART BUTTON */}
                    <AddToCartButton data={item} />
                  </div>
                ))}
              </div>

              {/* BILL DETAILS */}
              <div className="p-4 space-y-2 rounded">
                <h3 className="font-semibold">Bill details</h3>

                {/* <div className="flex justify-between">
                  <p>Items total</p>
                  <p>
                    <span className="line-through text-gray-400 mr-2">
                      {DisplayPriceInRupees(totalPrice)}
                    </span>
                    <span>{DisplayPriceInRupees(totalPrice)}</span>
                  </p>
                </div> */}

                <div className="flex justify-between">
                  <p>Items total</p>
                  <p className="flex items-center gap-2">
                    <span className="line-through text-neutral-400">
                      {DisplayPriceInRupees(totalOriginalPrice)}
                    </span>
                    <span>{DisplayPriceInRupees(totalPrice)}</span>
                  </p>
                </div>

                <div className="flex justify-between">
                  <p>Quantity total</p>
                  <p>{totalQuantity} items</p>
                </div>

                <div className="flex justify-between">
                  <p>Delivery Charge</p>
                  <p>Free</p>
                </div>

                <div className="flex justify-between font-semibold border-t pt-2">
                  <p>Grand total</p>
                  <p>{DisplayPriceInRupees(totalPrice)}</p>
                </div>
              </div>
            </>
          ) : (
            // EMPTY CART
            <div className="flex flex-col justify-center items-center rounded-lg p-6">
              <Image
                src={imageEmpty}
                alt="empty"
                width={200}
                height={200}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="rounded-lg"
              />
              <Link
                href="/"
                onClick={() => setOpenCart(false)}
                className="mt-5 bg-red-950 text-white px-4 py-2 rounded-lg"
              >
                Shop Now
              </Link>
            </div>
          )}
        </div>

        {/* BOTTOM CHECKOUT BAR */}
        {items.length > 0 && (
          <div className="p-3 border-t">
            <div className="bg-red-950 text-white px-4 py-4 rounded-lg flex items-center justify-between font-bold">
              <div>{DisplayPriceInRupees(totalPrice)}</div>

              <button
                onClick={redirectToCheckoutPage}
                className="flex items-center gap-1"
              >
                Proceed <FaCaretRight />
              </button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
