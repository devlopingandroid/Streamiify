import { apiClient } from "./apiClient";

export const getCurrentUserApi = async () => {
  const response = await apiClient.get("/users/current-user");
  return response.data;
};

export const getChannelProfileApi = async (username) => {
  const response = await apiClient.get(`/users/c/${username}`);
  return response.data;
};

export const updateAccountApi = async (body) => {
  const response = await apiClient.patch("/users/update-account", body);
  return response.data;
};

export const updateAvatarApi = async (formData) => {
  const response = await apiClient.patch("/users/avatar", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const updateCoverImageApi = async (formData) => {
  const response = await apiClient.patch("/users/cover-image", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const changePasswordApi = async (body) => {
  const response = await apiClient.post("/users/change-password", body);
  return response.data;
};
