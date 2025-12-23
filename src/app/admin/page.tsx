"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import ProductImageUpload from "@/components/admin/ProductImageUpload";
import { getAllCategory } from "@/services/operations/category";
import { getAllSubCategory } from "@/services/operations/subcategory";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store/store";
import { Trash2 } from "lucide-react";

export default function AdminDashboard() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>("");
  const [imageLoadingState, setImageLoadingState] = useState<boolean>(false);
  const [uploadedImages, setUploadedImages] = useState<any[]>([]);

  const dispatch = useDispatch();
  const token = useSelector((state: RootState) => state.auth.token);

  async function handleUploadFeatureImage() {
    if (!uploadedImageUrl) {
      toast.error("No image uploaded yet!");
      return;
    }

    try {
      // const res = await uploadHomepageImage(uploadedImageUrl, token);
      // if (res.success) {
      //   toast.success("Homepage image uploaded successfully!");
      //   setUploadedImages((prev) => [...prev, res.data]);
      //   setUploadedImageUrl("");
      //   setImageFile(null);
      // } else {
      //   toast.error(res.message);
      // }
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    }
  }

  async function handleDeleteImage(id: string) {
    try {
      // const res = await deleteHomepageImage(id, token);
      // if (res.success) {
      //   setUploadedImages((prev) => prev.filter((img) => img._id !== id));
      //   toast.success("Image deleted successfully!");
      // } else {
      //   toast.error(res.message);
      // }
    } catch (error: any) {
      toast.error(error.message || "Failed to delete image");
    }
  }

  const fetchData = async () => {
    if (!token) return toast.error("Unauthorized");
    try {
      await getAllCategory(dispatch);
      await getAllSubCategory(dispatch);
    } catch (error) {
      console.error(error);
    }
  };

  // const loadHomepageImages = async () => {
  //   if (!token) return;
  //   const res = await fetchHomepageImages(token);
  //   if (res.success) setUploadedImages(res.data);
  // };

  useEffect(() => {
    fetchData();
    // loadHomepageImages();
  }, [token]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Dashboard</h1>
      <p className="text-gray-600">Manage your homepage front-page image.</p>

      <div className="space-y-2">
        <ProductImageUpload
          imageFile={imageFile}
          setImageFile={setImageFile}
          uploadedImageUrl={uploadedImageUrl}
          setUploadedImageUrl={setUploadedImageUrl}
          setImageLoadingState={setImageLoadingState}
          imageLoadingState={imageLoadingState}
          isCustomStyling={true}
        />
        <Button
          onClick={handleUploadFeatureImage}
          className="mt-5 w-full bg-indigo-600 hover:bg-indigo-700 cursor-pointer text-white px-4 py-2 rounded-lg"
        >
          Upload
        </Button>
      </div>

      {/* Uploaded Images Section */}
      {uploadedImages.length > 0 && (
        <div>
          <h2 className="text-lg font-medium mb-3">Uploaded Images</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {uploadedImages.map((img) => (
              <div key={img._id} className="relative border rounded-md ">
                <img
                  src={img.url}
                  alt="homepage"
                  className="w-full h-40 object-cover"
                />
                <button
                  onClick={() => handleDeleteImage(img._id)}
                  className="absolute top-2 right-2 bg-white rounded-full p-1 text-red-500 hover:bg-red-100"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
