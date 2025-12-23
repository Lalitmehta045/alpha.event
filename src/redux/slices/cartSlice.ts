import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface CartItem {
  _id?: string;
  quantity: number;
  product: {
    _id: string;
    name: string;
    image?: Array<string>;
    category: Array<string>;
    subCategory: Array<string>;
    unit: string;
    stock: number;
    price: number;
    discount?: number | any;
    quantity?: number;
    description: string;
    more_details?: Record<string, string>;
  };
}

interface CartState {
  items: CartItem[];
  totalQuantity: number;
  totalPrice: number;
  totalOriginalPrice: number;
}

const initialState: CartState = {
  items: [],
  totalQuantity: 0,
  totalPrice: 0,
  totalOriginalPrice: 0,
};

// helper → apply discount
const calcDiscountPrice = (price: number, discount?: number) => {
  if (!discount || discount === 0) return price;
  return price - (price * discount) / 100;
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    handleAddItemCart: (state, action) => {
      // Use this to load/initialize the cart from an external source (e.g., localStorage)
      state.items = action.payload;

      // Recalculate all totals
      state.totalQuantity = state.items.reduce(
        (sum, item) => sum + item.quantity,
        0
      );

      state.totalOriginalPrice = state.items.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
      );

      state.totalPrice = state.items.reduce((sum, item) => {
        const discountedPrice = calcDiscountPrice(
          item.product.price,
          item.product.discount
        );
        return sum + discountedPrice * item.quantity;
      }, 0);
    },
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const item = state.items.find((i) => i._id === action.payload._id);

      const discountedPrice = calcDiscountPrice(
        action.payload.product.price,
        action.payload.product.discount
      );

      if (item) {
        item.quantity += action.payload.quantity;
      } else {
        state.items.push(action.payload);
      }

      state.totalQuantity += action.payload.quantity;
      state.totalOriginalPrice +=
        action.payload.product.price * action.payload.quantity;
      state.totalPrice += discountedPrice * action.payload.quantity;
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      const item = state.items.find((i) => i._id === action.payload);
      if (!item) return;

      const discountedPrice = calcDiscountPrice(
        item.product.price,
        item.product.discount
      );

      state.totalQuantity -= item.quantity;
      state.totalOriginalPrice -= item.product.price * item.quantity;
      state.totalPrice -= discountedPrice * item.quantity;

      state.items = state.items.filter((i) => i._id !== action.payload);
    },
    updateQuantity: (
      state,
      action: PayloadAction<{ _id: string; quantity: number }>
    ) => {
      const item = state.items.find((i) => i._id === action.payload._id);
      if (!item) return;

      const oldQty = item.quantity;
      const diff = action.payload.quantity - oldQty;

      const discountedPrice = calcDiscountPrice(
        item.product.price,
        item.product.discount
      );

      item.quantity = action.payload.quantity;

      state.totalQuantity += diff;
      state.totalOriginalPrice += diff * item.product.price;
      state.totalPrice += diff * discountedPrice;
    },
    clearCart: (state) => {
      state.items = [];
      state.totalQuantity = 0;
      state.totalOriginalPrice = 0;
      state.totalPrice = 0;
    },
  },
});

export const {
  handleAddItemCart,
  addToCart,
  removeFromCart,
  clearCart,
  updateQuantity,
} = cartSlice.actions;

export default cartSlice.reducer;
