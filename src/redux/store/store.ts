import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../slices/authSlice";
import cartReducer from "../slices/cartSlice";
import profileReducer from "../slices/profile";
import productReducer from "../slices/product";
import addressReducer from "../slices/addressSlice";
import uiReducer from "../slices/ui.Slice";
import orderReducer from "../slices/orderSlice";

const store = configureStore({
  reducer: {
    order: orderReducer,
    address: addressReducer,
    auth: authReducer,
    profile: profileReducer,
    cart: cartReducer,
    product: productReducer,
    ui: uiReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
