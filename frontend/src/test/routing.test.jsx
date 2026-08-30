import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../store/authSlice";
import uiReducer from "../store/uiSlice";
import { ProtectedRoute } from "../routes/RouteGuards";
import { NotFoundPage } from "../pages/error/NotFoundPage";

const renderWithRouter = (ui, { initialEntries = ["/"], store = null } = {}) => {
  const testStore =
    store ||
    configureStore({
      reducer: { auth: authReducer, ui: uiReducer },
      preloadedState: {
        auth: {
          isAuthenticated: false,
          user: null,
          isLoading: false,
          sessionChecked: true,
        },
      },
    });

  return render(
    <Provider store={testStore}>
      <MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>
    </Provider>
  );
};

describe("Frontend Routing & Route Guard Tests", () => {
  it("1. ProtectedRoute redirects unauthenticated user to /login", () => {
    renderWithRouter(
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<div>Protected Dashboard Content</div>} />
        </Route>
        <Route path="/login" element={<div>Login Page Screen</div>} />
      </Routes>,
      { initialEntries: ["/dashboard"] }
    );

    expect(screen.getByText("Login Page Screen")).toBeInTheDocument();
    expect(
      screen.queryByText("Protected Dashboard Content")
    ).not.toBeInTheDocument();
  });

  it("2. ProtectedRoute renders child route via Outlet when user is authenticated", () => {
    const authStore = configureStore({
      reducer: { auth: authReducer, ui: uiReducer },
      preloadedState: {
        auth: {
          isAuthenticated: true,
          user: { _id: "u1", username: "john" },
          isLoading: false,
          sessionChecked: true,
        },
      },
    });

    renderWithRouter(
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<div>Protected Dashboard Content</div>} />
        </Route>
      </Routes>,
      { initialEntries: ["/dashboard"], store: authStore }
    );

    expect(screen.getByText("Protected Dashboard Content")).toBeInTheDocument();
  });

  it("3. Unknown route renders 404 NotFoundPage component", () => {
    renderWithRouter(
      <Routes>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>,
      { initialEntries: ["/random-non-existent-route-999"] }
    );

    expect(screen.getByText(/404/i)).toBeInTheDocument();
  });
});
