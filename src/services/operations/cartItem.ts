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

export const getAllCartItems = async () => {
  try {
    const res = await apiConnector("GET", GETALLCART_ITEM_API, null);

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
    console.log("GET CART ERROR:", error);
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
      toast.error("Session expired, please login again");
      router.push("/auth/sign-in");
      return null;
    }

    // Refresh cart after successful update
    await getAllCartItems();

    return res.data.data; // Return item payload for Redux
  } catch (error: any) {
    console.error("Error while adding item to cart:", error);
    toast.error("Failed to add item");

    return null; // Always return a safe value
  }
};

export const updateCartItem = async (
  id: string, // Assuming this is the CartItem ID from the server
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
      throw new Error("Could not update cart item");
    }

    await getAllCartItems();

    toast.success("Item updated to cart");

    return res.data.data;
  } catch (error: any) {
    console.error("Error while update item to cart: ", error);
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

    await getAllCartItems();
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
