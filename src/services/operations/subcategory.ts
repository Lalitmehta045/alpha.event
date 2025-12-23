import toast from "react-hot-toast";
import { apiConnector } from "../apiconnector";
import { adminEndpoints, subCategoryEndpoints } from "../api_endpoints";
import { SubCategory } from "@/@types/catregory";
import { setAllSubCategory } from "@/redux/slices/product";
const {
  SUBCATEGORIES_GET_API,
  SUBCATEGORIES_POST_API,
  SUBCATEGORIES_PUT_API,
  SUBCATEGORIES_DELETE_API,
} = adminEndpoints;

const { ALLSUBCATEGORIES_GET_API } = subCategoryEndpoints;

// ✅ GET ALL SubCategories
export const getAllSubCategory = async (
  dispatch: any
): Promise<SubCategory[]> => {
  let result: SubCategory[] = [];

  try {
    const response = await apiConnector("GET", ALLSUBCATEGORIES_GET_API, null);

    if (response?.status !== 200) {
      throw new Error(
        response?.data?.message || "Could not fetch subcategories"
      );
    }

    result = response?.data?.data;
    dispatch(setAllSubCategory(result));
  } catch (error: any) {
    console.error("ALLSUBCATEGORIES_GET_API ERROR:", error);
  }
  return result;
};

// POST ADD SubCategory By ADMIN
export const addSubCategory = async (
  data: any,
  token: string
): Promise<SubCategory | null> => {
  let result: SubCategory | null = null;

  try {
    const response = await apiConnector("POST", SUBCATEGORIES_POST_API, data, {
      Authorization: `Bearer ${token}`,
    });

    if (!response?.data?.success) {
      throw new Error("Could Not Add SubCategory");
    }

    result = response.data.data;
  } catch (error: any) {
    console.error("ADD SubCategory API ERROR:", error);
    toast.error(error.message || "Something went wrong");
  }

  return result;
};

// GET Single SubCategory
export const getSubCategory = async (
  id: string
): Promise<SubCategory | null> => {
  let result: SubCategory | null = null;

  try {
    const response = await apiConnector("GET", SUBCATEGORIES_GET_API(id));

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Could not fetch SubCategory");
    }

    result = response.data.data;
  } catch (error: any) {
    console.error("SubCategory_GET_API ERROR:", error);
    toast.error(error.message || "Something went wrong");
  }

  return result;
};

// ✅ Edit SubCategory (PUT) By ADMIN
export const editSubCategory = async (
  id: string,
  data: any,
  token: string
): Promise<SubCategory | null> => {
  let result: SubCategory | null = null;

  try {
    const response = await apiConnector(
      "PUT",
      SUBCATEGORIES_PUT_API(id),
      data,
      {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      }
    );

    if (!response?.data?.success) {
      throw new Error(
        response?.data?.message || "Could Not Update SubCategories"
      );
    }

    result = response.data.data;
  } catch (error: any) {
    console.error("EDIT CATEGORY_PUT_API ERROR:", error);
    toast.error(error.message || "Something went wrong");
  }

  return result;
};

// DELETE Category By ADMIN
export const deleteSubCategory = async (
  id: string,
  token: string
): Promise<SubCategory | null> => {
  let result = null;
  try {
    const response = await apiConnector(
      "DELETE",
      SUBCATEGORIES_DELETE_API(id),
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    );
    console.log("SUBCATEGORIES_DELETE_API RESPONSE............", response);
    if (!response?.data?.success) {
      throw new Error("Could Not Delete SubCategories");
    }
    return (result = response?.data?.data);
  } catch (error) {
    console.log("DELETE SECTION API ERROR............", error);
    toast.error("Delete SubCategories error");
  }
  return result;
};
