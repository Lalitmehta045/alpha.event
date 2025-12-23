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
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "react-toastify";
import { ClipLoader } from "react-spinners";
import { uploadToS3 } from "@/services/operations/upload";
import { addCategory } from "@/services/operations/category";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store/store";
import { useForm } from "react-hook-form";
import { successAlert } from "@/utils/successAlert";
import { CloudUpload, Upload } from "lucide-react";

interface UploadCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fetchData: () => void;
}

interface CategoryFormValues {
  name: string;
  image: string;
  description: string;
}

const UploadCategoryDialog: React.FC<UploadCategoryDialogProps> = ({
  open,
  onOpenChange,
  fetchData,
}) => {
  const token = useSelector((state: RootState) => state.auth.token);
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  // ✅ Correctly type your form
  const form = useForm<CategoryFormValues>({
    defaultValues: {
      name: "",
      image: "",
      description: "",
    },
  });

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
      const result = await addCategory(data, token);
      if (result) {
        successAlert("Category created successfully");
      }
      form.reset();
      fetchData();
      onOpenChange(false);
    } catch (error: any) {
      console.error("ADD CATEGORY API ERROR:", error);
      toast.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-11/12 md:max-w-xl w-full p-6">
        <DialogHeader className="flex justify-between items-center">
          <DialogTitle>Add Category</DialogTitle>
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
                {loading ? "Adding..." : "Add Category"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default UploadCategoryDialog;
