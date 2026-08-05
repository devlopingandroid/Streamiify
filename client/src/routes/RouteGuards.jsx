import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { PageLoader } from "../components/ui/PageLoader";

/**
 * ProtectedRoute Guard.
 * Restricts access to authenticated users. Unauthenticated sessions redirect to /login.
 */
export const ProtectedRoute = ({ redirectPath = "/login" }) => {
  const { isAuthenticated, isLoading, sessionChecked } = useSelector((state) => state.auth);

  // Block rendering and show fullscreen PageLoader until the initial check completes
  if (isLoading || !sessionChecked) {
    return <PageLoader message="Verifying session credentials..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
};

/**
 * PublicOnlyRoute Guard.
 * Restricts access to unauthenticated users. Authenticated sessions redirect to /.
 */
export const PublicOnlyRoute = ({ redirectPath = "/" }) => {
  const { isAuthenticated, isLoading, sessionChecked } = useSelector((state) => state.auth);

  // Block rendering and show fullscreen PageLoader until the initial check completes
  if (isLoading || !sessionChecked) {
    return <PageLoader message="Initializing secure gateway..." />;
  }

  if (isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
