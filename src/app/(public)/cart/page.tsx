"use client";

import Image from "next/image";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { FaCaretRight } from "react-icons/fa";
import { RootState } from "@/redux/store/store";
import { DisplayPriceInRupees } from "@/utils/DisplayPriceInRupees";
import { pricewithDiscount } from "@/utils/PriceWithDiscount";
import cartImg from "@/assets/images/CartImg.png";
import AddToCartButton from "@/components/common/cart/AddToCartButton";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import LayoutV2 from "../layout/layoutV2";
import { getAllCartItems } from "@/services/operations/cartItem";
import { handleAddItemCart } from "@/redux/slices/cartSlice";
import { useEffect } from "react";

export default function CartPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const token = useSelector((state: RootState) => state.auth.token);
  const { items, totalPrice, totalQuantity, totalOriginalPrice } = useSelector(
    (state: RootState) => state.cart
  );

  const fetchCartItem = async () => {
    try {
      const mappedCartData = await getAllCartItems();
      dispatch(handleAddItemCart(mappedCartData));
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchCartItem();
  }, []);

  const redirectToCheckoutPage = () => {
    if (!token) {
      toast.error("Please Login First");
      router.push("/auth/sign-in");
      return;
    }
    router.push("/orders");
  };

  return (
    // <div className="min-h-screen bg-[#f5f6fa]">
    <div className="relative flex flex-col gap-10 w-full mx-auto h-min items-center font-sans bg-(--mainBg1)">
      <LayoutV2>
        <main className="w-11/12 mx-auto px-2 md:px-6 mt-20 md:mt-28 py-10 flex flex-col gap-10">
          {/* PAGE HEADER */}
          <h1 className="text-3xl font-bold text-gray-900">
            My Shopping Cart{" "}
            <span className="text-blue-600 text-xl">
              ({totalQuantity} Items)
            </span>
          </h1>

          {items.length ? (
            <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* LEFT SECTION — CART ITEMS */}
              <div className="lg:col-span-2 flex flex-col gap-6">
                {/* SAVINGS BANNER */}
                <div className="bg-green-100 border border-green-400 rounded-lg py-3 px-4 flex justify-between items-center">
                  <p className="font-medium flex items-center gap-2 text-green-700">
                    🎉 Your total savings!
                  </p>
                  <p className="text-lg font-semibold text-green-700">
                    {DisplayPriceInRupees(totalOriginalPrice - totalPrice)}
                  </p>
                </div>

                {/* CART ITEMS */}
                <Card className="shadow-md rounded-xl">
                  <CardContent className="divide-y px-5">
                    {items.map((item: any) => (
                      <div
                        key={item._id}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-4 gap-4"
                      >
                        {/* LEFT – ICON + DETAILS */}
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-lg overflow-hidden flex justify-center items-center bg-gray-100">
                            <Image
                              src={
                                item.product?.image?.[0]
                                  ? item.product.image[0]
                                  : cartImg
                              }
                              alt={item.product?.name || "Product"}
                              width={56}
                              height={56}
                              className="object-cover w-full h-full"
                            />
                          </div>

                          <div className="text-sm">
                            <p className="font-semibold text-gray-900">
                              {item.product.name}
                            </p>

                            <p className="text-gray-500 text-xs">
                              Unit: {item.product.unit}
                            </p>

                            <div className="flex gap-2 mt-1 items-center">
                              <p className="text-blue-700 font-bold">
                                {DisplayPriceInRupees(
                                  pricewithDiscount(
                                    item.product.price,
                                    item.product.discount
                                  )
                                )}
                              </p>

                              {item.product.discount > 0 && (
                                <>
                                  <p className="line-through text-gray-400 text-xs">
                                    {DisplayPriceInRupees(item.product.price)}
                                  </p>
                                  <p className="text-green-600 text-xs">
                                    (Saved:{" "}
                                    {DisplayPriceInRupees(
                                      item.product.price -
                                        pricewithDiscount(
                                          item.product.price,
                                          item.product.discount
                                        )
                                    )}
                                    )
                                  </p>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* RIGHT – ADD/REMOVE BUTTON */}
                        <AddToCartButton
                          data={item.product}
                          className="bg-(--cta-Bg) py-2 px-3 text-white text-base"
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* RIGHT SECTION — BILL SUMMARY */}
              <div className="lg:col-span-1">
                <Card className="shadow-xl rounded-2xl sticky py-2 top-28">
                  <CardContent className="p-6 space-y-4">
                    <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                      📄 Bill Summary
                    </h3>

                    {/* MRP */}
                    <div className="flex justify-between text-sm">
                      <p className="text-gray-700">MRP Total</p>
                      <p>{DisplayPriceInRupees(totalOriginalPrice)}</p>
                    </div>

                    {/* Discount */}
                    <div className="flex justify-between text-sm">
                      <p className="text-green-700 font-medium">
                        Discount Savings
                      </p>
                      <p className="text-green-700 font-medium">
                        -{" "}
                        {DisplayPriceInRupees(totalOriginalPrice - totalPrice)}
                      </p>
                    </div>

                    {/* Delivery */}
                    <div className="flex justify-between text-sm">
                      <p className="text-gray-700">Delivery Charges will be added</p>
                      <p className="text-green-700 font-semibold"></p>
                    </div>

                    <hr className="border border-dashed border-gray-700" />

                    {/* GRAND TOTAL */}
                    <div className="flex justify-between items-center">
                      <p className="text-lg font-semibold text-gray-900">
                        Grand Total
                      </p>
                      <p className="text-2xl font-bold text-blue-700">
                        {DisplayPriceInRupees(totalPrice)}
                      </p>
                    </div>

                    {/* CHECKOUT BUTTON */}
                    <Button
                      className="w-full mt-4 bg-blue-600 hover:bg-blue-800 cursor-pointer text-white text-md py-5 rounded-lg shadow-md flex items-center gap-2 justify-center"
                      onClick={redirectToCheckoutPage}
                    >
                      Proceed to Checkout <FaCaretRight />
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            /* EMPTY CART VIEW */
            <div className="flex flex-col justify-center items-center">
              <Image
                src={cartImg}
                alt="empty cart"
                width={250}
                height={250}
                className="rounded-lg"
              />
              <Button
                asChild
                className="mt-6 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Link href="/">Shop Now</Link>
              </Button>
            </div>
          )}
        </main>
      </LayoutV2>
    </div>
  );
}
