"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { GoHomeFill } from "react-icons/go";
import {
  FaInfoCircle,
  FaThLarge,
  FaRegNewspaper,
  FaUser,
  FaUserCircle,
} from "react-icons/fa";
import { MdRecentActors } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store/store";
import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { logout } from "@/services/operations/auth";
import Image from "next/image";
import { LogOut } from "lucide-react";

const MobileBottomNav = () => {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);

  const [isClient, setIsClient] = useState(false);

  useEffect(() => setIsClient(true), []);
  if (!isClient) return null;

  const navItems = [
    { name: "Home", icon: <GoHomeFill />, path: "/" },
    // { name: "About", icon: <FaInfoCircle />, path: "/about" },
    { name: "Category", icon: <FaThLarge />, path: "/category" },
    { name: "Recent", icon: <MdRecentActors />, path: "/recent" },

    // Special case for profile
    {
      name: user ? "Profile" : "Sign In",
      icon: user ? <FaUser /> : <FaUserCircle />,
      isProfile: true, // 👈 Mark this item
      path: user ? "/profile" : "/auth/sign-in",
    },
  ];

  const handleLogout = async () => {
    try {
      await logout(router, dispatch);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-lg rounded-tl-3xl rounded-tr-3xl border-t border-gray-200 flex justify-around py-4 md:hidden z-50">
      {navItems.map((item) => {
        const isActive = pathname === item.path;

        // 👉 If it's profile AND user is logged in → open sheet
        if (item.isProfile && user) {
          return (
            <Sheet key={item.name}>
              <SheetTrigger asChild>
                <button
                  className={`flex flex-col items-center justify-center text-sm font-medium ${
                    isActive ? "text-red-950" : "text-gray-500"
                  }`}
                >
                  <span className="text-2xl mb-1">{item.icon}</span>
                  <span>{item.name}</span>
                </button>
              </SheetTrigger>

              <SheetContent
                side="right"
                className="w-80 md:w-md px-4 py-8 flex flex-col justify-between"
              >
                {/* TOP SECTION */}
                <div>
                  <SheetHeader>
                    <Image
                      src={user.avatar || "/assets/images/User3.png"}
                      alt="Avatar"
                      width={120}
                      height={120}
                      className="block mx-auto rounded-full cursor-pointer border"
                    />

                    <SheetTitle className="mx-auto text-center mt-2">
                      {user?.fname} {user?.lname}
                    </SheetTitle>

                    <SheetDescription className="text-center text-sm text-gray-500">
                      {user?.email}
                    </SheetDescription>
                  </SheetHeader>

                  {/* MENU BUTTONS */}
                  <div className="mt-4 space-y-3">
                    {/* Profile */}
                    <button
                      onClick={() => router.push(`/profile/${user.id}`)}
                      className="w-full flex items-center gap-3 p-3 rounded-lg text-black hover:text-red-950 hover:bg-red-100 transition"
                    >
                      <FaUser className="w-5 h-5" />
                      <span className="text-sm font-medium">Profile</span>
                    </button>

                    {/* Settings */}
                    <button
                      onClick={() => router.push("/settings")}
                      className="w-full flex items-center gap-3 p-3 rounded-lg text-black hover:text-red-950 hover:bg-red-100 transition"
                    >
                      <FaInfoCircle className="w-5 h-5" />
                      <span className="text-sm font-medium">Settings</span>
                    </button>

                    {/* My Cart */}
                    <button
                      onClick={() => router.push("/cart")}
                      className="w-full flex items-center gap-3 p-3 rounded-lg text-black hover:text-red-950 hover:bg-red-100 transition"
                    >
                      <FaThLarge className="w-5 h-5" />
                      <span className="text-sm font-medium">My Cart</span>
                    </button>

                    {/* Orders */}
                    <button
                      onClick={() => router.push("/orders")}
                      className="w-full flex items-center gap-3 p-3 rounded-lg text-black hover:text-red-950 hover:bg-red-100 transition"
                    >
                      <MdRecentActors className="w-6 h-6" />
                      <span className="text-sm font-medium">Orders</span>
                    </button>

                    {/* Purchase History */}
                    <button
                      onClick={() => router.push("/purchase-history")}
                      className="w-full flex items-center gap-3 p-3 rounded-lg text-black hover:text-red-950 hover:bg-red-100 transition"
                    >
                      <FaRegNewspaper className="w-5 h-5" />
                      <span className="text-sm font-medium">
                        Purchase History
                      </span>
                    </button>
                  </div>
                </div>

                {/* LOGOUT BUTTON */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 cursor-pointer bg-red-950 text-white py-2 rounded-md hover:bg-red-900"
                >
                  <LogOut className="w-6 h-6" />
                  Logout
                </button>
              </SheetContent>
            </Sheet>
          );
        }

        // 👉 Default links
        return (
          <Link
            key={item.name}
            href={item.path}
            className={`flex flex-col items-center justify-center text-sm font-medium ${
              isActive ? "text-red-950 " : "text-gray-500"
            }`}
          >
            <span className="text-2xl mb-1">{item.icon}</span>
            <span>{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default MobileBottomNav;
