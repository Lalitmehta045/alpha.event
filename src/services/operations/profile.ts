import { userEndpoints } from "../api_endpoints";
import { apiConnector } from "../apiconnector";
import toast from "react-hot-toast";
import { IUserProfile, setProfile } from "@/redux/slices/profile";

const { GETPROFILE_API, PUTPROFILE_API, DELETEPROFILE_API } = userEndpoints;

export const getProfileDetail = async (
  id: string,
  token: string,
  dispatch?: any
): Promise<IUserProfile | null> => {
  try {
    const response = await apiConnector("GET", GETPROFILE_API(id), null, {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    });

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Could not fetch profile");
    }

    const result = response.data.data;

    // 🔥 UPDATE REDUX STORE HERE
    dispatch(setProfile(result));

    return result; // <-- returns single user object
  } catch (error: any) {
    console.error("GET PROFILE ERROR:", error);
    toast.error(error.message || "Failed to fetch profile");
    return null;
  }
};

// ✅ Edit Address (PUT) By USER
export const updateProfile = async (
  id: string,
  data: any,
  token: string,
  dispatch?: any
): Promise<IUserProfile | null> => {
  try {
    const response = await apiConnector("PUT", PUTPROFILE_API(id), data, {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    });

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Could not update profile");
    }

    return response.data.data;
  } catch (error: any) {
    console.error("UPDATE PROFILE ERROR:", error);
    toast.error(error.message || "Failed to update profile");
    return null;
  }
};

// DELETE Address By USER
export const deleteProfile = async (
  id: string,
  token: string,
  dispatch?: any
): Promise<boolean> => {
  try {
    const response = await apiConnector("DELETE", DELETEPROFILE_API(id), null, {
      Authorization: `Bearer ${token}`,
    });

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Could not delete profile");
    }

    return true;
  } catch (error) {
    console.error("DELETE PROFILE ERROR:", error);
    toast.error("Failed to delete profile");
    return false;
  }
};
