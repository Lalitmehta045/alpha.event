import React from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { MdRecentActors } from "react-icons/md";
import {
  FaInfoCircle,
  FaRegNewspaper,
  FaThLarge,
  FaUser,
  FaUserCircle,
} from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store/store";
import { logout } from "@/services/operations/auth";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { LogOut } from "lucide-react";
import { useSession, signOut } from "next-auth/react";

interface ProfileSheetProps {
  openProfile: boolean;
  setOpenProfile: React.Dispatch<React.SetStateAction<boolean>>;
  item?: string;
}

const ProfileSheet = ({
  openProfile,
  setOpenProfile,
  item,
}: ProfileSheetProps) => {
  const router = useRouter();
  const dispatch = useDispatch();

  const reduxUser: any = useSelector((state: RootState) => state.auth.user);
  const { data: session } = useSession();
  const user: any = reduxUser || session?.user;

  if (!user) {
    // No user logged in – don't render sheet
    return null;
  }

  const handleLogout = async () => {
    try {
      if (session?.user) {
        await signOut({ callbackUrl: "/" });
      } else {
        await logout(router, dispatch);
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <Sheet open={openProfile} onOpenChange={setOpenProfile}>
      {/* SHEET CONTENT */}
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
              onClick={() => setOpenProfile(true)} // ⬅ open sheet
            />

            <SheetTitle className="mx-auto text-center mt-2">
              {user?.fname || user?.name} {user?.lname || ""}
            </SheetTitle>

            <SheetDescription className="text-center text-sm text-gray-500">
              {user?.email}
            </SheetDescription>
          </SheetHeader>

          {/* MENU BUTTONS */}
          <div className="mt-4 space-y-3">
            {/* Profile */}
            <button
              onClick={() => router.push(`/profile/${user.id || ""}`)}
              className="w-full cursor-pointer flex items-center gap-3 p-3 rounded-lg text-black hover:text-red-950 hover:bg-red-100 transition"
            >
              <FaUser className="w-5 h-5" />
              <span className="text-sm font-medium">Profile</span>
            </button>

            {/* Settings */}
            <button
              onClick={() => router.push("/settings")}
              className="w-full cursor-pointer flex items-center gap-3 p-3 rounded-lg text-black hover:text-red-950 hover:bg-red-100 transition"
            >
              <FaInfoCircle className="w-5 h-5" />
              <span className="text-sm font-medium">Settings</span>
            </button>

            {/* My Cart */}
            <button
              onClick={() => router.push("/cart")}
              className="w-full cursor-pointer flex items-center gap-3 p-3 rounded-lg text-black hover:text-red-950 hover:bg-red-100 transition"
            >
              <FaThLarge className="w-5 h-5" />
              <span className="text-sm font-medium">My Cart</span>
            </button>

            {/* Orders */}
            <button
              onClick={() => router.push("/orders")}
              className="w-full cursor-pointer flex items-center gap-3 p-3 rounded-lg text-black hover:text-red-950 hover:bg-red-100 transition"
            >
              <MdRecentActors className="w-5 h-5" />
              <span className="text-sm font-medium">Orders</span>
            </button>

            {/* Purchase History */}
            <button
              onClick={() => router.push("/purchase-history")}
              className="w-full cursor-pointer flex items-center gap-3 p-3 rounded-lg text-black hover:text-red-950 hover:bg-red-100 transition"
            >
              <FaRegNewspaper className="w-5 h-5" />
              <span className="text-sm font-medium">Purchase History</span>
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
};

export default ProfileSheet;
