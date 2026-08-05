import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { deleteVideoApi } from "../services/video.api";

/**
 * Hook to delete a video and invalidate the related video cache listings.
 */
export const useDeleteVideo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteVideoApi,
    onSuccess: (response) => {
      toast.success(response?.message || "Video deleted successfully.");
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["videos"] });
      queryClient.invalidateQueries({ queryKey: ["videos", "trending"] });
      queryClient.invalidateQueries({ queryKey: ["channelVideos"] });
    },
    onError: (error) => {
      const errorMsg = error?.message || "Failed to delete video.";
      toast.error(errorMsg);
    },
  });
};

export default useDeleteVideo;
