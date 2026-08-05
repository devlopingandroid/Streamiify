import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useCurrentUser } from "./hooks/useAuth";
import { initializeTheme } from "./store/uiSlice";
import { AppRoutes } from "./routes/AppRoutes";
import { Toaster } from "react-hot-toast";
import { ToastNotification } from "./components/ui/ToastNotification";
import "./styles/index.css";

export const App = () => {
  const dispatch = useDispatch();

  // Execute startup cookies check validation via TanStack Query hook
  useCurrentUser();

  useEffect(() => {
    dispatch(initializeTheme());
  }, [dispatch]);

  return (
    <>
      <AppRoutes />
      <Toaster
        position="top-right"
        containerStyle={{
          top: 84,
          right: 16,
          zIndex: 99999,
        }}
      >
        {(t) => <ToastNotification t={t} />}
      </Toaster>
    </>
  );
};
export default App;
