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
import { ClipLoader } from "react-spinners";
import toast from "react-hot-toast";
import { uploadToS3 } from "@/services/operations/upload";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store/store";
import { addSubCategory } from "@/services/operations/subcategory";

import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { IoClose } from "react-icons/io5";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { successAlert } from "@/utils/successAlert";
import { CloudUpload } from "lucide-react";

interface UploadSubCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fetchData: () => void;
}

interface Category {
  _id: string;
  name: string;
  image?: string;
}

interface SubCategoryFormValues {
  name: string;
  image: string;
  category: Category[];
}

const UploadSubCategoryDialog: React.FC<UploadSubCategoryDialogProps> = ({
  open,
  onOpenChange,
  fetchData,
}) => {
  const token = useSelector((state: RootState) => state.auth.token);
  const allCategory = useSelector(
    (state: RootState) => state.product.allCategory
  );

  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  const form = useForm<SubCategoryFormValues>({
    defaultValues: {
      name: "",
      image: "",
      // "https://alpha-arts.s3.eu-north-1.amazonaws.com/uploads/A-Balloons.jpg",
      category: [],
    },
  });

  // ✅ Image upload handler
  const handleUploadSubCategoryImage = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setImageUploading(true);
      const url = await uploadToS3(file);
      if (url) {
        form.setValue("image", url);
        toast.success("Image uploaded successfully");
      }
    } catch (err) {
      console.error("Image upload error:", err);
      toast.error("Image upload failed");
    } finally {
      setImageUploading(false);
    }
  };

  // ✅ Remove selected category
  const handleRemoveCategorySelected = (categoryId: string) => {
    const currentCategories = form.getValues("category");
    const updated = currentCategories.filter((cat) => cat._id !== categoryId);
    form.setValue("category", updated);
  };

  // ✅ Submit handler
  const onSubmit = async (data: SubCategoryFormValues) => {
    if (!token) {
      toast.error("Unauthorized");
      return;
    }

    try {
      setLoading(true);
      const formattedData = {
        ...data,
        category: data.category.map((cat) => cat._id), // send only IDs
      };
      const result = await addSubCategory(formattedData, token);

      if (result) {
        successAlert("SubCategory updated successfully");
      }

      form.reset();
      onOpenChange(false);
      fetchData();
    } catch (error: any) {
      console.error("ADD SubCategory API ERROR:", error);
      toast.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-11/12 md:max-w-xl w-full p-6">
        <DialogHeader className="flex justify-between items-center">
          <DialogTitle>Add SubCategory</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 my-2"
          >
            {/* ✅ Name Field */}
            <FormField
              control={form.control}
              name="name"
              rules={{ required: "SubCategory name is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SubCategory Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter sub-category name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ✅ Image Upload Field */}
            <FormItem>
              <FormLabel>SubCategory Image</FormLabel>

              <FormControl>
                <label
                  className="h-38 w-full border border-gray-500 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 
                 cursor-pointer bg-blue-50 hover:bg-blue-100 transition"
                >
                  {imageUploading ? (
                    <ClipLoader size={30} color="#3b82f6" />
                  ) : form.watch("image") ? (
                    <img
                      src={form.watch("image")}
                      alt="subcategory"
                      className="w-full h-full object-contain rounded-xl p-2"
                    />
                  ) : (
                    <>
                      <CloudUpload className="w-8 h-8 text-blue-600" />
                      <p className="text-sm text-blue-700 font-medium">
                        Upload Image
                      </p>
                    </>
                  )}

                  {/* Hidden File Input */}
                  <Input
                    type="file"
                    accept="image/*"
                    disabled={imageUploading}
                    onChange={handleUploadSubCategoryImage}
                    className="hidden"
                  />
                </label>
              </FormControl>

              <FormMessage />
            </FormItem>

            {/* ✅ Category Selection */}
            <FormField
              control={form.control}
              name="category"
              render={() => (
                <FormItem>
                  <FormLabel>Select Category</FormLabel>

                  {/* Selected Chips */}
                  <div className="flex flex-wrap gap-2">
                    {form.watch("category").map((cat) => (
                      <div
                        key={cat._id}
                        className="flex items-center gap-1 bg-gray-300 text-sm font-bold px-2 py-1 border rounded-md"
                      >
                        {cat.name}
                        <IoClose
                          size={18}
                          className="cursor-pointer hover:text-red-500"
                          onClick={() => handleRemoveCategorySelected(cat._id)}
                        />
                      </div>
                    ))}
                  </div>

                  <FormControl>
                    <Select
                      onValueChange={(value) => {
                        const categoryDetails = allCategory.find(
                          (cat) => cat._id === value
                        );
                        if (!categoryDetails) return;

                        const current = form.getValues("category");
                        if (current.some((c) => c._id === value)) return; // avoid duplicates

                        form.setValue("category", [
                          ...current,
                          categoryDetails,
                        ]);
                      }}
                    >
                      <SelectTrigger className="w-full h-12!">
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {allCategory.map((cat) => (
                          <SelectItem key={cat._id} value={cat._id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ✅ Submit Button */}
            <DialogFooter>
              <Button
                type="submit"
                disabled={
                  !form.watch("name") || !form.watch("image") || loading
                }
                className="w-full bg-indigo-600 text-white"
              >
                {loading ? "Adding..." : "Add SubCategory"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default UploadSubCategoryDialog;
