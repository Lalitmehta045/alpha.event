import toast from "react-hot-toast";
import { apiConnector } from "../apiconnector";
import { adminEndpoints, productEndpoints } from "../api_endpoints";
import {
  NewProduct,
  Product,
  ProductAPIPayload,
  ProductFormValues,
} from "@/@types/product";
import {
  setAllAdminProducts,
  setAllProducts,
  setProduct,
  setSubCatProduct,
} from "@/redux/slices/product";
import { AppDispatch } from "@/redux/store/store";

const {
  PRODUCT_POST_API,
  ALLADMINPRODUCT_GET_API,
  PRODUCT_PUT_API,
  PRODUCT_DELETE_API,
} = adminEndpoints;

const {
  ALLPRODUCT_GET_API,
  PRODUCT_GET_API,
  GET_PRODUCT_SUBCATEGORY_API,
  GET_MOST_POPULAR_PRODUCT_API,
} = productEndpoints;

// GET ALL Product
export const getAllProduct = async (
  dispatch: any,
  searchQuery: string = "" // optional search query
): Promise<Product[]> => {
  let result: Product[] = [];

  try {
    // Append search query if provided
    const url = searchQuery
      ? `${ALLPRODUCT_GET_API}?query=${encodeURIComponent(searchQuery)}`
      : ALLPRODUCT_GET_API;

    const response = await apiConnector("GET", url, null);

    if (response?.status !== 200) {
      throw new Error("Could Not Fetch Products");
    }

    result = response?.data?.data;
    if (result) console.log("Successfully Fetch Products");

    dispatch(setAllProducts(result));

    return result;
  } catch (error: any) {
    console.error("ALLPRODUCT_GET_API ERROR:", error);
  }

  return result;
};

export const getAllAdminProduct = async (
  dispatch: any // ✅ pass dispatch here
): Promise<Product[]> => {
  let result: Product[] = [];

  try {
    const response = await apiConnector(
      "GET",
      ALLADMINPRODUCT_GET_API,
      null // no body data for GET
    );

    if (response?.status !== 200) {
      throw new Error("Could Not Fetch All Products");
    }
    result = response?.data?.data;
    // console.log("result: ", result);

    dispatch(setAllAdminProducts(result));
    return result;
  } catch (error: any) {
    console.error("ALLPRODUCT_GET_API ERROR:", error);
    // toast.error(error.message || "Something went wrong");
  } finally {
    console.log("Successfully Fetch All Products");
  }

  return result;
};

// POST ADD Category By ADMIN
export const addProduct = async (
  data: NewProduct,
  token: string
): Promise<NewProduct | null> => {
  const toastId = toast.loading("Adding product...");
  let result: NewProduct | null = null;

  try {
    const response = await apiConnector("POST", PRODUCT_POST_API, data, {
      Authorization: `Bearer ${token}`,
    });

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Could not add product");
    }

    result = response.data.data;
  } catch (error: any) {
    console.error("ADD PRODUCT_POST_API ERROR:", error);
    toast.error(error.message || "Something went wrong");
  } finally {
    toast.dismiss(toastId);
  }
  return result;
};

export const editProduct = async (
  id: string,
  data: ProductAPIPayload,
  token: string
): Promise<Product | null> => {
  const toastId = toast.loading("Uploading product...");
  let result: Product | null = null;

  try {
    const response = await apiConnector("PUT", PRODUCT_PUT_API(id), data, {
      Authorization: `Bearer ${token}`,
    });

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Could not upload product");
    }

    result = response.data.data;
  } catch (error: any) {
    console.error("Upload PRODUCT_PUT_API ERROR:", error);
    toast.error(error.message || "Something went wrong");
  } finally {
    toast.dismiss(toastId);
  }

  return result;
};

// GET Product Detail
export const getProductDetail = async (
  id: string,
  dispatch: AppDispatch
): Promise<Product | null> => {
  try {
    const response = await apiConnector("GET", PRODUCT_GET_API(id));

    const product: Product = response.data.data;

    // Save in Redux
    dispatch(setProduct(product));

    return product;
  } catch (error: any) {
    console.error("PRODUCT_GET_API ERROR:", error);
    return null;
  }
};

// DELETE Category By ADMIN
export const deleteProduct = async (
  id: string,
  token: string
): Promise<Product | null> => {
  let result = null;
  try {
    const response = await apiConnector(
      "DELETE",
      PRODUCT_DELETE_API(id), // ✅ Just call function
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    );
    console.log("PRODUCT_DELETE_API RESPONSE............", response);
    if (!response?.data?.success) {
      throw new Error("Could Not Delete Product");
    }
    return (result = response?.data?.data);
  } catch (error) {
    console.log("DELETE SECTION API ERROR............", error);
    toast.error("Delete Product error");
  }
  return result;
};

export const getProductSubCategory = async (
  productId: string,
  dispatch: AppDispatch
): Promise<Product | null> => {
  try {
    const response = await apiConnector(
      "GET",
      GET_PRODUCT_SUBCATEGORY_API(productId)
    );

    const product: Product = response.data.data;

    // Save in Redux
    dispatch(setSubCatProduct(product));

    return product;
  } catch (error: any) {
    console.error("GET_PRODUCT_SUBCATEGORY_API ERROR:", error);
    return null;
  }
};

export const getMostPopularProduct = async (
  dispatch?: any // ✅ pass dispatch here
): Promise<Product[]> => {
  let result: Product[] = [];

  try {
    const response = await apiConnector(
      "GET",
      GET_MOST_POPULAR_PRODUCT_API,
      null // no body data for GET
    );

    if (response?.status !== 200) {
      throw new Error("Could Not Fetch All Products");
    }
    result = response?.data?.data;
    // console.log("result: ", result);

    // dispatch(setAllProducts(result));
    return result;
  } catch (error: any) {
    console.error("ALLPRODUCT_GET_API ERROR:", error);
    // toast.error(error.message || "Something went wrong");
  } finally {
    console.log("Successfully Fetch All Products");
  }

  return result;
};
