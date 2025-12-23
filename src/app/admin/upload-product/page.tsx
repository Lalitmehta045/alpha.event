"use client";

import React, { useState, DragEvent, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "react-toastify";
import { FaCloudUploadAlt } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { IoClose } from "react-icons/io5";
import { ClipLoader } from "react-spinners";
import { uploadToS3 } from "@/services/operations/upload";
import ViewImage from "@/components/admin/ViewImage";
import AddFieldComponent from "@/components/admin/AddFieldComponent";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store/store";
import { addProduct } from "@/services/operations/product";
import { ProductFormValues } from "@/@types/product";
import { getAllCategory } from "@/services/operations/category";
import { getAllSubCategory } from "@/services/operations/subcategory";
import { successAlert } from "@/utils/successAlert";
import { Category, SubCategory } from "@/@types/catregory";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useRouter } from "next/navigation";

const UploadProduct: React.FC = () => {
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

  const token = useSelector((state: RootState) => state.auth.token);
  const allCategory: Category[] = useSelector(
    (state: RootState) => state.product.allCategory
  );
  const allSubCategory: SubCategory[] = useSelector(
    (state: RootState) => state.product.allSubCategory
  );
  const router = useRouter();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const [imageLoading, setImageLoading] = useState(false);
  const [viewImageURL, setViewImageURL] = useState("");
  const [openAddField, setOpenAddField] = useState(false);
  const [fieldName, setFieldName] = useState("");

  // ✅ Image Upload
  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setImageLoading(true);
      const url = await uploadToS3(file);
      if (url) {
        const currentImages = form.getValues("image") || [];
        form.setValue("image", [...currentImages, url]);
        toast.success("Image uploaded successfully!");
      }
    } catch (err) {
      console.error("Image upload error:", err);
      toast.error("Image upload failed");
    } finally {
      setImageLoading(false);
    }
  };

  // ✅ Drag & Drop Upload
  const handleDragOver = (e: DragEvent<HTMLLabelElement>) => e.preventDefault();
  const handleDrop = async (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    try {
      setImageLoading(true);
      // const url = await uploadToS3(file);
      // if (url) {
      //   const currentImages = form.getValues("image") || [];
      //   form.setValue("image", [...currentImages, url]);
      //   toast.success("Image uploaded successfully!");
      // }
    } catch (err) {
      toast.error("Image upload failed");
    } finally {
      setImageLoading(false);
    }
  };

  // ✅ Remove selected category
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

  // ✅ Delete image
  const handleDeleteImage = (index: number) => {
    const current = form.getValues("image");
    const updated = current.filter((_, i) => i !== index);
    form.setValue("image", updated);
  };

  // ✅ Add dynamic field
  const handleAddField = () => {
    if (!fieldName) return;
    const current = form.getValues("more_details");
    form.setValue("more_details", { ...current, [fieldName]: "" });
    setFieldName("");
    setOpenAddField(false);
  };

  // ✅ Submit Handler
  const onSubmit = async (values: ProductFormValues) => {
    if (!token) {
      toast.error("Unauthorized");
      router.push("/auth/sign-in");
      return;
    }

    try {
      setLoading(true);

      const formattedData = {
        ...values,
        category: values.category.map((c) => c._id),
        subCategory: values.subCategory.map((s) => s._id),
        stock: Number(values.stock),
        price: Number(values.price),
        discount: Number(values.discount),
      };

      const result = await addProduct(formattedData, token);

      if (result) {
        successAlert("Product created successfully");
      }

      form.reset();
    } catch (error: any) {
      console.error("ADD PRODUCT API ERROR:", error);
      toast.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllCategory(dispatch);
    getAllSubCategory(dispatch);
  }, [allCategory.length, allSubCategory.length]);

  return (
    <section className="p-2">
      <div className="space-y-3 mb-4">
        <h1 className="text-3xl font-bold text-gray-800">Upload Product</h1>

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
                href="/admin/upload-products"
                className="text-gray-700 font-medium"
              >
                Upload Product
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
          {/* ✅ Name */}
          <FormField
            control={form.control}
            name="name"
            rules={{ required: "Product name is required" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter product name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* ✅ Description */}
          <FormField
            control={form.control}
            name="description"
            rules={{ required: "Description is required" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter product description"
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* ✅ Image Upload */}
          <div className="grid gap-2">
            <Label>Images</Label>
            <label
              htmlFor="productImage"
              className="flex flex-col items-center justify-center h-24 border-2 border-dashed rounded cursor-pointer hover:bg-gray-50"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              {imageLoading ? (
                <ClipLoader size={30} color="#3b82f6" />
              ) : (
                <div className="flex flex-col items-center justify-center">
                  <FaCloudUploadAlt size={35} />
                  <p>Drag & drop or click to upload</p>
                </div>
              )}
              <input
                type="file"
                id="productImage"
                className="hidden"
                accept="image/*"
                onChange={handleUploadImage}
              />
            </label>

            {/* Preview */}
            <div className="flex flex-wrap gap-4 mt-5">
              {form.watch("image")?.map((img, index) => (
                <div
                  key={index}
                  className="relative group w-24 h-24 border border-gray-300 rounded-lg  bg-gray-100 shadow-sm"
                >
                  <img
                    src={img}
                    alt={`${img}`}
                    className="w-full h-full object-cover rounded-lg cursor-pointer group-hover:opacity-90"
                    onClick={() => setViewImageURL(img)}
                  />
                  <button
                    type="button"
                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full text-xs opacity-90 hover:bg-red-600"
                    onClick={() => handleDeleteImage(index)}
                  >
                    <MdDelete size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

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

                      form.setValue("category", [...current, categoryDetails]);
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

          {/* Sub-Category */}
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
                      className="flex items-center gap-1 bg-gray-300 text-sm font-bold px-2 py-1 border rounded-md"
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
                      const subCategoryDetails = allSubCategory.find(
                        (subCat) => subCat._id === value
                      );
                      if (!subCategoryDetails) return;

                      const current = form.getValues("subCategory");
                      if (current.some((c) => c._id === value)) return; // avoid duplicates

                      form.setValue("subCategory", [
                        ...current,
                        subCategoryDetails,
                      ]);
                    }}
                  >
                    <SelectTrigger className="w-full h-12!">
                      <SelectValue placeholder="Select SubCategory" />
                    </SelectTrigger>
                    <SelectContent>
                      {allSubCategory.map((cat) => (
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

          {/* ✅ Unit */}
          <FormField
            control={form.control}
            name="unit"
            rules={{ required: "Unit is required" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unit</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="e.g., 1kg, 500ml"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* ✅ Stock */}
          <FormField
            control={form.control}
            name="stock"
            rules={{ required: "Stock is required" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stock</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g., 100" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* ✅ Price */}
          <FormField
            control={form.control}
            name="price"
            rules={{ required: "Price is required" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g., 199" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* ✅ Discount */}
          <FormField
            control={form.control}
            name="discount"
            rules={{ required: "Discount is required" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Discount (%)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g., 10" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* ✅ Dynamic Fields */}
          {Object.entries(form.watch("more_details") || {}).map(
            ([key, value]) => (
              <div key={key} className="grid gap-1">
                <Label>{key}</Label>
                <Input
                  value={value}
                  onChange={(e) =>
                    form.setValue("more_details", {
                      ...form.getValues("more_details"),
                      [key]: e.target.value,
                    })
                  }
                />
              </div>
            )
          )}

          <Button
            variant="outline"
            type="button"
            onClick={() => setOpenAddField(true)}
            className="hover:bg-blue-100 cursor-pointer text-black rounded-lg"
          >
            Add Fields
          </Button>

          <Button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 cursor-pointer text-white px-4 py-2 rounded-lg"
          >
            Add Product
          </Button>
        </form>
      </Form>

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
    </section>
  );
};

export default UploadProduct;
