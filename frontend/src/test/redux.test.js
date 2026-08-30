import { describe, it, expect } from "vitest";
import authReducer, { login, logout, updateUser, clearAuth } from "../store/authSlice";
import uiReducer, { setTheme, toggleSidebar } from "../store/uiSlice";

describe("Redux State Slices Unit Tests", () => {
  describe("authSlice Reducers", () => {
    const initialState = {
      user: null,
      isAuthenticated: false,
      isLoading: false,
      sessionChecked: false,
    };

    it("1. login updates user and sets isAuthenticated to true", () => {
      const userPayload = { _id: "u1", username: "john_doe" };
      const state = authReducer(initialState, login(userPayload));

      expect(state.isAuthenticated).toBe(true);
      expect(state.user).toEqual(userPayload);
      expect(state.sessionChecked).toBe(true);
    });

    it("2. logout resets user and isAuthenticated to false", () => {
      const loggedInState = {
        user: { _id: "u1" },
        isAuthenticated: true,
        isLoading: false,
        sessionChecked: true,
      };
      const state = authReducer(loggedInState, logout());

      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
    });

    it("3. updateUser updates user fields without breaking state structure", () => {
      const loggedInState = {
        user: { _id: "u1", fullname: "Old Name" },
        isAuthenticated: true,
      };
      const state = authReducer(
        loggedInState,
        updateUser({ fullname: "New Name" })
      );

      expect(state.user.fullname).toBe("New Name");
      expect(state.user._id).toBe("u1");
    });

    it("4. clearAuth resets state safely", () => {
      const state = authReducer(
        { user: { _id: "u1" }, isAuthenticated: true },
        clearAuth()
      );

      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.sessionChecked).toBe(true);
    });
  });

  describe("uiSlice Reducers", () => {
    const initialUiState = {
      theme: "dark",
      sidebarExpanded: true,
    };

    it("5. setTheme directly updates theme string", () => {
      const state = uiReducer(initialUiState, setTheme("light"));
      expect(state.theme).toBe("light");
    });

    it("6. toggleSidebar toggles sidebarExpanded boolean", () => {
      const state = uiReducer(initialUiState, toggleSidebar());
      expect(state.sidebarExpanded).toBe(false);
    });
  });
});
