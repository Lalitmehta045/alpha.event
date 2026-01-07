"use client";

import React, { useEffect, useState } from "react";
import { FaMinus, FaPlus } from "react-icons/fa6";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store/store";
import {
  addToCart,
  updateQuantity,
  removeFromCart,
} from "@/redux/slices/cartSlice";
import Loading from "./Loading";
import { Product } from "@/@types/product";
import { cn } from "@/lib/utils";
import { IoCartOutline } from "react-icons/io5";
import {
  addCartItem,
  deleteCartItem,
  updateCartItem,
} from "@/services/operations/cartItem";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { setToken, setUser } from "@/redux/slices/authSlice";

interface Props {
  data: Product;
  className?: string;
  icon?: any;
}

const AddToCartButton: React.FC<Props> = ({ data, className, icon }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { data: session } = useSession();
  const reduxToken = useSelector((state: RootState) => state.auth.token);
  
  // Use NextAuth session OR Redux token
  const token = reduxToken || (session?.user ? "google-auth-session" : null);
  const isLoggedIn = !!token || !!session?.user;

  const cartItems = useSelector((state: RootState) => state.cart.items);

  const [loading, setLoading] = useState(false);
  const [qty, setQty] = useState(0);

  const cartItem = cartItems.find((item) => item.product._id === data._id);

  useEffect(() => {
    if (cartItem) {
      setQty(cartItem.quantity);
    } else {
      setQty(0);
    }
  }, [cartItem]);

  // ================Add To Cart=========================
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn) {
      // Store the current URL to redirect back after login
      const currentPath = window.location.pathname;
      router.push(`/auth/sign-in?callbackUrl=${encodeURIComponent(currentPath)}`);
      return;
    }

    try {
      setLoading(true);
      const productId = data._id;
      
      // Always get a fresh token if available
      const currentToken = localStorage.getItem("accessToken") || token;
      
      if (!currentToken) {
        toast.error("Session expired. Please log in again.");
        const currentPath = window.location.pathname;
        router.push(`/auth/sign-in?callbackUrl=${encodeURIComponent(currentPath)}`);
        return;
      }

      // If Google login (NextAuth session) but no Redux token, generate JWT token first
      if (session?.user && !reduxToken) {
        const res = await fetch("/api/auth/google-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
        
        if (!res.ok) {
          throw new Error("Token generation failed");
        }
        
        const tokenResponse = await res.json();
        if (!tokenResponse.success || !tokenResponse.data) {
          throw new Error("Invalid token response");
        }

        // Store tokens in Redux and localStorage
        dispatch(setToken(tokenResponse.data.accessToken));
        dispatch(setUser(tokenResponse.data.user));
        localStorage.setItem("accessToken", tokenResponse.data.accessToken);
        localStorage.setItem("refreshToken", tokenResponse.data.refreshToken);
        localStorage.setItem("user", JSON.stringify(tokenResponse.data.user));

        // Use the new token for add to cart
        const response = await addCartItem(productId, router, tokenResponse.data.accessToken);
        
        if (!response) {
          // Error is already handled in addCartItem
          return;
        }

        const addPayload = {
          _id: response._id,
          quantity: response.quantity,
          product: response.productId,
        };

        dispatch(addToCart(addPayload));
        toast.success("Item added to cart!");
      } else {
        // Regular flow for users with existing tokens
        const response = await addCartItem(productId, router, currentToken as string);
        
        if (!response) {
          // Error is already handled in addCartItem
          return;
        }

        const addPayload = {
          _id: response._id,
          quantity: response.quantity,
          product: response.productId,
        };

        dispatch(addToCart(addPayload));
        toast.success("Item added to cart!");
      }
    } catch (error) {
      console.error("Add to cart error:", error);
      if (error instanceof Error) {
        toast.error(error.message || "Failed to add item");
      }
    } finally {
      setLoading(false);
    }
  };

  // =========================Increase Quantity============================
  const increaseQty = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn) {
      toast.error("Please Login First");
      const currentPath = window.location.pathname;
      router.push(`/auth/sign-in?callbackUrl=${encodeURIComponent(currentPath)}`);
      return;
    }

    // Ensure token exists for Google users
    let finalToken = reduxToken || localStorage.getItem("accessToken");
    if (session?.user && !finalToken) {
      try {
        const res = await fetch("/api/auth/google-token", {
          method: "POST",
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            dispatch(setToken(data.data.accessToken));
            dispatch(setUser(data.data.user));
            localStorage.setItem("accessToken", data.data.accessToken);
            localStorage.setItem("refreshToken", data.data.refreshToken);
            localStorage.setItem("user", JSON.stringify(data.data.user));
            finalToken = data.data.accessToken;
          }
        }
      } catch (error) {
        console.error("Token generation failed:", error);
        toast.error("Session expired. Please log in again.");
        const currentPath = window.location.pathname;
        router.push(`/auth/sign-in?callbackUrl=${encodeURIComponent(currentPath)}`);
        return;
      }
    }

    if (!finalToken) {
      toast.error("Please Login First");
      return;
    }

    if (!data._id) return;
    const newQty = qty + 1;
    const cartId = cartItem?._id;

    try {
      const response = await updateCartItem(
        cartId as string,
        newQty,
        finalToken
      );

      // Check if response is valid before accessing properties
      if (!response) {
        throw new Error("No response from server");
      }

      const updatePayload = {
        _id: response._id,
        quantity: response.quantity,
        product: response.productId || response.product,
      };

      dispatch(updateQuantity(updatePayload));
    } catch (error: any) {
      console.error("Increase quantity error:", error);
      toast.error(error.message || "Failed to update quantity");
      // Optionally refresh cart to sync state
      // await getAllCartItems(finalToken);
    }
  };

  // ==========Decrease Quantity=======================
  const decreaseQty = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn) {
      toast.error("Please Login First");
      const currentPath = window.location.pathname;
      router.push(`/auth/sign-in?callbackUrl=${encodeURIComponent(currentPath)}`);
      return;
    }

    // Ensure token exists for Google users
    let finalToken = reduxToken || localStorage.getItem("accessToken");
    if (session?.user && !finalToken) {
      try {
        const res = await fetch("/api/auth/google-token", {
          method: "POST",
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            dispatch(setToken(data.data.accessToken));
            dispatch(setUser(data.data.user));
            localStorage.setItem("accessToken", data.data.accessToken);
            localStorage.setItem("refreshToken", data.data.refreshToken);
            localStorage.setItem("user", JSON.stringify(data.data.user));
            finalToken = data.data.accessToken;
          }
        }
      } catch (error) {
        console.error("Token generation failed:", error);
        toast.error("Session expired. Please log in again.");
        const currentPath = window.location.pathname;
        router.push(`/auth/sign-in?callbackUrl=${encodeURIComponent(currentPath)}`);
        return;
      }
    }

    if (!finalToken) {
      toast.error("Please Login First");
      return;
    }

    if (!data._id) return;

    const newQty = qty - 1;
    const cartId = cartItem?._id;

    if (!cartId) return;

    if (newQty === 0) {
      try {
        const delresponse = await deleteCartItem(
          cartId as string,
          finalToken
        );

        dispatch(removeFromCart(cartId));
      } catch (error) {
        toast.error("Failed to remove item from cart.");
      }
    } else {
      try {
        const response = await updateCartItem(
          cartId as string,
          newQty,
          finalToken
        );

        // Check if response is valid before accessing properties
        if (!response) {
          throw new Error("No response from server");
        }

        const updatePayload = {
          _id: response._id,
          quantity: response.quantity,
          product: response.productId || response.product,
        };

        dispatch(updateQuantity(updatePayload));
      } catch (error: any) {
        console.error("Decrease quantity error:", error);
        toast.error(error.message || "Failed to update quantity");
        // Optionally refresh cart to sync state
        // await getAllCartItems(finalToken);
      }
    }
  };

  return (
    <div
      className={cn(
        "text-center cursor-pointer rounded-lg bg-white",
        className
      )}
    >
      {qty > 0 ? (
        <div className="flex w-full items-center gap-3">
          <button
            onClick={decreaseQty}
            style={{
              backgroundColor: "var(--cta-Bg)",
            }}
            disabled={loading}
            className="cursor-pointer hover:bg-(--cta-Bg-hover) text-white font-bold rounded-l-lg px-3 py-2 text-xs"
          >
            <FaMinus />
          </button>

          <p className="flex-1 text-center font-semibold">{qty}</p>

          <button
            onClick={increaseQty}
            style={{
              backgroundColor: "var(--cta-Bg)",
            }}
            disabled={loading}
            className="cursor-pointer hover:bg-(--cta-Bg-hover) text-white font-bold rounded-r-lg px-3 py-2 text-xs"
          >
            <FaPlus />
          </button>
        </div>
      ) : (
        <button
          onClick={handleAddToCart}
          className={`text-center flex gap-3 cursor-pointer items-center justify-center mx-auto font-semibold transition-all `}
        >
          {loading ? <Loading /> : "Add to cart"}
          {/* <IoCartOutline style={{ width: 20, height: 20 }} /> */}
          {icon}
        </button>
      )}
    </div>
  );
};

export default AddToCartButton;
