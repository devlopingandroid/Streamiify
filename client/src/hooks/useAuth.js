import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import { login, logout, clearAuth } from "../store/authSlice";
import { 
  loginApi, 
  registerApi, 
  logoutApi, 
  forgotPasswordApi, 
  resetPasswordApi,
  verifyEmailApi,
  resendVerificationApi 
} from "../services/auth.api";
import { getCurrentUserApi } from "../services/user.api";

/**
 * Hook to retrieve and watch the current user session details.
 */
export const useCurrentUser = (options = {}) => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const hasSessionHint = typeof window !== "undefined" && localStorage.getItem("streamify_has_session") === "true";

  return useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      try {
        const response = await getCurrentUserApi();
        const user = response?.data;
        dispatch(login(user));
        localStorage.setItem("streamify_has_session", "true");
        return user;
      } catch (err) {
        // 401 after logout is expected
        if (err.status === 401 || err.originalError?.response?.status === 401) {
          dispatch(clearAuth());
          localStorage.setItem("streamify_has_session", "false");
          return null;
        }

        throw err;
      }
    },
    retry: false, // Do not spam retries on unauthenticated sessions
    staleTime: 1000 * 60 * 15, // 15 mins stale time
    enabled: hasSessionHint || isAuthenticated,
    ...options,
  });
};

/**
 * Hook to execute user authentication login.
 */
export const useLogin = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: loginApi,
    onSuccess: (data) => {
      const user = data?.data?.user;
      localStorage.setItem("streamify_has_session", "true");
      dispatch(login(user));
      queryClient.setQueryData(["currentUser"], user);
    },
  });
};

/**
 * Hook to register a new user profile.
 */
export const useRegister = () => {
  return useMutation({
    mutationFn: registerApi,
  });
};

/**
 * Hook to execute logout and session clear actions.
 */
export const useLogout = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logoutApi,
    onSuccess: () => {
      localStorage.setItem("streamify_has_session", "false");
      dispatch(logout());
      queryClient.setQueryData(["currentUser"], null);
      queryClient.clear(); // Clear all server states cache
    },
    onError: () => {
      // Clean local session state even if network call fails
      localStorage.setItem("streamify_has_session", "false");
      dispatch(logout());
      queryClient.clear();
    },
  });
};

/**
 * Hook to request password reset link via email.
 */
export const useForgotPassword = () => {
  return useMutation({
    mutationFn: forgotPasswordApi,
  });
};

/**
 * Hook to reset password using token.
 */
export const useResetPassword = () => {
  return useMutation({
    mutationFn: resetPasswordApi,
  });
};

/**
 * Hook to verify email address with token.
 */
export const useVerifyEmail = (token, options = {}) => {
  return useQuery({
    queryKey: ["verifyEmail", token],
    queryFn: () => verifyEmailApi(token),
    enabled: !!token,
    retry: false,
    refetchOnWindowFocus: false,
    ...options,
  });
};

/**
 * Hook to request resending email verification link.
 */
export const useResendVerification = () => {
  return useMutation({
    mutationFn: resendVerificationApi,
  });
};


