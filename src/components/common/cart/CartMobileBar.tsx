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
          bg-[#047857]/95 backdrop-blur-md px-4 py-3 rounded-full text-white text-sm flex items-center justify-between gap-4 shadow-[0_8px_30px_rgb(4,120,87,0.4)] cart-bar border border-white/20"
        >
          {/* <Link href="/cart" className="flex items-center gap-4"> */}
          <div className="p-2.5 bg-white/20 rounded-full shadow-inner flex items-center justify-center">
            <FaCartShopping size={20} color="white" />
          </div>

          <div className="flex flex-col -ml-1">
            <span className="text-[16px] font-bold text-white tracking-wide drop-shadow-sm">View Cart</span>
            <p className="text-[12px] text-[#a7f3d0] font-medium">{totalQty} items</p>
          </div>

          <div className="flex items-center justify-center p-2 bg-white text-[#047857] rounded-full shadow-lg">
            <MdKeyboardArrowRight size={24} />
          </div>
          {/* </Link> */}
        </div>
      </div>
    </>
  );
}
