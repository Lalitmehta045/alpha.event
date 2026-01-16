import toast from "react-hot-toast";
import { apiConnector } from "../apiconnector";
import { cartEndpoints } from "../api_endpoints";
import { CartItem } from "@/redux/slices/cartSlice";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

const {
  SYNCCART_ITEM_API,
  GETALLCART_ITEM_API,
  GETCART_ITEM_API,
  POSTCART_ITEM_API,
  PUTCART_ITEM_API,
  DELETECART_ITEM_API,
} = cartEndpoints;

export const getAllCartItems = async (token?: string) => {
  // If no token provided, return empty array without making API call
  // This prevents Unauthorized errors in console for unauthenticated users
  if (!token) {
    return [];
  }

  try {
    const headers = { Authorization: `Bearer ${token}` };
    const res = await apiConnector("GET", GETALLCART_ITEM_API, null, headers);

    if (!res?.data?.success) {
      throw new Error(res?.data?.message || "Failed to fetch cart");
    }

    const rawCartItems = res.data.data;

    const mappedCartItems = rawCartItems.map((item: any) => ({
      _id: item._id,
      quantity: item.quantity,
      product: {
        _id: item.productId._id,
        name: item.productId.name,
        image: item.productId.image,
        category: item.productId.category,
        subCategory: item.productId.subCategory,
        unit: item.productId.unit,
        stock: item.productId.stock,
        price: item.productId.price,
        discount: item.productId.discount,
        description: item.productId.description,
        more_details: item.productId.more_details,
        quantity: item.productId.quantity,
      },
    }));

    return mappedCartItems;
  } catch (error: any) {
    // Only log error if it's not an authentication error (401)
    // For 401 errors, silently return empty array as user is not authenticated
    if (error?.response?.status !== 401) {
      console.log("GET CART ERROR:", error);
    }
    return [];
  }
};

export const addCartItem = async (
  productId: string,
  router: AppRouterInstance,
  token: string
) => {
  try {
    const res = await apiConnector(
      "POST",
      POSTCART_ITEM_API,
      { productId, quantity: 1 },
      { Authorization: `Bearer ${token}` }
    );

    // If API returns success = false → token invalid or session expired
    if (!res?.data?.success) {
      // Clear any invalid tokens
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      sessionStorage.clear();
      
      // Redirect to login with a return URL
      const currentPath = window.location.pathname;
      router.push(`/auth/sign-in?callbackUrl=${encodeURIComponent(currentPath)}`);
      return null;
    }

    // Refresh cart after successful update
    if (token) {
      await getAllCartItems(token);
    }

    return res.data.data; // Return item payload for Redux
  } catch (error: any) {
    console.error("Error while adding item to cart:", error);
    
    // If it's an authentication error, clear tokens and redirect
    if (error?.response?.status === 401) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      sessionStorage.clear();
      const currentPath = window.location.pathname;
      router.push(`/auth/sign-in?callbackUrl=${encodeURIComponent(currentPath)}`);
    } else {
      toast.error("Failed to add item. Please try again.");
    }

    return null;
  }
};

export const updateCartItem = async (
  id: string, // Assuming this is CartItem ID from the server
  quantity: any,
  // dispatch: any,
  token: string
) => {
  try {
    const res = await apiConnector(
      "PUT",
      PUTCART_ITEM_API(id),
      { quantity },
      { Authorization: `Bearer ${token}` }
    );

    if (!res?.data?.success) {
      throw new Error(res?.data?.message || "Could not update cart item");
    }

    if (token) {
      await getAllCartItems(token);
    }

    toast.success("Item updated to cart");

    return res.data.data;
  } catch (error: any) {
    console.error("Update cart item error:", error);
    
    // Handle specific error cases
    if (error.response?.status === 404) {
      throw new Error("Cart item not found. Please refresh and try again.");
    } else if (error.response?.status === 403) {
      throw new Error("Access denied. Please login again.");
    } else if (error.response?.status === 401) {
      throw new Error("Session expired. Please login again.");
    } else {
      throw new Error(error.message || "Failed to update cart item");
    }
  }
};

export const deleteCartItem = async (id: string, token: string) => {
  try {
    const res = await apiConnector(
      "DELETE",
      DELETECART_ITEM_API(id),
      {}, // No body
      { Authorization: `Bearer ${token}` }
    );

    if (!res?.data?.success) {
      throw new Error("Could not remove item");
    }

    // DISPATCH THE REDUX ACTION
    // const productId = res.data.data.productId; // Check your actual API response structure

    if (token) {
      await getAllCartItems(token);
    }
    toast.success("Removed from cart");
    return res.data.data;
  } catch (error: any) {
    // ... (Error handling) ...
  }
};

export const getCartItem = async (userId: string, dispatch: any) => {
  try {
    const res = await apiConnector("GET", GETCART_ITEM_API(userId));

    if (!res?.data?.success) {
      throw new Error(res?.data?.message || "Failed to fetch cart");
    }

    // Add each product to redux cart
    res.data.data.forEach((item: any) => {
      dispatch();
      // addToCart({
      //   _id: item._id,
      //   name: item.name,
      //   category: item.category,
      //   subCategory: item.subCategory,
      //   unit: item.unit,
      //   stock: item.stock,
      //   price: item.price,
      //   discount: item.discount,
      //   quantity: item.quantity,
      //   image: item.image,
      //   description: item.description,
      //   more_details: item.more_details || {},
      // })
    });

    return res.data.data;
  } catch (error: any) {
    console.log("GET CART ERROR", error);
    // toast.error(error.message || "Something went wrong");
    return null;
  }
};

// NOTE: LocalCartItems should be the array of items currently in your Redux store
export const syncCartAfterLogin = async (
  localCartItems: any[],
  dispatch: any,
  token: string
) => {
  try {
    const res = await apiConnector(
      "POST",
      SYNCCART_ITEM_API,
      localCartItems, // Send the local cart data in the request body
      { Authorization: `Bearer ${token}` }
    );

    if (!res?.data?.success) {
      throw new Error(res?.data?.message || "Failed to sync cart");
    }

    // 1. 🔥 Map the server response (which is populated) to the correct nested structure
    //    expected by your Redux CartItem interface (item.product.price).
    const rawCartItems = res.data.data;

    const mappedCartItems: CartItem[] = rawCartItems.map((item: any) => ({
      _id: item._id,
      quantity: item.quantity,
      product: item.productId, // Map the populated document to the 'product' key
    }));

    // 2. Dispatch the final merged cart to Redux
    // dispatch(handleAddItemCart(mappedCartItems));
    toast.success("Cart synchronized successfully!");
  } catch (error: any) {
    console.error("CART SYNC ERROR:", error);
    toast.error(error.message || "Failed to sync local cart data.");
  }
};
