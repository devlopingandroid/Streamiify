import { apiClient } from "./apiClient";

export const loginApi = async (body) => {
  const response = await apiClient.post("/users/login", body);
  return response.data;
};

export const registerApi = async (formData) => {
  const response = await apiClient.post("/users/register", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const logoutApi = async () => {
  const response = await apiClient.post("/users/logout");
  return response.data;
};

export const refreshTokenApi = async () => {
  const response = await apiClient.post("/users/refresh-token");
  return response.data;
};

export const forgotPasswordApi = async (email) => {
  const response = await apiClient.post("/users/forgot-password", { email });
  return response.data;
};

export const resetPasswordApi = async ({ token, password }) => {
  const response = await apiClient.post(`/users/reset-password/${token}`, { password });
  return response.data;
};

export const verifyEmailApi = async (token) => {
  const response = await apiClient.get(`/users/verify-email/${token}`);
  return response.data;
};

export const resendVerificationApi = async (payload) => {
  const body = typeof payload === "string" 
    ? (payload.includes("@") ? { email: payload } : { username: payload }) 
    : payload;
  const response = await apiClient.post("/users/resend-verification", body);
  return response.data;
};


