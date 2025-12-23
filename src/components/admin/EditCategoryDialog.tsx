"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ClipLoader } from "react-spinners";
import { uploadToS3 } from "@/services/operations/upload";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store/store";
import { editCategory } from "@/services/operations/category";
import { CloudUpload } from "lucide-react";

interface EditCategoryDialogProps {
  open: boolean;
  onClose: () => void;
  fetchData: () => void;
  data: {
    _id: string;
    name: string;
    image?: string;
    description: string;
  };
}

interface CategoryFormValues {
  _id: string;
  name: string;
  image: string;
  description: string;
}

const EditCategoryDialog: React.FC<EditCategoryDialogProps> = ({
  open,
  onClose,
  fetchData,
  data: categoryData,
}) => {
  const token = useSelector((state: RootState) => state.auth.token);

  // ✅ Correctly type your form
  const form = useForm<CategoryFormValues>({
    defaultValues: {
      _id: categoryData._id,
      name: categoryData.name,
      image: categoryData.image || "",
      description: categoryData.description || "",
    },
  });

  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  const handleUploadCategoryImage = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setImageUploading(true);
      const url = await uploadToS3(file);
      if (url) {
        form.setValue("image", url); // ✅ update form value
        toast.success("Image uploaded successfully!");
      }
    } catch (err) {
      console.error("Image upload error:", err);
      toast.error("Image upload failed");
    } finally {
      setImageUploading(false);
    }
  };

  const onSubmit = async (data: CategoryFormValues) => {
    if (!token) {
      toast.error("Unauthorized");
      return;
    }

    try {
      setLoading(true);

      const result = await editCategory(data._id, data, token); // ✅ FIXED ORDER
      if (result) {
        toast.success(`Category "${data.name}" updated successfully!`);
        form.reset();
        fetchData();
        onClose();
      }
    } catch (error: any) {
      console.error("EDIT CATEGORY ERROR:", error);
      toast.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(state) => !state && onClose()}>
      <DialogContent className="max-w-11/12 md:max-w-xl w-full p-6">
        {/* HEADER */}
        <DialogHeader className="flex justify-between items-center">
          <DialogTitle>Update Category</DialogTitle>
        </DialogHeader>

        {/* ✅ shadcn + react-hook-form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Name Field */}
            <FormField
              control={form.control}
              name="name"
              rules={{ required: "Category name is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter category name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Image Upload Field */}
            <FormItem>
              <FormLabel>Category Image</FormLabel>

              <FormControl>
                <label
                  className="h-38 w-full border border-gray-500 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 
                 cursor-pointer bg-muted hover:bg-gray-100 transition"
                >
                  {imageUploading ? (
                    <ClipLoader size={30} color="#3b82f6" />
                  ) : form.watch("image") ? (
                    <img
                      src={form.watch("image")}
                      alt="category"
                      className="w-full h-full object-contain rounded-xl p-2"
                    />
                  ) : (
                    <>
                      <CloudUpload className="w-8 h-8 text-gray-500" />
                      <p className="text-sm text-gray-600">Upload Image</p>
                    </>
                  )}

                  {/* Hidden Input */}
                  <Input
                    type="file"
                    accept="image/*"
                    disabled={imageUploading}
                    onChange={handleUploadCategoryImage}
                    className="hidden"
                  />
                </label>
              </FormControl>

              <FormMessage />
            </FormItem>

            <FormField
              control={form.control}
              name="description"
              rules={{ required: "Category description is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter description name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <DialogFooter>
              <Button
                type="submit"
                className="w-full bg-indigo-600 text-white"
                disabled={!form.watch("name") || loading}
              >
                {loading ? "Updating..." : "Update Category"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditCategoryDialog;
