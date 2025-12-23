import { createSlice } from "@reduxjs/toolkit";

const uiSlice = createSlice({
  name: "ui",
  initialState: {
    openProfile: false,
    openCart: false,
  },
  reducers: {
    setOpenProfile: (state, action) => {
      state.openProfile = action.payload;
    },
    setOpenCart: (state, action) => {
      state.openCart = action.payload;
    },
  },
});

export const { setOpenProfile, setOpenCart } = uiSlice.actions;
export default uiSlice.reducer;
