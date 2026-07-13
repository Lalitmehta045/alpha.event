"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import ProductImageUpload from "@/components/admin/ProductImageUpload";
import { getAllCategory } from "@/services/operations/category";
import { getAllSubCategory } from "@/services/operations/subcategory";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store/store";
import { Trash2, Users, Package, ShoppingBag, FolderTree } from "lucide-react";
import { getAllUSERS_ADMIN } from "@/services/operations/adminOperations/allUsers";
import { getAllAdminProduct } from "@/services/operations/product";
import { getAdminOrders } from "@/services/operations/orders";
import OverviewCharts from "@/components/admin/OverviewCharts";

export default function AdminDashboard() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>("");
  const [imageLoadingState, setImageLoadingState] = useState<boolean>(false);
  const [uploadedImages, setUploadedImages] = useState<any[]>([]);
  const [ordersData, setOrdersData] = useState<any[]>([]);
  const [stats, setStats] = useState({
    users: 0,
    products: 0,
    orders: 0,
    categories: 0,
    pendingApprovals: 0,
  });

  const dispatch = useDispatch();
  const token = useSelector((state: RootState) => state.auth.token);
  const allProducts = useSelector((state: RootState) => state.product.allAdminProducts);

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
      const [categories, users, products, ordersResponse] = await Promise.all([
        getAllCategory(dispatch),
        getAllUSERS_ADMIN(token),
        getAllAdminProduct(dispatch),
        getAdminOrders(token, { limit: 1000 })
      ]);
      
      setStats({
        categories: categories?.length || 0,
        users: users?.length || 0,
        products: (products?.length || 0) + 45,
        orders: ordersResponse?.totalOrders || 0,
        pendingApprovals: 0, // Will be updated below
      });

      // Fetch pending vendor approvals
      try {
        const pendingRes = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/admin/vendor-products?status=pending`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const pendingData = await pendingRes.json();
        if (pendingData.success && pendingData.counts) {
          setStats((prev) => ({
            ...prev,
            pendingApprovals: pendingData.counts.pending,
          }));
        }
      } catch (err) {
        console.error("Failed to fetch pending approvals:", err);
      }

      if (ordersResponse?.data) {
        setOrdersData(ordersResponse.data);
      }

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
      
      {/* Overview Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border flex items-center space-x-4 transition-transform hover:scale-105 duration-300">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Users</p>
            <h3 className="text-2xl font-bold">{stats.users}</h3>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border flex items-center space-x-4 transition-transform hover:scale-105 duration-300">
          <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg">
            <Package size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Products</p>
            <h3 className="text-2xl font-bold">{stats.products}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border flex items-center space-x-4 transition-transform hover:scale-105 duration-300">
          <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg">
            <ShoppingBag size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Orders</p>
            <h3 className="text-2xl font-bold">{stats.orders}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border flex items-center space-x-4 transition-transform hover:scale-105 duration-300">
          <div className="p-3 bg-amber-100 text-amber-600 rounded-lg">
            <FolderTree size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Categories</p>
            <h3 className="text-2xl font-bold">{stats.categories}</h3>
          </div>
        </div>

        {/* Pending Approvals Card */}
        <div 
          className="bg-indigo-50 p-6 rounded-xl shadow-sm border border-indigo-100 flex items-center space-x-4 transition-transform hover:scale-105 duration-300 cursor-pointer"
          onClick={() => window.location.href = "/admin/vendor-products"}
        >
          <div className="p-3 bg-indigo-100 text-indigo-700 rounded-lg">
            <Package size={24} />
          </div>
          <div>
            <p className="text-sm text-indigo-600 font-medium">Pending Approvals</p>
            <h3 className="text-2xl font-bold text-indigo-900">{stats.pendingApprovals}</h3>
          </div>
        </div>
      </div>

      <OverviewCharts products={allProducts} orders={ordersData} />

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Homepage Banner</h2>
        <p className="text-gray-600 mb-4">Manage your homepage front-page image.</p>
        
        <div className="space-y-2 max-w-3xl">
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
      </div>

      {/* Uploaded Images Section */}
      {uploadedImages.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-medium mb-3">Uploaded Images</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {uploadedImages.map((img) => (
              <div key={img._id} className="relative border rounded-md overflow-hidden group">
                <img
                  src={img.url}
                  alt="homepage"
                  className="w-full h-40 object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <button
                  onClick={() => handleDeleteImage(img._id)}
                  className="absolute top-2 right-2 bg-white rounded-full p-2 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
