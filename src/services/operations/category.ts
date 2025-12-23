import toast from "react-hot-toast";
import { apiConnector } from "../apiconnector";
import { adminEndpoints, categoryEndpoints } from "../api_endpoints";
import { Category } from "@/@types/catregory";
import { setAllCategory } from "@/redux/slices/product";
const {
  CATEGORY_POST_API,
  CATEGORY_GET_API,
  CATEGORY_PUT_API,
  CATEGORY_DELETE_API,
} = adminEndpoints;

const { ALLCATEGORY_GET_API } = categoryEndpoints;

// GET ALL Category
export const getAllCategory = async (dispatch: any): Promise<Category[]> => {
  let result: Category[] = [];

  try {
    const response = await apiConnector("GET", ALLCATEGORY_GET_API, null);

    if (response?.status !== 200) {
      throw new Error("Could Not Fetch All Categories");
    }
    result = response?.data?.data;

    dispatch(setAllCategory(result));
    return result;
  } catch (error: any) {
    console.error("ALLCATEGORY_GET_API ERROR:", error);
  }
  return result;
};

// POST ADD Category By ADMIN
export const addCategory = async (
  data: any,
  token: string
): Promise<Category | null> => {
  let result: Category | null = null;

  try {
    const response = await apiConnector("POST", CATEGORY_POST_API, data, {
      Authorization: `Bearer ${token}`,
    });

    if (!response?.data?.success) {
      throw new Error("Could Not Add Category");
    }

    result = response.data.data;
  } catch (error: any) {
    console.error("ADD CATEGORY API ERROR:", error);
    toast.error(error.message || "Something went wrong");
  }

  return result;
};

// GET Single Category
export const getCategory = async (id: string): Promise<Category | null> => {
  let result: Category | null = null;

  try {
    const response = await apiConnector("GET", CATEGORY_GET_API(id));

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Could not fetch category");
    }

    result = response.data.data;
  } catch (error: any) {
    console.error("CATEGORY_GET_API ERROR:", error);
    toast.error(error.message || "Something went wrong");
  }
  return result;
};

// ✅ Edit Category (PUT) By ADMIN
export const editCategory = async (
  id: string,
  data: Category,
  token: string
): Promise<Category | null> => {
  let result: Category | null = null;

  try {
    const response = await apiConnector("PUT", CATEGORY_PUT_API(id), data, {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    });

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Could not update category");
    }

    result = response.data.data;
  } catch (error: any) {
    console.error("EDIT CATEGORY_PUT_API ERROR:", error);
    toast.error(error.message || "Something went wrong");
  }

  return result;
};

// DELETE Category By ADMIN
export const deleteCategory = async (
  id: string,
  token: string
): Promise<Category | null> => {
  let result = null;
  try {
    const response = await apiConnector(
      "DELETE",
      CATEGORY_DELETE_API(id), // ✅ Just call function
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    );
    if (!response?.data?.success) {
      throw new Error("Could Not Delete Category");
    }
    return (result = response?.data?.data);
  } catch (error) {
    console.log("DELETE SECTION API ERROR............", error);
    toast.error("Delete Category error");
  }
  return result;
};
