import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AddressType } from "@/@types/address";

interface AddressState {
  addresses: AddressType[];
  loading: boolean;
}

const initialState: AddressState = {
  addresses: [],
  loading: false,
};

export const addressSlice = createSlice({
  name: "address",
  initialState,
  reducers: {
    // 🚀 Start loading
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    // 🚀 Set All Addresses
    setAddresses: (state, action: PayloadAction<AddressType[]>) => {
      state.addresses = action.payload;
    },

    // 🚀 Add a new Address
    addAddressToState: (state, action: PayloadAction<AddressType>) => {
      state.addresses.push(action.payload);
    },

    // 🚀 Update existing Address
    updateAddressInState: (state, action: PayloadAction<AddressType>) => {
      const updated = action.payload;
      state.addresses = state.addresses.map((addr) =>
        addr._id === updated._id ? updated : addr
      );
    },

    // 🚀 Delete Address
    deleteAddressFromState: (state, action: PayloadAction<string>) => {
      state.addresses = state.addresses.filter(
        (addr) => addr._id !== action.payload
      );
    },
  },
});

export const {
  setLoading,
  setAddresses,
  addAddressToState,
  updateAddressInState,
  deleteAddressFromState,
} = addressSlice.actions;

export default addressSlice.reducer;
