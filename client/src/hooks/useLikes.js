import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getVideoLikesApi, toggleLikeVideoApi } from "../services/likes.api";
import { toast } from "react-hot-toast";

/**
 * Hook to retrieve and toggle video like statistics with Optimistic UI updates.
 */
export const useVideoLikes = (videoId) => {
  const queryClient = useQueryClient();
  const queryKey = ["videoLikes", videoId];

  // Query likes status
  const query = useQuery({
    queryKey,
    queryFn: async () => {
      if (!videoId) return null;
      const response = await getVideoLikesApi(videoId);
      return response?.data || { totalLikes: 0, likedByCurrentUser: false };
    },
    enabled: !!videoId,
  });

  // Mutation to toggle like state optimistically
  const toggleLikeMutation = useMutation({
    mutationFn: async () => {
      return await toggleLikeVideoApi(videoId);
    },
    onMutate: async () => {
      // Cancel active queries to avoid overwrites
      await queryClient.cancelQueries({ queryKey });

      // Snapshot previous value
      const previousLikes = queryClient.getQueryData(queryKey);

      // Optimistically update
      queryClient.setQueryData(queryKey, (old) => {
        if (!old) return old;
        const nextLiked = !old.likedByCurrentUser;
        return {
          likedByCurrentUser: nextLiked,
          totalLikes: nextLiked ? old.totalLikes + 1 : Math.max(0, old.totalLikes - 1),
        };
      });

      // Context value for rollback
      return { previousLikes };
    },
    onError: (err, variables, context) => {
      // Rollback to previous state on error
      if (context?.previousLikes) {
        queryClient.setQueryData(queryKey, context.previousLikes);
      }
      toast.error(err?.message || "Failed to update like status.");
    },
    onSuccess: (data) => {
      const updated = data?.data;
      if (updated) {
        queryClient.setQueryData(queryKey, {
          likedByCurrentUser: updated.liked,
          totalLikes: updated.totalLikes,
        });
      }
      // Invalidate full user liked list cache
      queryClient.invalidateQueries({ queryKey: ["likedVideos"] });
    },
    onSettled: () => {
      // Refresh to confirm exact state
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return {
    ...query,
    toggleLike: toggleLikeMutation.mutate,
    isToggling: toggleLikeMutation.isPending,
  };
};

export default useVideoLikes;
