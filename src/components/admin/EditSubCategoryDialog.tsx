"use client";

import React, { useEffect, useState } from "react";
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
} from "@/components/ui/form";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store/store";
import { editSubCategory } from "@/services/operations/subcategory";
import { IoClose } from "react-icons/io5";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { CloudUpload } from "lucide-react";

interface EditSubCategoryDialogProps {
  open: boolean;
  onClose: () => void;
  fetchData: () => void;
  data?: {
    _id: string;
    name: string;
    image?: string;
  };
}

interface Category {
  _id: string;
  name: string;
  image?: string;
}

interface SubCategoryFormValues {
  _id: string;
  name: string;
  image: string;
  category: Category[];
}

const EditSubCategoryDialog: React.FC<EditSubCategoryDialogProps> = ({
  open,
  onClose,
  fetchData,
  data: subCategoryData,
}) => {
  const allCategory = useSelector(
    (state: RootState) => state.product.allCategory
  );
  const token = useSelector((state: RootState) => state.auth.token);
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  const form = useForm<SubCategoryFormValues>({
    defaultValues: {
      _id: subCategoryData?._id || "",
      name: subCategoryData?.name || "",
      image: subCategoryData?.image || "",
      category: [],
    },
  });

  useEffect(() => {
    if (open && subCategoryData) {
      form.reset({
        _id: subCategoryData._id,
        name: subCategoryData.name,
        image: subCategoryData.image || "",
        category: [],
      });
    }
  }, [open, subCategoryData, form]);

  // ✅ Upload image handler
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
        toast.success("Image uploaded successfully!");
      }
    } catch (err) {
      console.error("Image upload error:", err);
      toast.error("Image upload failed");
    } finally {
      setImageUploading(false);
    }
  };

  // ✅ Remove selected category
  const handleRemoveCategorySelected = (id: string) => {
    const updated = form.getValues("category").filter((cat) => cat._id !== id);
    form.setValue("category", updated);
  };

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

      const result = await editSubCategory(data._id, formattedData, token);

      if (result) {
        toast.success(`SubCategory "${data.name}" updated successfully!`);
        fetchData();
        onClose();
      }
    } catch (error: any) {
      console.error("EDIT SUBCATEGORY ERROR:", error);
      toast.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!subCategoryData) return null;

  return (
    <Dialog open={open} onOpenChange={(state) => !state && onClose()}>
      <DialogContent className="max-w-11/12 md:max-w-xl w-full p-6">
        <DialogHeader className="flex justify-between items-center">
          <DialogTitle>Update SubCategory</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              rules={{ required: "SubCategory name is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SubCategory Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter sub-category name"
                      {...field}
                      className="bg-blue-50 border border-blue-100 focus:border-primary-200"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Image Upload */}
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

            {/* Category Selection */}
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

            <DialogFooter>
              <Button
                type="submit"
                className="w-full bg-indigo-600 text-white"
                disabled={!form.watch("name") || loading}
              >
                {loading ? "Updating..." : "Update SubCategory"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditSubCategoryDialog;
