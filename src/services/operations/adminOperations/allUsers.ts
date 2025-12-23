import { USERS } from "@/@types/user";
import { adminEndpoints, superAdminEndpoints } from "@/services/api_endpoints";
import { apiConnector } from "@/services/apiconnector";
const { ADMIN_ALLUSERS_GET_API, ADMIN_USER_PUT_API } = adminEndpoints;
const { SUPERADMIN_ALLADMIN_GET_API, SUPERADMIN_ADMIN_PUT_API } =
  superAdminEndpoints;

export const getAllUSERS_ADMIN = async (
  token: string,
  search: string = ""
): Promise<USERS[]> => {
  try {
    const url = `${ADMIN_ALLUSERS_GET_API}?search=${encodeURIComponent(
      search
    )}`;

    const response = await apiConnector("GET", url, null, {
      Authorization: `Bearer ${token}`,
    });

    if (response?.status !== 200) {
      throw new Error("Could Not Fetch All Users");
    }

    return response.data.data;
  } catch (error) {
    console.error("ADMIN_ALLUSERS_GET_API ERROR:", error);
    return [];
  } finally {
    console.log("Successfully Fetch All Users");
  }
};

export const updateUSER_ADMIN = async (
  id: string,
  token: string,
  formData: any
): Promise<USERS | null> => {
  try {
    const url = ADMIN_USER_PUT_API(id);

    const response = await apiConnector("PUT", url, formData, {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    });

    if (response?.status !== 200) {
      throw new Error("Could Not Update User");
    }

    return response.data;
  } catch (error) {
    console.error("ADMIN_USER_PUT_API ERROR:", error);
    return null;
  } finally {
    console.log("User Update Attempt Completed");
  }
};

export const getAll_ADMIN = async (
  token: string,
  search: string = ""
): Promise<USERS[]> => {
  try {
    const url = `${SUPERADMIN_ALLADMIN_GET_API}?search=${encodeURIComponent(
      search
    )}`;

    const response = await apiConnector("GET", url, null, {
      Authorization: `Bearer ${token}`,
    });

    if (response?.status !== 200) {
      throw new Error("Could Not Fetch All Admin");
    }

    return response.data.data;
  } catch (error) {
    console.error("SUPERADMIN_ALLADMIN_GET_API ERROR:", error);
    return [];
  } finally {
    console.log("Successfully Fetch All Admin");
  }
};

export const update_ADMIN = async (
  id: string,
  token: string,
  formData: any
): Promise<USERS | null> => {
  try {
    const url = SUPERADMIN_ADMIN_PUT_API(id);

    const response = await apiConnector("PUT", url, formData, {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    });

    if (response?.status !== 200) {
      throw new Error("Could Not Update Admin");
    }

    return response.data;
  } catch (error) {
    console.error("ADMIN_USER_PUT_API ERROR:", error);
    return null;
  } finally {
    console.log("Admin Update Attempt Completed");
  }
};
