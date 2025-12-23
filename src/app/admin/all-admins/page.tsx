"use client";

import { DataTable } from "@/components/admin/users/data-table";
import { columns } from "@/components/admin/users/columns";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import ViewUserDialog from "@/components/admin/users/view-user-dialog";
import { useEffect, useState } from "react";
import { USERS } from "@/@types/user";
import {
  getAll_ADMIN,
  getAllUSERS_ADMIN,
} from "@/services/operations/adminOperations/allUsers";
import { RootState } from "@/redux/store/store";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import ViewAdminDialog from "@/components/admin/users/view-admin-dialog";

export default function AdminsPage() {
  const router = useRouter();
  const token = useSelector((state: RootState) => state.auth.token);
  const [selectedUser, setSelectedUser] = useState<USERS | null>(null);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [allUser, setAllUsers] = useState<USERS[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const handleView = (user: USERS) => {
    setSelectedUser(user);
    setOpenViewDialog(true);
  };

  const fetchAdmins = async () => {
    if (!token) {
      toast.error("Unauthorized");
      router.push("/auth/sign-in");
      return;
    }
    try {
      setLoading(true);
      const res = await getAll_ADMIN(token, searchTerm);
      setAllUsers(res);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    const delayDebounce = setTimeout(() => {
      fetchAdmins();
    }, 400); // debounce

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, allUser.length]); // 🔥 run when search changes

  return (
    <div className="p-1.5 space-y-6">
      <div className="space-y-3">
        <h1 className="text-3xl font-bold text-gray-800">All Admins</h1>

        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                href="/admin"
                className="text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                Dashboard
              </BreadcrumbLink>
            </BreadcrumbItem>

            <BreadcrumbSeparator />

            <BreadcrumbItem>
              <BreadcrumbLink
                href="/admin/all-admins"
                className="text-gray-700 font-medium"
              >
                All Admins
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Search Input */}
      <div className="relative space-y-2 max-w-xs sm:max-w-sm">
        <label className="text-sm font-medium text-gray-700">Search</label>
        <Search className="absolute left-3 top-12.5 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search by Name, Email, and Phone..."
          className="pl-10 w-full mt-2"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <DataTable
        loading={loading}
        columns={columns}
        data={allUser}
        onView={handleView}
      />

      {selectedUser && (
        <ViewAdminDialog
          open={openViewDialog}
          fetchAdmins={fetchAdmins}
          onOpenChange={setOpenViewDialog}
          user={selectedUser!}
        />
      )}
    </div>
  );
}
