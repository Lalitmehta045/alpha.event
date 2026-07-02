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
  const user = useSelector((state: RootState) => state.auth.user);

  const [show, setShow] = useState(false);

  // Trigger animation when cart updates
  useEffect(() => {
    if (cart.length > 0) {
      setShow(true);
    } else {
      setShow(false);
    }
  }, [cart]);

  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER-ADMIN";
  const isAdminPath = path?.startsWith("/admin");

  if (!cart || cart.length === 0) return null;
  if (isAdmin || isAdminPath) return null;

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
          bg-[#f8efde] px-3.5 py-2.5 rounded-full text-gray-900 text-sm flex items-center justify-between gap-4 shadow-xl cart-bar"
        >
          {/* <Link href="/cart" className="flex items-center gap-4"> */}
          <div className="p-2 bg-white rounded-full shadow-sm">
            <FaCartShopping size={22} color="#3a0103" />
          </div>

          <div className="flex flex-col -ml-1">
            <span className="text-base font-bold text-gray-900">View Cart</span>
            <p className="text-xs text-gray-700 font-medium">{totalQty} items</p>
          </div>

          <div className="flex items-center gap-1 p-2 bg-[#3a0103] text-white rounded-full">
            <MdKeyboardArrowRight size={24} />
          </div>
          {/* </Link> */}
        </div>
      </div>
    </>
  );
}
