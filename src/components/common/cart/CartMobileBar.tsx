"use client";

import Link from "next/link";
import { useSelector } from "react-redux";
import { FaCartShopping } from "react-icons/fa6";
import { MdKeyboardArrowRight } from "react-icons/md";
import { RootState } from "@/redux/store/store";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function CartMobileBar() {
  const path = usePathname();
  const router = useRouter();
  const cart = useSelector((state: RootState) => state.cart.items);
  const totalQty = useSelector((state: RootState) => state.cart.totalQuantity);

  const [show, setShow] = useState(false);

  // Trigger animation when cart updates
  useEffect(() => {
    if (cart.length > 0) {
      setShow(true);
    } else {
      setShow(false);
    }
  }, [cart]);

  if (!cart || cart.length === 0) return null;

  return (
    <>
      <div
        className={`
        fixed max-w-max mx-auto flex flex-col lg:hidden bottom-24 left-0 right-0 z-50 px-3 transition-all duration-500 ease-out
        ${show ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"}
        ${path === "/cart" ? "hidden" : "block"}

      `}
        onClick={() => router.push("/cart")}
      >
        <div
          className="
          bg-green-600 px-3.5 py-2.5 rounded-full text-neutral-100 text-sm flex items-center justify-between gap-4 shadow-xl cart-bar"
        >
          {/* <Link href="/cart" className="flex items-center gap-4"> */}
          <div className="p-2 bg-gray-200 rounded-full">
            <FaCartShopping size={22} color="#00a63e" />
          </div>

          <div className="flex flex-col -ml-1">
            <span className="text-base font-medium">View Cart</span>
            <p className="text-xs">{totalQty} items</p>
          </div>

          <div className="flex items-center gap-1 p-2 bg-green-700 rounded-full">
            <MdKeyboardArrowRight size={24} />
          </div>
          {/* </Link> */}
        </div>
      </div>
    </>
  );
}
