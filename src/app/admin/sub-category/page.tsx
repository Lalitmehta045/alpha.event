"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { FiEdit } from "react-icons/fi";
import { MdDelete } from "react-icons/md";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import UploadSubCategoryDialog from "@/components/admin/UploadSubCategoryDialog";
import EditSubCategoryDialog from "@/components/admin/EditSubCategoryDialog";
import ConfirmDeleteDialog from "@/components/admin/ConfirmDialog";
import {
  deleteSubCategory,
  getAllSubCategory,
} from "@/services/operations/subcategory";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store/store";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import SubCategoryTableSkeleton from "./loading";
import { useRouter } from "next/navigation";

interface SubCategory {
  _id: string;
  name: string;
  image?: string;
  category?: { _id: string; name: string };
}

export default function SubCategoryPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const token = useSelector((state: RootState) => state.auth.token);
  const [openUploadSubCategory, setOpenUploadSubCategory] = useState(false);
  const [editData, setEditData] = useState<SubCategory | null>(null);
  const [openEdit, setOpenEdit] = useState(false);
  const [deleteData, setDeleteData] = useState<SubCategory | null>(null);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const allSubCategory = useSelector(
    (state: RootState) => state.product.allSubCategory
  );

  // ✅ Fetch SubCategories (Add your API here)
  const fetchSubCategory = async () => {
    if (!token) {
      toast.error("Unauthorized");
      router.push("/auth/sign-in");
      return;
    }
    try {
      setLoading(true);
      const res = await getAllSubCategory(dispatch);
      setSubCategories(res);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchSubCategory();
    }
  }, [token, subCategories.length, allSubCategory.length]);

  // ✅ Delete Category Handler
  const handleDelete = async () => {
    if (!token) {
      toast.error("Unauthorized");
      return;
    }
    if (!deleteData) return;
    try {
      setLoading(true);

      await deleteSubCategory(deleteData._id, token);

      const res = await getAllSubCategory(dispatch);
      if (res) setSubCategories(res);

      toast.success(`Sub-Category "${deleteData.name}" deleted successfully`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete sub-category");
    } finally {
      setOpenDeleteConfirm(false);
      setLoading(false);
    }
  };

  return (
    <section className="p-1.5 md:p-2">
      {/* Header Bar */}
      <div className="flex items-center justify-between mb-5">
        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-gray-800">SubCategory</h1>

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
                  href="/admin/sub-category"
                  className="text-gray-700 font-medium"
                >
                  Sub-category
                </BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <Button
          onClick={() => setOpenUploadSubCategory(true)}
          className="bg-indigo-600 text-white"
        >
          Add SubCategory
        </Button>
      </div>

      {/* Table Section */}
      <div className="bg-white p-4 rounded-md shadow">
        <Table>
          <TableHeader>
            <TableRow>
              {/* VVVVVV ERROR FIX APPLIED HERE VVVVVV */}
              <TableHead className="w-16">Sr.No</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Image</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-center w-32">Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <SubCategoryTableSkeleton />
            ) : subCategories.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-gray-500 py-6 font-medium"
                >
                  No SubCategory Found
                </TableCell>
              </TableRow>
            ) : (
              subCategories.map((item, index) => (
                <TableRow
                  key={index}
                  className="hover:bg-gray-100 px-2 overflow-x-scroll"
                >
                  <TableCell className="px-6 text-center">
                    {index + 1}
                  </TableCell>

                  <TableCell className="font-medium">{item.name}</TableCell>

                  <TableCell>
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={45}
                        height={45}
                        className="object-cover rounded-xs w-14 h-12"
                      />
                    ) : (
                      <span className="text-gray-400">No Image</span>
                    )}
                  </TableCell>

                  {/* ✅ Display Category Name */}
                  <TableCell>{item.category?.name || "Unknown"}</TableCell>

                  <TableCell>
                    <div className="flex gap-3 justify-center">
                      {/* EDIT */}
                      <button
                        onClick={() => {
                          setEditData(item);
                          setOpenEdit(true);
                        }}
                        className="p-2 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition"
                      >
                        <FiEdit size={18} />
                      </button>

                      {/* DELETE */}
                      <button
                        onClick={() => {
                          setDeleteData(item);
                          setOpenDeleteConfirm(true);
                        }}
                        className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition"
                      >
                        <MdDelete size={20} />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {loading && (
          <p className="text-center py-4 text-gray-500">Loading...</p>
        )}
      </div>

      {/* Add Category Dialog */}
      {openUploadSubCategory && (
        <UploadSubCategoryDialog
          open={openUploadSubCategory}
          onOpenChange={setOpenUploadSubCategory}
          fetchData={fetchSubCategory}
        />
      )}

      {/* Edit Dialog */}
      {openEdit && editData && (
        <EditSubCategoryDialog
          open={openEdit}
          data={editData}
          onClose={() => setOpenEdit(false)}
          fetchData={fetchSubCategory}
        />
      )}

      {/* Confirm Delete Dialog */}
      {openDeleteConfirm && deleteData && (
        <ConfirmDeleteDialog
          open={openDeleteConfirm}
          onOpenChange={setOpenDeleteConfirm}
          title="Delete Category"
          description={`Are you sure you want to delete "${deleteData.name}"?`}
          onConfirm={handleDelete}
          onCancel={() => setOpenDeleteConfirm(false)}
        />
      )}
    </section>
  );
}
