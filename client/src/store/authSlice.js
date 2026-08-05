import { createSlice } from "@reduxjs/toolkit";

const hasSessionHint = typeof window !== "undefined" && localStorage.getItem("streamify_has_session") === "true";

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: hasSessionHint,
  sessionChecked: !hasSessionHint,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.sessionChecked = true;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.sessionChecked = true;
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    },
    clearAuth: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.sessionChecked = true;
    },
  },
});

export const { login, logout, updateUser, clearAuth } = authSlice.actions;
export default authSlice.reducer;
