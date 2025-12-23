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

import UploadCategoryDialog from "@/components/admin/UploadCategoryDialog";
import EditCategoryDialog from "@/components/admin/EditCategoryDialog";
import ConfirmDeleteDialog from "@/components/admin/ConfirmDialog";
import { deleteCategory, getAllCategory } from "@/services/operations/category";
import { RootState } from "@/redux/store/store";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import CategoryTableSkeleton from "./loading";
import { useRouter } from "next/navigation";
import { setAllCategory } from "@/redux/slices/product";

interface Category {
  _id: string;
  name: string;
  image?: string;
  description: string;
}

export default function CategoryPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const token = useSelector((state: RootState) => state.auth.token);
  const allCategory = useSelector(
    (state: RootState) => state.product.allCategory
  );

  const [openUploadCategory, setOpenUploadCategory] = useState(false);
  const [editData, setEditData] = useState<Category | null>(null);
  const [openEdit, setOpenEdit] = useState(false);
  const [deleteData, setDeleteData] = useState<Category | null>(null);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  // const [categories, setCategories] = useState<Category[]>([]);

  // ✅ Fetch categories (Add your API here)
  const fetchCategory = async () => {
    try {
      setLoading(true);
      const res = await getAllCategory(dispatch);
      if (Array.isArray(res)) dispatch(setAllCategory(res));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchCategory();
  }, [token]);

  // ✅ Delete Category Handler
  const handleDelete = async () => {
    if (!token) {
      toast.error("Unauthorized");
      return;
    }
    if (!deleteData) return; // prevent errors if null
    try {
      setLoading(true);
      await deleteCategory(deleteData._id, token);
      const res = await getAllCategory(dispatch);
      if (res) dispatch(setAllCategory(res));
      toast.success(`Category "${deleteData.name}" deleted successfully`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete category");
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
          <h1 className="text-3xl font-bold text-gray-800">Category</h1>

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
                  href="/admin/category"
                  className="text-gray-700 font-medium"
                >
                  Category
                </BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <Button
          onClick={() => setOpenUploadCategory(true)}
          className="bg-indigo-600 text-white"
        >
          Add Category
        </Button>
      </div>

      {/* Table Section */}
      <div className="bg-white p-3 rounded-md shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">Sr.No</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Image</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-center w-32">Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <CategoryTableSkeleton />
            ) : allCategory.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-gray-500 py-6 font-medium"
                >
                  No Category Found
                </TableCell>
              </TableRow>
            ) : (
              allCategory.map((item, index) => (
                <TableRow
                  key={item._id}
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

                  <TableCell className="font-medium">
                    {item.description}
                  </TableCell>

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
      {openUploadCategory && (
        <UploadCategoryDialog
          open={openUploadCategory}
          onOpenChange={setOpenUploadCategory}
          fetchData={fetchCategory}
        />
      )}

      {/* Edit Dialog */}
      {openEdit && editData && (
        <EditCategoryDialog
          open={openEdit}
          data={editData}
          onClose={() => setOpenEdit(false)}
          fetchData={fetchCategory}
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
