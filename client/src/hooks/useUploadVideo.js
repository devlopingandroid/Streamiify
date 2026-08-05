import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { uploadVideoApi } from "../services/video.api";

/**
 * Hook to upload video with progress tracking and cache invalidation.
 */
export const useUploadVideo = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [uploadProgress, setUploadProgress] = useState(0);

  const mutation = useMutation({
    mutationFn: async (formData) => {
      setUploadProgress(0);
      return await uploadVideoApi(formData, (progressEvent) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        }
      });
    },
    onSuccess: (response) => {
      toast.success(response?.message || "Video uploaded successfully!");
      queryClient.invalidateQueries({ queryKey: ["videos"] });
      queryClient.invalidateQueries({ queryKey: ["videos", "trending"] });
      navigate("/");
    },
    onError: (error) => {
      const errorMsg = error?.message || "Failed to upload video.";
      toast.error(errorMsg);
    },
  });

  return {
    ...mutation,
    uploadProgress,
  };
};

export default useUploadVideo;
