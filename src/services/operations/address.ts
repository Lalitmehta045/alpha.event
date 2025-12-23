import toast from "react-hot-toast";
import { apiConnector } from "../apiconnector";
import { addressEndpoints } from "../api_endpoints";
import { AddressType } from "@/@types/address";
import {
  addAddressToState,
  deleteAddressFromState,
  setAddresses,
  setLoading,
  updateAddressInState,
} from "@/redux/slices/addressSlice";

const {
  GETALLADDRESS_API,
  POSTADDRESS_API,
  PUTADDRESS_API,
  DELETEADDRESS_API,
} = addressEndpoints;

// GET ALL Address By User
export const getAllAddress = async (dispatch: any): Promise<AddressType[]> => {
  try {
    const response = await apiConnector("GET", GETALLADDRESS_API);

    if (response?.status !== 200) {
      throw new Error("Could Not Fetch All Address");
    }

    const result = response.data.data;

    // 🔥 UPDATE REDUX STORE HERE
    dispatch(setAddresses(result));

    return result;
  } catch (error: any) {
    console.error("GETALLADDRESS_API ERROR:", error);
    return [];
  } finally {
    console.log("Successfully Fetch All Address");
  }
};

// POST ADD Address By User
export const addAddress = async (
  data: any,
  token: string,
  dispatch: any
): Promise<AddressType[]> => {
  dispatch(setLoading(true));

  try {
    const response = await apiConnector("POST", POSTADDRESS_API, data, {
      Authorization: `Bearer ${token}`,
    });

    if (!response?.data?.success) {
      throw new Error("Could Not Add Address");
    }

    const result = response.data.data;
    dispatch(addAddressToState(result));

    return result;
  } catch (error: any) {
    console.error("ADD ADDRESS_API API ERROR:", error);
    toast.error(error.message || "Something went wrong");
    return [];
  } finally {
    dispatch(setLoading(false));
  }
};

// ✅ Edit Address (PUT) By USER
export const editAddress = async (
  id: string,
  data: AddressType,
  token: string,
  dispatch: any
): Promise<AddressType[]> => {
  dispatch(setLoading(true));

  try {
    const response = await apiConnector("PUT", PUTADDRESS_API(id), data, {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    });

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Could not update Address");
    }

    const result = response.data.data;
    dispatch(updateAddressInState(result));

    return result;
  } catch (error: any) {
    console.error("EDIT PUT ADDRESS_API ERROR:", error);
    toast.error(error.message || "Something went wrong");
    return [];
  } finally {
    dispatch(setLoading(false));
  }
};

// DELETE Address By USER
export const deleteAddress = async (
  id: string,
  token: string,
  dispatch: any
): Promise<AddressType[]> => {
  dispatch(setLoading(true));
  try {
    const response = await apiConnector(
      "DELETE",
      DELETEADDRESS_API(id), // ✅ Just call function
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    );
    if (!response?.data?.success) {
      throw new Error("Could Not Delete Address");
    }

    const result = response.data.data;
    dispatch(deleteAddressFromState(result));

    return result;
  } catch (error) {
    console.log("DELETE ADDRESS_API ERROR............", error);
    toast.error("Delete Address error");
    return [];
  } finally {
    dispatch(setLoading(false));
  }
};
