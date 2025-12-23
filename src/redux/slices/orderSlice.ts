import { IAddress } from "@/@types/address";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Types } from "mongoose";

export interface OrderType {
  _id: string;
  userId: any;
  orderId: string;
  products: any[];
  paymentId?: string;
  order_status: string;
  payment_status: string;
  delivery_address: Types.ObjectId | IAddress | any; // Can be just an ID or a populated Address document
  totalAmt: number;
  subTotalAmt: number;
  invoice_receipt: string | any;
  createdAt: Date;
  updatedAt: Date;
}

interface COD {
  // ... (keep this definition as is)
  _id: string;
  orderId: string;
  products: any[];
  totalAmt?: number;
  order_status: "Processing" | "Request" | "Accepted" | "Cancelled";
  payment_status: string;
}

interface OrderState {
  COD: COD | null;
  lastOrder: OrderType | null;
  // ⭐ NEW: State to hold the array of all orders
  allOrders: OrderType[] | null;
  loading: boolean;
}

const initialState: OrderState = {
  COD: null,
  lastOrder: null,
  // ⭐ Initialize new state as empty array
  allOrders: [],
  loading: false,
};

const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    setLoading(state, action) {
      state.loading = action.payload;
    },
    // ⭐ ACTION TO SET THE ARRAY OF ALL ORDERS
    setAllOrders(state, action: PayloadAction<OrderType[]>) {
      state.allOrders = action.payload;
    },
    setLastOrder(state, action: PayloadAction<OrderType>) {
      state.lastOrder = action.payload;
    },
    setCOD(state, action) {
      state.COD = action.payload;
    },
    clearLastOrder(state) {
      state.lastOrder = null;
    },
  },
});

// ⭐ Export the new action
export const {
  setLoading,
  setCOD,
  setLastOrder,
  clearLastOrder,
  setAllOrders,
} = orderSlice.actions;

export default orderSlice.reducer;
