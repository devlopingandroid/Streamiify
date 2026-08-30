import { describe, it, expect, beforeEach } from "vitest";
import { login, logout, clearAuth } from "../store/authSlice";
import { store } from "../store";

describe("Frontend Authentication State & Security Tests", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    store.dispatch(clearAuth());
  });

  it("1. login action updates Redux state with user data and sets session flag", () => {
    const mockUser = {
      _id: "user_123",
      username: "testuser",
      email: "test@example.com",
      fullname: "Test User",
    };

    store.dispatch(login(mockUser));

    const state = store.getState().auth;
    expect(state.isAuthenticated).toBe(true);
    expect(state.user).toEqual(mockUser);
    expect(state.isLoading).toBe(false);
  });

  it("2. logout action resets authentication state and clears user payload", () => {
    store.dispatch(login({ _id: "user_123", username: "testuser" }));
    expect(store.getState().auth.isAuthenticated).toBe(true);

    store.dispatch(logout());

    const state = store.getState().auth;
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
  });

  it("3. clearAuth resets session state safely upon refresh failure", () => {
    store.dispatch(login({ _id: "user_123", username: "testuser" }));
    store.dispatch(clearAuth());

    const state = store.getState().auth;
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.sessionChecked).toBe(true);
  });

  it("4. Security verification: JWT access/refresh tokens are NEVER written to localStorage or sessionStorage", () => {
    store.dispatch(login({ _id: "user_123", username: "testuser" }));

    expect(localStorage.getItem("accessToken")).toBeNull();
    expect(localStorage.getItem("refreshToken")).toBeNull();
    expect(localStorage.getItem("token")).toBeNull();

    expect(sessionStorage.getItem("accessToken")).toBeNull();
    expect(sessionStorage.getItem("refreshToken")).toBeNull();
    expect(sessionStorage.getItem("token")).toBeNull();
  });
});
