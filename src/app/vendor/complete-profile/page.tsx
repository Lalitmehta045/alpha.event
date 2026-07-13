"use client";

import React, { useState, useEffect, DragEvent } from "react";
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
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "react-toastify";
import { FaCloudUploadAlt } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { IoClose } from "react-icons/io5";
import { ClipLoader } from "react-spinners";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store/store";
import { getAllCategory } from "@/services/operations/category";
import { Category } from "@/@types/catregory";
import { useRouter } from "next/navigation";
import { setUser } from "@/redux/slices/authSlice";

interface CompleteProfileFormValues {
  vendorCategories: Category[];
  vendorAddress: string;
  idProof: string;
}

export default function CompleteProfilePage() {
  const form = useForm<CompleteProfileFormValues>({
    defaultValues: {
      vendorCategories: [],
      vendorAddress: "",
      idProof: "",
    },
  });

  const { token, user } = useSelector((state: RootState) => state.auth);
  const allCategory: Category[] = useSelector(
    (state: RootState) => state.product.allCategory
  );
  const dispatch = useDispatch();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (allCategory.length === 0) getAllCategory(dispatch);
  }, [allCategory.length, dispatch]);

  const handleUploadImage = async (file: File) => {
    try {
      setImageLoading(true);
      const formData = new FormData();
      formData.append("my_file", file);

      const response = await axios.post("/api/vendor/product/upload-image", formData, {
        timeout: 30000,
      });

      if (response.data.success) {
        const s3Key = response.data.result.url;
        form.setValue("idProof", s3Key);

        // Generate signed URL for preview
        try {
          const signedUrlResponse = await axios.get(
            `/api/vendor/product/preview-image?key=${encodeURIComponent(s3Key)}`
          );
          setPreviewUrl(signedUrlResponse.data.url || s3Key);
        } catch (previewError) {
          console.error("Failed to generate preview URL:", previewError);
          setPreviewUrl(s3Key);
        }

        toast.success("ID proof uploaded successfully!");
      } else {
        toast.error(response.data.message || "Failed to upload ID proof");
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.response?.data?.message || "Failed to upload ID proof");
    } finally {
      setImageLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUploadImage(file);
  };

  const handleDragOver = (e: DragEvent<HTMLLabelElement>) => e.preventDefault();
  const handleDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleUploadImage(file);
  };

  const handleDeleteImage = () => {
    form.setValue("idProof", "");
    setPreviewUrl(null);
  };

  const handleRemoveCategorySelected = (categoryId: string) => {
    const currentCategories = form.getValues("vendorCategories");
    const updated = currentCategories.filter((cat) => cat._id !== categoryId);
    form.setValue("vendorCategories", updated);
  };

  const onSubmit = async (values: CompleteProfileFormValues) => {
    if (!token) return;

    if (!values.vendorCategories.length) {
      toast.error("Please select at least one category.");
      return;
    }
    if (!values.idProof) {
      toast.error("Please upload an ID proof.");
      return;
    }

    try {
      setLoading(true);
      const formattedData = {
        vendorCategories: values.vendorCategories.map((c) => c._id),
        vendorAddress: values.vendorAddress,
        idProof: values.idProof,
      };

      const response = await axios.post("/api/vendor/complete-profile", formattedData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        toast.success("Profile submitted successfully!");
        // Update user in redux
        if (user) {
          const updatedUser = { ...user, vendorStatus: "Pending_Review" };
          dispatch(setUser(updatedUser));
          localStorage.setItem("user", JSON.stringify(updatedUser));
        }
        router.push("/vendor/pending-review");
      } else {
        toast.error(response.data.message || "Failed to submit profile");
      }
    } catch (error: any) {
      console.error("Submit Profile Error:", error);
      toast.error(error.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Complete Your Profile</h1>
        <p className="text-gray-500 mt-2">
          Please provide your business address and ID proof to get approved as a vendor.
        </p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Category Selection */}
            <FormField
              control={form.control}
              name="vendorCategories"
              render={() => (
                <FormItem>
                  <FormLabel>Business Categories</FormLabel>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {form.watch("vendorCategories").map((cat) => (
                      <div
                        key={cat._id}
                        className="flex items-center gap-1 bg-gray-100 text-sm font-medium px-3 py-1 rounded-full border"
                      >
                        {cat.name}
                        <IoClose
                          size={16}
                          className="cursor-pointer text-gray-500 hover:text-red-500 ml-1"
                          onClick={() => handleRemoveCategorySelected(cat._id)}
                        />
                      </div>
                    ))}
                  </div>

                  <FormControl>
                    <Select
                      onValueChange={(value) => {
                        const categoryDetails = allCategory.find((cat) => cat._id === value);
                        if (!categoryDetails) return;

                        const current = form.getValues("vendorCategories");
                        if (current.some((c) => c._id === value)) return;

                        form.setValue("vendorCategories", [...current, categoryDetails]);
                      }}
                    >
                      <SelectTrigger className="w-full">
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

            {/* Address */}
            <FormField
              control={form.control}
              name="vendorAddress"
              rules={{ required: "Business address is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Address</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter your full business address"
                      rows={4}
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ID Proof */}
            <div className="space-y-2">
              <FormLabel>ID Proof (PAN/Aadhar/Voter ID)</FormLabel>
              {!previewUrl ? (
                <label
                  htmlFor="idProofImage"
                  className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  {imageLoading ? (
                    <ClipLoader size={30} color="#4f46e5" />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <FaCloudUploadAlt size={40} className="mb-2 text-indigo-400" />
                      <p className="font-medium text-sm">Drag & drop or click to upload</p>
                      <p className="text-xs mt-1">JPEG, PNG or HEIC (Max 10MB)</p>
                    </div>
                  )}
                  <input
                    type="file"
                    id="idProofImage"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={imageLoading}
                  />
                </label>
              ) : (
                <div className="relative w-48 h-32 border border-gray-200 rounded-lg shadow-sm overflow-hidden group">
                  <img
                    src={previewUrl}
                    alt="ID Proof Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full shadow-md opacity-90 hover:opacity-100 transition-opacity"
                    onClick={handleDeleteImage}
                  >
                    <MdDelete size={16} />
                  </button>
                </div>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading || imageLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-lg"
            >
              {loading ? "Submitting..." : "Submit Profile for Review"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
