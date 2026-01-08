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

    if (dispatch) {
      dispatch(setProfile(result));
    }

    return result;
  } catch (error: any) {
    console.error("GET PROFILE ERROR:", error);
    
    if (error.response?.status === 401) {
      toast.error("Session expired. Please login again.");
    } else if (error.response?.status === 403) {
      toast.error("Access denied. You can only view your own profile.");
    } else {
      toast.error(error.response?.data?.message || "Failed to load profile data");
    }
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
  const toastId = toast.loading("🔄 Updating profile...");

  try {
    const response = await apiConnector("PUT", PUTPROFILE_API(id), data, {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    });

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Could not update profile");
    }

    toast.dismiss(toastId);
    toast.success("✅ Profile updated successfully!");

    return response.data.data;
  } catch (error: any) {
    console.error("UPDATE PROFILE ERROR:", error);
    toast.dismiss(toastId);
    
    if (error.response?.status === 401) {
      toast.error("Session expired. Please login again.");
    } else {
      toast.error(error.response?.data?.message || "Failed to update profile");
    }
    return null;
  }
};

// DELETE Address By USER
export const deleteProfile = async (
  id: string,
  token: string,
  dispatch?: any
): Promise<boolean> => {
  const toastId = toast.loading("🗑️ Deleting profile...");

  try {
    const response = await apiConnector("DELETE", DELETEPROFILE_API(id), null, {
      Authorization: `Bearer ${token}`,
    });

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Could not delete profile");
    }

    toast.dismiss(toastId);
    toast.success("✅ Profile deleted successfully");

    return true;
  } catch (error: any) {
    console.error("DELETE PROFILE ERROR:", error);
    toast.dismiss(toastId);
    
    toast.error(error.response?.data?.message || "Failed to delete profile");
    return false;
  }
};
