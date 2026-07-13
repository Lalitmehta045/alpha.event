"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store/store";
import { logout } from "@/services/operations/auth";
import { FiHome, FiPackage, FiPlus, FiLogOut, FiMenu, FiX } from "react-icons/fi";
import Image from "next/image";
import logo from "@/assets/images/companyLogo.png";

const navItems = [
  { href: "/vendor", label: "Dashboard", icon: FiHome },
  { href: "/vendor/my-products", label: "My Products", icon: FiPackage },
  { href: "/vendor/upload-product", label: "Upload Product", icon: FiPlus },
];

export default function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && isAuthenticated) {
      if (
        !user ||
        !["VENDOR", "ADMIN", "SUPER-ADMIN"].includes((user as any)?.role)
      ) {
        router.replace("/");
        return;
      }

      // Vendor Status Checks
      const vStatus = (user as any)?.vendorStatus;
      
      if ((user as any)?.role === "VENDOR") {
        if (vStatus === "Pending_Profile" && pathname !== "/vendor/complete-profile") {
          router.replace("/vendor/complete-profile");
        } else if (vStatus === "Pending_Review" && pathname !== "/vendor/pending-review") {
          router.replace("/vendor/pending-review");
        } else if (vStatus === "Approved" && (pathname === "/vendor/complete-profile" || pathname === "/vendor/pending-review")) {
           router.replace("/vendor");
        }
      }
      
    } else if (mounted && !isAuthenticated) {
      router.replace("/auth/sign-in");
    }
  }, [mounted, isAuthenticated, user, pathname, router]);

  if (!mounted || !isAuthenticated) return null;

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-gray-50">
      {/* Mobile Header */}
      <div className="md:hidden bg-[#1a0a00] text-white flex items-center justify-between p-4 sticky top-0 z-40 shadow-md">
        <div className="flex items-center gap-3">
          <Image
            src={logo}
            alt="Alpha Art"
            width={32}
            height={32}
            className="rounded-lg bg-white p-1"
          />
          <span className="font-bold text-base tracking-wide">Alpha Art</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 -mr-2 text-white hover:bg-white/10 rounded-lg transition-colors">
          {isMobileMenuOpen ? <FiX className="text-2xl" /> : <FiMenu className="text-2xl" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:static inset-y-0 left-0 z-50 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out flex flex-col w-64 bg-[#1a0a00] text-white h-[100dvh] overflow-y-auto shrink-0 shadow-2xl md:shadow-none`}>
        {/* Logo & Title */}
        <div className="p-6 border-b border-white/10 hidden md:block">
          <div className="flex items-center gap-3 mb-2">
            <Image
              src={logo}
              alt="Alpha Art & Events"
              width={40}
              height={40}
              className="rounded-lg bg-white p-1"
            />
            <span className="font-bold text-lg tracking-wide">Alpha Art</span>
          </div>
          <p className="text-amber-400 font-semibold text-sm">Vendor Portal</p>
        </div>

        {/* Vendor Info Card */}
        <div className="p-4 mx-4 mt-6 bg-white/5 rounded-xl border border-white/10">
          <p className="font-semibold truncate">
            {user?.fname} {user?.lname}
          </p>
          <p className="text-xs text-gray-400 truncate mt-1">{user?.email}</p>
          <div className="mt-3 inline-block bg-amber-500/20 text-amber-400 text-xs font-bold px-2 py-1 rounded">
            VENDOR
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {(!["Pending_Profile", "Pending_Review"].includes((user as any)?.vendorStatus)) && navItems.map((item) => {
            const isActive =
              item.href === "/vendor"
                ? pathname === "/vendor"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-white/10 text-amber-400 font-medium"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <item.icon className="text-lg" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-white/10 space-y-2">
           <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-gray-400 border border-white/10 hover:bg-white/5 hover:text-white transition-all duration-200"
            >
              Go to Website
            </Link>
          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              logout(router, dispatch);
            }}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all duration-200"
          >
            <FiLogOut className="text-lg" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto h-screen">
        {children}
      </main>
    </div>
  );
}
