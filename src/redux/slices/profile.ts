"use client";

import { IAddress } from "@/@types/address";
import { CartItem } from "@/@types/cart";
import { IOrder } from "@/@types/order";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// ✅ Helper to safely access localStorage in Next.js
const getStoredUser = () => {
  if (typeof window !== "undefined") {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  }
  return null;
};

export interface IUserProfile {
  _id: string;
  fname: string;
  lname: string;
  email: string;
  avatar: string | any;
  phone?: number | null;
  verify_email: boolean;
  last_login_date?: string | null;
  status: string;
  role: "USER" | "ADMIN" | "SUPER-ADMIN";
  address_details: IAddress[];
  shopping_cart: CartItem[];
  orderHistory: IOrder[];
}

interface ProfileState {
  profile: IUserProfile | any;
  loading: boolean;
}

const initialState: ProfileState = {
  profile: [],
  loading: false,
};

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    setProfile(state, action: PayloadAction<IUserProfile | null>) {
      state.profile = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
  },
});

export const { setProfile, setLoading } = profileSlice.actions;
export default profileSlice.reducer;
