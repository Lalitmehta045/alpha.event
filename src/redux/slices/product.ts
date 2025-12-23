import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Category, SubCategory } from "@/@types/catregory";
import { Product } from "@/@types/product";

export interface ProductState {
  allCategory: Category[];
  loadingCategory: boolean;
  allSubCategory: SubCategory[];
  allProducts: Product[];
  allAdminProducts: Product[];
  product: Product | null; // ⬅ FIXED
  subcatproduct: Product | any;
}

// Initial State
const initialState: ProductState = {
  allCategory: [],
  loadingCategory: false,
  allSubCategory: [],
  allProducts: [],
  allAdminProducts: [],
  product: null, // ⬅ FIXED
  subcatproduct: null, // ⬅ FIXED
};

// Slice
const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {
    setAllCategory: (state, action: PayloadAction<Category[]>) => {
      state.allCategory = action.payload;
    },
    setLoadingCategory: (state, action: PayloadAction<boolean>) => {
      state.loadingCategory = action.payload;
    },
    setAllSubCategory: (state, action: PayloadAction<SubCategory[]>) => {
      state.allSubCategory = action.payload;
    },
    setAllProducts: (state, action: PayloadAction<Product[]>) => {
      state.allProducts = action.payload;
    },

    setAllAdminProducts: (state, action: PayloadAction<Product[]>) => {
      state.allAdminProducts = action.payload;
    },

    // ⬅ FIXED TYPE
    setProduct: (state, action: PayloadAction<Product | null>) => {
      state.product = action.payload;
    },
    setSubCatProduct: (state, action: PayloadAction<Product | null>) => {
      state.subcatproduct = action.payload;
    },
  },
});

// Export actions
export const {
  setAllCategory,
  setAllSubCategory,
  setLoadingCategory,
  setAllProducts,
  setAllAdminProducts,
  setProduct,
  setSubCatProduct,
} = productSlice.actions;

// Export reducer
export default productSlice.reducer;
