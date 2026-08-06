import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import { updateUser } from "../store/authSlice";
import {
  getChannelProfileApi,
  updateAccountApi,
  updateAvatarApi,
  updateCoverImageApi,
  changePasswordApi,
} from "../services/user.api";

/**
 * Hook to fetch channel profile details.
 */
export const useChannel = (username) => {
  return useQuery({
    queryKey: ["channel", username],
    queryFn: async () => {
      if (!username) throw new Error("Username parameter is required");
      const response = await getChannelProfileApi(username);
      return response?.data || null;
    },
    enabled: !!username,
    staleTime: 1000 * 60 * 10,
  });
};

/**
 * Hook to execute profile details update.
 */
export const useUpdateAccount = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const { user } = useSelector((state) => state.auth);

  return useMutation({
    mutationFn: updateAccountApi,
    onSuccess: (data) => {
      const updatedData = data?.data;
      if (updatedData) {
        dispatch(updateUser({ fullname: updatedData.fullname, email: updatedData.email }));
        queryClient.setQueryData(["currentUser"], (old) => old ? { ...old, ...updatedData } : old);
        if (user?.username) {
          queryClient.invalidateQueries({ queryKey: ["channel", user.username] });
        }
      }
    },
  });
};

/**
 * Hook to execute profile avatar update.
 */
export const useUpdateAvatar = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const { user } = useSelector((state) => state.auth);

  return useMutation({
    mutationFn: updateAvatarApi,
    onSuccess: (data) => {
      const updatedUser = data?.data;
      if (updatedUser?.avatar) {
        dispatch(updateUser({ avatar: updatedUser.avatar }));
        queryClient.setQueryData(["currentUser"], (old) => old ? { ...old, avatar: updatedUser.avatar } : old);
        if (user?.username) {
          queryClient.invalidateQueries({ queryKey: ["channel", user.username] });
        }
      }
    },
  });
};

/**
 * Hook to execute profile cover image banner update.
 */
export const useUpdateCover = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const { user } = useSelector((state) => state.auth);

  return useMutation({
    mutationFn: updateCoverImageApi,
    onSuccess: (data) => {
      const updatedUser = data?.data;
      if (updatedUser?.coverImage) {
        dispatch(updateUser({ coverImage: updatedUser.coverImage }));
        queryClient.setQueryData(["currentUser"], (old) => old ? { ...old, coverImage: updatedUser.coverImage } : old);
        if (user?.username) {
          queryClient.invalidateQueries({ queryKey: ["channel", user.username] });
        }
      }
    },
  });
};

/**
 * Hook to change account password.
 */
export const useChangePassword = () => {
  return useMutation({
    mutationFn: changePasswordApi,
  });
};
