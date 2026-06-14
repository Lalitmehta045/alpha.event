"use client";

/**
 * GuestCartLoader
 * Loads guest cart from localStorage into Redux on app mount (for unauthenticated users).
 * If the user is logged in, the server cart is fetched instead (handled elsewhere).
 */

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store/store";
import { handleAddItemCart } from "@/redux/slices/cartSlice";
import { getGuestCart } from "@/utils/guestCart";

export default function GuestCartLoader() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );
  const cartItems = useSelector((state: RootState) => state.cart.items);

  useEffect(() => {
    // Only load guest cart if:
    // 1. User is NOT logged in
    // 2. Redux cart is currently empty (avoid overwriting server-fetched cart)
    if (!isAuthenticated && cartItems.length === 0) {
      const guestItems = getGuestCart();
      if (guestItems.length > 0) {
        dispatch(handleAddItemCart(guestItems));
      }
    }
  }, [isAuthenticated, dispatch]); // intentionally exclude cartItems to avoid infinite loop

  return null;
}
