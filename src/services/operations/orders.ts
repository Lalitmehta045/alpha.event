import toast from "react-hot-toast";
import { apiConnector } from "../apiconnector";
import {
  OrderType,
  setAllOrders,
  setCOD,
  setLoading,
} from "@/redux/slices/orderSlice";
import { adminEndpoints, ordersEndpoints } from "../api_endpoints";
import {
  AdminOrderQueryParams,
  AdminOrderResponse,
  DetailedOrderData,
} from "@/@types/order";
const { CASH_ON_DELIVERY, GETORDER_API } = ordersEndpoints;

const {
  ADMIN_GET_ALL_ORDERS_API,
  ADMIN_ORDER_GET_API,
  ADMIN_ORDER_PUT_API,
  ADMIN_ORDER_DELETE_API,
} = adminEndpoints;

export const getAllOrders = async (token: string, dispatch: any) => {
  try {
    const response = await apiConnector("GET", GETORDER_API, null, {
      Authorization: `Bearer ${token}`,
    });

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Could not fetch orders");
    }

    const result: OrderType[] = response.data.data;

    // ⭐ Use the new action to store the array of orders
    dispatch(setAllOrders(result));

    // ⭐ Return the result array
    return result;
  } catch (error: any) {
    console.error("GET ORDERS ERROR", error);
    return [];
  } finally {
    console.log("Successfully Fetch All Orders");
  }
};

export const placeCODOrder = async (
  data: {
    list_items: any[];
    addressId: string | undefined;
    subTotalAmt: number;
    totalAmt: number;
  },
  token: string,
  dispatch: any
) => {
  try {
    dispatch(setLoading(true));

    const response = await apiConnector("POST", CASH_ON_DELIVERY, data, {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    });

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Order creation failed");
    }

    const result = response.data.data;
    // ⭐ Format COD result into your desired object
    const formattedOrder = {
      _id: result._id,
      orderId: result.orderId,
      products: result.products.map((item: any) => ({
        name: item.product_details?.name || "",
        qty: item.quantity,
        price: item.product_details?.price || 0,
      })),
      totalAmt: result.totalAmt,
      order_status: result.order_status,
      payment_status: result.payment_status,
    };

    // ⭐ Save this in Redux
    dispatch(setCOD(formattedOrder));

    await getAllOrders(token, dispatch);

    return result;
    // created order
  } catch (error: any) {
    console.log("COD ORDER ERROR: ", error);
    toast.error(error.message || "Something went wrong");
    return null;
  } finally {
    dispatch(setLoading(false));
  }
};

export const getAdminOrders = async (
  token: string,
  params: AdminOrderQueryParams
): Promise<AdminOrderResponse | null> => {
  let result: AdminOrderResponse | null = null;

  // 1. Construct the Query String
  // This converts { page: 2, status: 'Processing' } to ?page=2&status=Processing
  const queryString = new URLSearchParams(
    params as Record<string, string>
  ).toString();

  const url = `${ADMIN_GET_ALL_ORDERS_API}?${queryString}`;

  try {
    const response = await apiConnector("GET", url, null, {
      Authorization: `Bearer ${token}`,
    });

    if (!response?.data?.success) {
      // Throw an error if the API reports failure
      throw new Error(
        response?.data?.message || "Failed to fetch admin orders"
      );
    }

    result = response.data;
    // console.log("ADMIN ORDERS FETCH SUCCESS:", result);
  } catch (error: any) {
    console.error("ADMIN GET ORDERS OPERATION ERROR:", error);

    // Display the error message to the admin user
    toast.error(error.message || "Could not fetch order data.");

    return null;
  }

  return result;
};

// Define the complete response structure
interface AdminOrderDetailResponse {
  success: boolean;
  message: string;
  data: DetailedOrderData;
}

export const getAdminOrderDetail = async (
  id: string,
  token: string
): Promise<DetailedOrderData | null> => {
  // 1. Construct the specific URL using the orderId
  const url = ADMIN_ORDER_GET_API(id);

  try {
    const response = await apiConnector("GET", url, null, {
      Authorization: `Bearer ${token}`,
    });

    if (!response?.data?.success) {
      // Throw an error if the API reports failure (e.g., 404, 403)
      const message =
        response?.data?.error ||
        response?.data?.message ||
        "Failed to fetch order details.";
      throw new Error(message);
    }

    const result: AdminOrderDetailResponse = response.data;
    // console.log("ADMIN ORDER DETAIL FETCH SUCCESS:", result);

    // Return only the detailed order data object
    return result.data;
  } catch (error: any) {
    console.error("ADMIN GET ORDER DETAIL OPERATION ERROR:", error);

    // Display the error message to the admin user
    const userMessage = error.message.includes("403")
      ? "Access Denied. You are not authorized."
      : error.message;
    toast.error(userMessage);

    // Return null on failure
    return null;
  }
};

export const updateAdminOrderStatus = async (
  orderId: string,
  newStatus: string,
  token: string
) => {
  try {
    const response = await apiConnector(
      "PUT",
      ADMIN_ORDER_PUT_API(orderId),
      // The body must contain the field expected by the backend PUT handler
      { order_status: newStatus },
      {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      }
    );

    // console.log("response order update : ", response);

    // Check for success based on the backend response structure
    // if (response.status !== 200 || !response.success) {
    //   throw new Error(response.message || "Failed to update order status.");
    // }

    // Return the required success status
    return { success: true, updatedOrder: response.data };
  } catch (error) {
    console.error("UPDATE_ORDER_STATUS_API ERROR:", error);
    // Throw an error or return a failure object for the component to handle
    return { success: false, error: (error as Error).message };
  }
};
