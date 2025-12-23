"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { FiLogOut } from "react-icons/fi";
import { useRouter } from "next/navigation"; // ✅ FIXED
import { logout } from "@/services/operations/auth";
import { useDispatch, useSelector } from "react-redux";
import {
  FolderKanban,
  History,
  Layers3,
  LayoutDashboard,
  PackageSearch,
  ShieldCheck,
  ShoppingCart,
  Upload,
  Users,
} from "lucide-react";
import { RootState } from "@/redux/store/store";
import { useEffect, useState } from "react";
import { User } from "@/redux/slices/authSlice";

export const items = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/upload-product", label: "Upload Product", icon: Upload },
  { href: "/admin/products", label: "Products", icon: PackageSearch },
  { href: "/admin/category", label: "Category", icon: FolderKanban },
  { href: "/admin/sub-category", label: "SubCategory", icon: Layers3 },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/all-admins", label: "Admins", icon: ShieldCheck },
  { href: "/admin/recent", label: "Recent", icon: History },
];

export default function AdminSidebar({
  onLinkClick,
}: {
  onLinkClick?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const [getUser, setGetUser] = useState<User | null>(null);

  // ⬅️ GET USER ROLE FROM LOCAL-STORAGE (REAL-TIME)
  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      setGetUser(JSON.parse(storedUser)); // ← Fix here
    }
  }, []);

  const filteredItems = items.filter((it) => {
    // Hide "Admins" for regular admin
    if (it.href === "/admin/all-admins") {
      return getUser?.role === "SUPER-ADMIN";
    }
    return true;
  });

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-3 mx-0 sm:mx-auto p-4 sm:py-8 text-2xl font-bold">
        <ShieldCheck className="w-8 h-8" />
        {getUser?.role === "SUPER-ADMIN" ? "Super Admin" : "Admin Panel"}
      </div>
      <Separator />

      <ScrollArea className="flex-1">
        <nav className="p-4 space-y-1">
          {filteredItems.map((it) => (
            <Link
              key={it.href}
              href={it.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition",
                pathname.startsWith(it.href)
                  ? "bg-gray-200 font-semibold"
                  : "hover:bg-gray-100"
              )}
              onClick={onLinkClick}
            >
              <it.icon className="w-5 h-5" />
              {it.label}
            </Link>
          ))}
        </nav>
      </ScrollArea>

      {/* ✅ Logout Button */}
      <div className="p-4 border-t bg-white">
        <button
          onClick={() => logout(router, dispatch)}
          className="w-full cursor-pointer flex items-center justify-center gap-2 px-3 py-2 border bg-red-200 rounded-lg text-xl font-bold text-red-600 hover:bg-red-50 transition"
        >
          Logout
          <FiLogOut fontSize={22} />
        </button>
      </div>
    </div>
  );
}
