"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { ProductFormValues, Product } from "@/@types/product";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "react-toastify";
import { ClipLoader } from "react-spinners";
import { uploadToS3 } from "@/services/operations/upload";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store/store";
import { MdDelete } from "react-icons/md";
import { FiUploadCloud } from "react-icons/fi"; // Import the cloud upload icon
import ViewImage from "../ViewImage";
import {
  editProduct,
  getAllProduct,
  getProductDetail,
} from "@/services/operations/product";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { IoClose } from "react-icons/io5";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getAllCategory } from "@/services/operations/category";
import { getAllSubCategory } from "@/services/operations/subcategory";
import AddFieldComponent from "../AddFieldComponent";
import { successAlert } from "@/utils/successAlert";
import { Category, SubCategory } from "@/@types/catregory";

interface EditProductDialogProps {
  open: boolean;
  onClose: () => void;
  productId: string;
}

const EditProductDialog: React.FC<EditProductDialogProps> = ({
  open,
  onClose,
  productId,
}) => {
  const token = useSelector((state: RootState) => state.auth.token);
  const allCategory: Category[] = useSelector(
    (state: RootState) => state.product.allCategory
  );
  const allSubCategory: SubCategory[] = useSelector(
    (state: RootState) => state.product.allSubCategory
  );

  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [viewImageURL, setViewImageURL] = useState("");
  const [openAddField, setOpenAddField] = useState(false);
  const [fieldName, setFieldName] = useState("");

  // Ref for the hidden file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  // React Hook Form
  const form = useForm<ProductFormValues>({
    defaultValues: {
      name: "",
      image: [],
      category: [],
      subCategory: [],
      unit: "",
      stock: 0,
      price: 0,
      discount: 0,
      description: "",
      more_details: {},
    },
  });

  const handleRemoveCategorySelected = (categoryId: string) => {
    const currentCategories = form.getValues("category");
    const updated = currentCategories.filter((cat) => cat._id !== categoryId);
    form.setValue("category", updated);
  };

  // ✅ Remove selected subcategory
  const handleRemoveSubCategorySelected = (subCategoryId: string) => {
    const currentSubCategories = form.getValues("subCategory");
    const updated = currentSubCategories.filter(
      (subCat) => subCat._id !== subCategoryId
    );
    form.setValue("subCategory", updated);
  };

  // Upload image
  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setImageLoading(true);
      const url = await uploadToS3(file);

      if (url) {
        const imgs = form.getValues("image") || [];
        form.setValue("image", [...imgs, url]);
        toast.success("Image uploaded successfully!");
      }
    } catch (err) {
      toast.error("Image upload failed");
    } finally {
      setImageLoading(false);
      // Reset the file input value to allow uploading the same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDeleteImage = (index: number) => {
    const imgs = form.getValues("image");
    form.setValue(
      "image",
      imgs.filter((_, i) => i !== index)
    );
  };

  // ✅ Add dynamic field
  const handleAddField = () => {
    if (!fieldName) return;
    const current = form.getValues("more_details");
    form.setValue("more_details", { ...current, [fieldName]: "" });
    setFieldName("");
    setOpenAddField(false);
  };

  const onSubmit = async (values: ProductFormValues) => {
    if (!token) {
      toast.error("Unauthorized");
      return;
    }
    try {
      setLoading(true);

      const payloadToSend = {
        ...values,
        category: values.category.map((c) => c._id),
        subCategory: values.subCategory.map((s) => s._id),
        stock: Number(values.stock),
        price: Number(values.price),
        discount: Number(values.discount),
      };

      const updatedProduct = await editProduct(productId, payloadToSend, token); // Sends IDs to API ✅

      if (updatedProduct) {
        await getAllProduct(dispatch);
        successAlert("Product updated successfully");
        onClose();
      }
    } catch (err: any) {
      toast.error(err.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  const loadProduct = async () => {
    try {
      setLoading(true);
      const product = await getProductDetail(productId, dispatch);

      if (product) {
        const categoryIds = new Set<string>();
        const uniqueCategories = (product.category || []).filter((cat) => {
          if (categoryIds.has(cat._id)) {
            return false; // Found a duplicate, exclude it
          }
          categoryIds.add(cat._id);
          return true; // Keep the first occurrence
        });

        const subCategoryIds = new Set<string>();
        const uniqueSubCategories = (product.subCategory || []).filter(
          (subCat) => {
            if (subCategoryIds.has(subCat._id)) {
              return false; // Found a duplicate, exclude it
            }
            subCategoryIds.add(subCat._id);
            return true; // Keep the first occurrence
          }
        );

        form.reset({
          ...product,
          image: product.image || [],
          category: uniqueCategories as Category[],
          subCategory: uniqueSubCategories as SubCategory[],
          more_details: product.more_details || {},
        });
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load product");
    } finally {
      setLoading(false);
    }
  };

  // Load existing product data
  useEffect(() => {
    if (!productId) return;

    getAllCategory(dispatch);
    getAllSubCategory(dispatch);
  }, [productId]);

  useEffect(() => {
    if (!productId) return;
    if (allCategory.length === 0) return;
    if (allSubCategory.length === 0) return;

    loadProduct();
  }, [productId, allCategory, allSubCategory]);

  // Function to trigger file input click
  const handleUploadBoxClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      {/* MODIFIED: Use fluid width (w-[95vw]) on mobile and responsive max-widths (sm:max-w-lg md:max-w-3xl)
        to ensure the dialog adapts correctly to all screen sizes.
      */}
      <DialogContent className="w-[95vw] sm:max-w-lg md:max-w-3xl lg:max-w-4xl max-h-[90vh] overflow-y-scroll scroll-smooth no-scrollbar">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-10">
            <ClipLoader />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
              {/* Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea rows={3} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Image Upload - MODIFIED SECTION */}
              <div className="space-y-2">
                <FormLabel>Product Images</FormLabel>

                {imageLoading ? (
                  <div className="w-full flex justify-center py-4">
                    <ClipLoader size={30} color="#3b82f6" />
                  </div>
                ) : (
                  // The new clickable upload box
                  <div
                    onClick={handleUploadBoxClick} // Trigger hidden input click
                    className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:text-blue-500 transition-colors"
                  >
                    <FiUploadCloud size={40} className="text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">
                      Click to upload or drag and drop
                    </p>
                    <input
                      type="file"
                      id="productImage"
                      className="hidden" // Keep the input hidden
                      accept="image/*"
                      onChange={handleUploadImage}
                      ref={fileInputRef} // Assign ref to the input
                    />
                  </div>
                )}

                {/* Image grid */}
                <div className="flex flex-wrap gap-2 mt-5">
                  {form.watch("image")?.map((img, index) => (
                    <div
                      key={index}
                      className="relative group w-24 h-24 border rounded-lg bg-gray-100"
                    >
                      <img
                        src={img}
                        alt={`Product image ${index + 1}`}
                        className="w-full h-full object-cover cursor-pointer rounded-lg"
                        onClick={() => setViewImageURL(img)}
                      />
                      <button
                        type="button"
                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        onClick={() => handleDeleteImage(index)}
                      >
                        <MdDelete size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Category */}
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
                          className="flex items-center gap-1 bg-gray-300 px-2 py-1 rounded-md text-sm"
                        >
                          {cat.name}
                          <IoClose
                            size={18}
                            className="cursor-pointer hover:text-red-500"
                            onClick={() =>
                              handleRemoveCategorySelected(cat._id)
                            }
                          />
                        </div>
                      ))}
                    </div>

                    <FormControl>
                      <Select
                        onValueChange={(value) => {
                          const found = allCategory.find(
                            (c) => c._id === value
                          );
                          if (!found) return;
                          const current = form.getValues("category");
                          if (current.some((c) => c._id === value)) return;

                          form.setValue("category", [...current, found]);
                        }}
                      >
                        <SelectTrigger className="w-full h-12">
                          <SelectValue placeholder="Select Category" />
                        </SelectTrigger>
                        <SelectContent>
                          {allCategory.map((cat) => (
                            <SelectItem
                              key={cat._id}
                              value={cat._id}
                              className="cursor-pointer hover:bg-gray-100" // Added hover style
                            >
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

              {/* SubCategory */}
              <FormField
                control={form.control}
                name="subCategory"
                render={() => (
                  <FormItem>
                    <FormLabel>Select SubCategory</FormLabel>

                    {/* Selected Chips */}
                    <div className="flex flex-wrap gap-2">
                      {form.watch("subCategory").map((subCat) => (
                        <div
                          key={subCat._id}
                          className="flex items-center gap-1 bg-gray-300 px-2 py-1 rounded-md text-sm"
                        >
                          {subCat.name}
                          <IoClose
                            size={18}
                            className="cursor-pointer hover:text-red-500"
                            onClick={() =>
                              handleRemoveSubCategorySelected(subCat._id)
                            }
                          />
                        </div>
                      ))}
                    </div>

                    <FormControl>
                      <Select
                        onValueChange={(value) => {
                          const found = allSubCategory.find(
                            (s) => s._id === value
                          );
                          if (!found) return;

                          const current = form.getValues("subCategory");
                          if (current.some((c) => c._id === value)) return;

                          form.setValue("subCategory", [...current, found]);
                        }}
                      >
                        <SelectTrigger className="w-full h-12">
                          <SelectValue placeholder="Select SubCategory" />
                        </SelectTrigger>
                        <SelectContent>
                          {allSubCategory.map((sub) => (
                            <SelectItem
                              key={sub._id}
                              value={sub._id}
                              className="cursor-pointer hover:bg-gray-100"
                            >
                              {sub.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Unit, Price, Stock, Discount Fields in a responsive grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Unit */}
                <FormField
                  control={form.control}
                  name="unit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Price */}
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Stock */}
                <FormField
                  control={form.control}
                  name="stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Discount */}
                <FormField
                  control={form.control}
                  name="discount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discount</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Dynamic Fields */}
              {Object.entries(form.watch("more_details") || {}).map(
                ([key, value]) => (
                  <FormItem key={key}>
                    <FormLabel>{key}</FormLabel>
                    <FormControl>
                      <Input
                        value={value}
                        onChange={(e) =>
                          form.setValue("more_details", {
                            ...form.getValues("more_details"),
                            [key]: e.target.value,
                          })
                        }
                      />
                    </FormControl>
                  </FormItem>
                )
              )}

              <Button
                variant="outline"
                type="button"
                onClick={() => setOpenAddField(true)}
                className="mt-1"
              >
                Add Custom Specification Field
              </Button>

              <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="w-full sm:w-auto mt-2 sm:mt-0"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="w-full bg-indigo-600 sm:w-auto"
                >
                  {loading ? (
                    <ClipLoader size={20} color="white" />
                  ) : (
                    "Update Product"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}

        {viewImageURL && (
          <ViewImage
            url={viewImageURL}
            open={!!viewImageURL}
            onClose={() => setViewImageURL("")}
          />
        )}

        {openAddField && (
          <AddFieldComponent
            open={openAddField}
            onClose={() => setOpenAddField(false)}
            value={fieldName}
            onChange={(e) => setFieldName(e.target.value)}
            onSubmit={handleAddField}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditProductDialog;
