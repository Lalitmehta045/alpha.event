"use client";

import { Category, SubCategory } from "@/@types/catregory";
import ConfirmDeleteDialog from "@/components/admin/ConfirmDialog";
import AdminProductCard from "@/components/admin/products/AdminProductCard";
import EditProductDialog from "@/components/admin/products/EditProductDialog";
import { RootState } from "@/redux/store/store";
import { deleteProduct, getAllAdminProduct } from "@/services/operations/product";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Input } from "@/components/ui/input";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import ProductsLoading from "./loading";

interface Product {
  _id: string;
  name: string;
  image: string[];
  category: Category[]; // full objects in form
  subCategory: SubCategory[];
  unit: string;
  stock: number;
  price: number;
  discount?: number;
  description: string;
  more_details?: Record<string, string>;
}

export default function ProductsPage() {
  const token = useSelector((state: RootState) => state.auth.token);
  const dispatch = useDispatch();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [deleteData, setDeleteData] = useState<Product | null>(null);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const allAdminProducts = useSelector(
    (state: RootState) => state.product.allAdminProducts
  );

  const handleDelete = async () => {
    if (!token) {
      toast.error("Unauthorized");
      return;
    }
    if (!deleteData) return; // prevent errors if null
    try {
      setLoading(true);
      await deleteProduct(deleteData._id, token);
      const res = await getAllAdminProduct(dispatch);
      if (res) setProducts(res);
      toast.success(`Product deleted successfully`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete category");
    } finally {
      setOpenDeleteConfirm(false);
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await getAllAdminProduct(dispatch);
      setProducts(res);
    } catch {
      toast.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [products.length, allAdminProducts.length]);

  return (
    <div className="space-y-4 p-0 sm:p-2">
      <div className="flex justify-between items-center">
        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-gray-800">Products</h1>

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
                  href="/admin/products"
                  className="text-gray-700 font-medium"
                >
                  Products
                </BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <Link
          href="/admin/upload-product"
          className="bg-indigo-600 hover:bg-indigo-700 cursor-pointer text-white px-4 py-2 rounded-lg"
        >
          New Products
        </Link>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 max-w-sm"
        />
      </div>

      {loading ? (
        <ProductsLoading />
      ) : !products || products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 place-content-center gap-2 md:gap-4 scroll-smooth">
            {(() => {
              const filteredProducts = allAdminProducts.filter((p: Product) =>
                p.name.toLowerCase().includes(searchQuery.toLowerCase())
              );
              const paginatedProducts = filteredProducts.slice(
                (currentPage - 1) * itemsPerPage,
                currentPage * itemsPerPage
              );
              return paginatedProducts.map((p: any) => (
                <AdminProductCard
                  key={p._id}
                  item={p}
                  setDeleteData={setDeleteData}
                  setSelectedProduct={() => setSelectedProduct(p._id!)}
                  setOpenDeleteConfirm={setOpenDeleteConfirm}
                />
              ));
            })()}
          </div>
          {(() => {
            const filteredProducts = allAdminProducts.filter((p: Product) =>
              p.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
            const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
            
            if (totalPages <= 1) return null;

            return (
              <div className="flex justify-center items-center mt-8 space-x-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                <span className="text-sm font-medium text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            );
          })()}
        </>
      )}

      {selectedProduct && (
        <EditProductDialog
          open={!!selectedProduct}
          productId={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}

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
    </div>
  );
}
