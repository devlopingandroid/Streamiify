import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { toggleVideoStatusApi } from "../services/video.api";

/**
 * Hook to toggle a video's published status and invalidate the related video cache listings.
 */
export const useToggleVideoStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleVideoStatusApi,
    onSuccess: (response) => {
      toast.success(response?.message || "Video status updated successfully.");
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["videos"] });
      queryClient.invalidateQueries({ queryKey: ["videos", "trending"] });
      queryClient.invalidateQueries({ queryKey: ["channelVideos"] });
    },
    onError: (error) => {
      const errorMsg = error?.message || "Failed to toggle video status.";
      toast.error(errorMsg);
    },
  });
};

export default useToggleVideoStatus;
