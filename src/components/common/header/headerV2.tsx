"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation"; // ✅ correct for Next.js App Router
import navigationLinks from "@/assets/data/navigation.json";
import Link from "next/link";
import Image from "next/image";
import Comlogo from "@/assets/images/companyLogo.png";
import { Button } from "@/components/ui/button";
import CTAButtonV1 from "../ctaButton/ctaButtonV1";
import MobileBottomNav from "./MobileBottomNav";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store/store";
import { logout } from "@/services/operations/auth";
import { BsCart2 } from "react-icons/bs";
import ProfileSheet from "../profile/ProfileSheet";
import { FaSearch, FaUserCircle } from "react-icons/fa";
import { useSession, signOut } from "next-auth/react";
import { setToken, setUser } from "@/redux/slices/authSlice";
import SearchBar from "@/components/common/searchBar/searchBar";

const HeaderV2 = () => {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const reduxUser = useSelector((state: RootState) => state.auth.user);
  const { data: session } = useSession();
  
  // Check both Redux user and NextAuth session
  const user = reduxUser || session?.user;
  
  const [isOpen, setIsOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);
  const [showSearchField, setShowSearchField] = useState(false);
  const { items, totalQuantity } = useSelector(
    (state: RootState) => state.cart
  );

  useEffect(() => setIsClient(true), []);
  useEffect(() => setShowSearchField(false), [pathname]);
  if (!isClient) return null;

  const showSearchBar =
    pathname?.startsWith("/product") || pathname?.startsWith("/category");

  const scrollToSearch = () => {
    if (typeof document === "undefined") return;
    if (!showSearchBar) return;
    if (showSearchField) {
      setShowSearchField(false);
      return;
    }
    setShowSearchField(true);
    setTimeout(() => {
      const el = document.getElementById("page-search");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        const input = el.querySelector("input");
        if (input instanceof HTMLInputElement) {
          input.focus();
        }
      }
    }, 50);
  };

  const handleLogout = async () => {
    try {
      if (session?.user) {
        // For Google Auth users: Clear NextAuth session + Redux + localStorage
        await signOut({ callbackUrl: "/" });
        
        // Also clear Redux state and localStorage that were set during token generation
        dispatch(setUser(null));
        dispatch(setToken(null));
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
      } else {
        // For regular users: Use existing logout function
        await logout(router, dispatch);
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (openProfile && user) {
    return (
      <ProfileSheet openProfile={openProfile} setOpenProfile={setOpenProfile} />
    );
  }

  return (
    <>
      {/* <header className="fixed top-1 z-50 w-11/12 drop-shadow-xl/40 bg-white rounded-full"> */}
      <header className="fixed top-1 z-50 w-full drop-shadow-xl/40 bg-white rounded-2xl">
        <main className="w-full md:w-11/12 mx-auto flex items-center justify-start md:justify-between py-2 px-3">
          {/* Logo (Left) */}
          <Link href="/" className="shrink-0 mx-0 p-2">
            <Image
              src={Comlogo}
              alt="Company Logo"
              width={50}
              height={50}
              className="w-14 md:w-18 h-auto cursor-pointer"
            />
          </Link>

          {/* Center: Title + mobile search shortcut */}
          <div className="flex items-center justify-center flex-1 gap-3 md:hidden">
            <h1 className="text-2xl mr-2 font-bold text-center md:text-left">
              Alpha Art & Events
            </h1>
            {showSearchBar && (
              <button
                onClick={scrollToSearch}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-[#3a0103] text-white hover:bg-[#9c6567] transition-all duration-300"
                aria-label="Search"
              >
                <FaSearch className="text-base" />
              </button>
            )}
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex flex-1 justify-center">
            <ul className="flex gap-8 md:gap-10 lg:gap-16 text-(--primaryParagraph) text-base font-semibold">
              {navigationLinks.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.path}
                    className="hover:text-(--primaryParagraph) transition-colors duration-200"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Desktop Button */}
          <div className="hidden sm:flex items-center gap-6">
            {/* 🔥 Show Avatar only when user logged in */}
            {user ? (
              <Image
                src={user.avatar || "/assets/images/User3.png"}
                alt="Avatar"
                width={45}
                height={45}
                className="block mx-auto rounded-full cursor-pointer border"
                onClick={() => setOpenProfile(true)}
              />
            ) : (
              <FaUserCircle
                className="text-4xl hidden md:block cursor-pointer text-gray-700"
                onClick={() => router.push("/auth/sign-in")}
              />
            )}
            <div
              className="relative hidden lg:flex flex-col mr-2 md:mr-0"
              onClick={() => router.push("/cart")}
            >
              <BsCart2 className="text-3xl md:text-4xl cursor-pointer text-gray-700" />
              <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 md:w-5 h-4 md:h-5 text-xs font-bold text-white bg-red-400 rounded-full">
                {items[0] ? totalQuantity : 0}
              </span>
            </div>

            <CTAButtonV1
              variant="secondary"
              text={user ? "Logout" : "Log-In"}
              onClick={() =>
                user ? handleLogout() : router.push("/auth/sign-in")
              }
              className="hidden md:flex px-4 md:px-8 py-5 md:py-6"
            />
          </div>
        </main>

        {/* Search Bar on product/category pages */}
        {showSearchBar && showSearchField && (
          <div id="page-search" className="w-full px-4 pb-3 md:hidden">
            <SearchBar />
          </div>
        )}

        {/* Mobile Dropdown Menu */}
        {isOpen && (
          <div className="md:hidden border-t border-gray-700 bg-gray-900/90 shadow-lg backdrop-blur-md">
            <nav className="flex flex-col items-center py-4 space-y-4">
              {navigationLinks.map((item) => (
                <Link
                  key={item.id}
                  href={item.path}
                  className="text-gray-100 hover:text-indigo-400 font-medium transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}

              <Button
                onClick={() => {
                  setIsOpen(false);
                  router.push("/auth/sign-in");
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-md"
              >
                SignIn
              </Button>
            </nav>
          </div>
        )}
      </header>
      <MobileBottomNav />
    </>
  );
};

export default HeaderV2;
