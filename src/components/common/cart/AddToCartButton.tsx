"use client";

import React, { useEffect, useState } from "react";
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
import QuantitySelector from "../QuantitySelector";
import {
  addCartItem,
  deleteCartItem,
  updateCartItem,
} from "@/services/operations/cartItem";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { setToken, setUser } from "@/redux/slices/authSlice";
import {
  addToGuestCart,
  updateGuestCartQuantity,
  removeFromGuestCart,
  saveGuestCart,
  getGuestCart,
} from "@/utils/guestCart";

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
  const isLoggedIn = !!reduxToken || !!session?.user;

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

    // ✅ GUEST USER: Add to localStorage guest cart
    if (!isLoggedIn) {
      try {
        const guestItem = addToGuestCart(data as any);
        dispatch(
          addToCart({
            _id: guestItem._id,
            quantity: 1,
            product: data as any,
          })
        );
        toast.success("Item added to cart!");
      } catch (error) {
        console.error("Guest add to cart error:", error);
        toast.error("Failed to add item");
      }
      return;
    }

    try {
      setLoading(true);
      const productId = data._id;

      // Always get a fresh token if available
      const currentToken = reduxToken || localStorage.getItem("accessToken");

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

    // ✅ GUEST USER: Update localStorage guest cart
    if (!isLoggedIn) {
      const newQty = qty + 1;
      updateGuestCartQuantity(data._id, newQty);
      dispatch(
        updateQuantity({
          _id: cartItem?._id || `guest_${data._id}`,
          quantity: newQty,
        })
      );
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
    }
  };

  // ==========Decrease Quantity=======================
  const decreaseQty = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // ✅ GUEST USER: Update/remove from localStorage guest cart
    if (!isLoggedIn) {
      const newQty = qty - 1;
      const cartId = cartItem?._id || `guest_${data._id}`;

      if (newQty <= 0) {
        removeFromGuestCart(data._id);
        dispatch(removeFromCart(cartId));
      } else {
        updateGuestCartQuantity(data._id, newQty);
        dispatch(updateQuantity({ _id: cartId, quantity: newQty }));
      }
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
        "text-center cursor-pointer rounded-lg bg-white flex items-center justify-center",
        className
      )}
      onClick={qty === 0 && !loading ? handleAddToCart : undefined}
    >
      {qty > 0 ? (
        <QuantitySelector
          value={qty}
          onChange={async (newQty) => {
            // ✅ GUEST USER: Handle direct input changes locally
            if (!isLoggedIn) {
              const cartId = cartItem?._id || `guest_${data._id}`;

              if (newQty === 0) {
                removeFromGuestCart(data._id);
                dispatch(removeFromCart(cartId));
                toast.success("Item removed from cart");
              } else {
                updateGuestCartQuantity(data._id, newQty);
                dispatch(updateQuantity({ _id: cartId, quantity: newQty }));
                toast.success("Quantity updated");
              }
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

            const cartId = cartItem?._id;
            if (!cartId) return;

            // If quantity is 0, remove the item from cart
            if (newQty === 0) {
              try {
                setLoading(true);
                await deleteCartItem(cartId as string, finalToken);
                dispatch(removeFromCart(cartId));
                toast.success("Item removed from cart");
              } catch (error) {
                toast.error("Failed to remove item from cart.");
              } finally {
                setLoading(false);
              }
            } else {
              // Update the quantity
              try {
                setLoading(true);
                const response = await updateCartItem(
                  cartId as string,
                  newQty,
                  finalToken
                );

                if (!response) {
                  throw new Error("No response from server");
                }

                const updatePayload = {
                  _id: response._id,
                  quantity: response.quantity,
                  product: response.productId || response.product,
                };

                dispatch(updateQuantity(updatePayload));
                toast.success("Quantity updated");
              } catch (error: any) {
                console.error("Update quantity error:", error);
                toast.error(error.message || "Failed to update quantity");
              } finally {
                setLoading(false);
              }
            }
          }}
          onIncrement={() => {
            const mockEvent = {
              preventDefault: () => { },
              stopPropagation: () => { },
            } as React.MouseEvent;
            increaseQty(mockEvent);
          }}
          onDecrement={() => {
            const mockEvent = {
              preventDefault: () => { },
              stopPropagation: () => { },
            } as React.MouseEvent;
            decreaseQty(mockEvent);
          }}
          min={0}
          disabled={loading}
          loading={loading}
          className="w-full h-full"
          size="md"
        />
      ) : (
        <button
          onClick={handleAddToCart}
          className={`text-center flex w-full h-full gap-3 cursor-pointer items-center justify-center mx-auto font-semibold transition-all `}
          disabled={loading}
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
