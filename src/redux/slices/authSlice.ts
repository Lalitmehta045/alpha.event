import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface User {
  id: string;
  fname: string;
  lname: string;
  email: string;
  avatar?: string;
  phone: number;
  verify_email: boolean;
  last_login_date?: string | null;
  status: string;
  role: "USER" | "ADMIN" | "SUPER-ADMIN";
  [key: string]: any; // Optional extra fields
}

interface AuthState {
  user: User | any;
  isAuthenticated: boolean;
  signupData: any[] | null;
  token: string | null;
  refreshToken: string | null;
  loading: boolean;
}

const getStoredUser = () => {
  if (typeof window !== "undefined") {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  }
  return null;
};

const initialState: AuthState = {
  user: getStoredUser(), // load from storage
  isAuthenticated: !!getStoredUser(),
  token:
    typeof window !== "undefined" && localStorage.getItem("accessToken")
      ? localStorage.getItem("accessToken")
      : null,
  refreshToken:
    typeof window !== "undefined" && localStorage.getItem("refreshToken")
      ? localStorage.getItem("refreshToken")
      : null,
  loading: false,
  signupData: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<User | null>) {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    setSignupData(state, action: PayloadAction<any[] | null>) {
      state.signupData = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setToken(state, action: PayloadAction<string | null>) {
      state.token = action.payload;
      if (typeof window !== "undefined" && action.payload) {
        localStorage.setItem("accessToken", action.payload);
      } else if (typeof window !== "undefined") {
        localStorage.removeItem("accessToken");
      }
    },
    setRefreshToken(state, action: PayloadAction<string | null>) {
      state.refreshToken = action.payload;
      if (typeof window !== "undefined" && action.payload) {
        localStorage.setItem("refreshToken", action.payload);
      } else if (typeof window !== "undefined") {
        localStorage.removeItem("refreshToken");
      }
    },
  },
});

export const { setUser, setSignupData, setLoading, setToken, setRefreshToken } =
  authSlice.actions;

export default authSlice.reducer;
