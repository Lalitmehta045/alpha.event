import { toast } from "react-toastify";
import { apiConnector } from "../apiconnector";
import { vendorEndpoints } from "../api_endpoints";
import { NewProduct } from "@/@types/product";

const { VENDOR_PRODUCT_POST_API } = vendorEndpoints;

// POST — Submit product for vendor approval
export const addVendorProduct = async (
  data: NewProduct,
  token: string
): Promise<NewProduct | null> => {
  const toastId = toast.loading("Submitting product for approval...");
  let result: NewProduct | null = null;

  try {
    const response = await apiConnector("POST", VENDOR_PRODUCT_POST_API, data, {
      Authorization: `Bearer ${token}`,
    });

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Could not submit product");
    }

    result = response.data.data;
    toast.success("Product submitted! Waiting for admin approval.");
  } catch (error: any) {
    console.log("ADD VENDOR PRODUCT ERROR:", {
      message: error.message,
      stack: error.stack,
      responseData: error.response?.data,
      error
    });
    toast.error(
      error.response?.data?.message || error.message || "Failed to submit product"
    );
  } finally {
    toast.dismiss(toastId);
  }
  return result;
};
