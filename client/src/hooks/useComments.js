import { useQuery, useMutation, useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import {
  createCommentApi,
  getVideoCommentsApi,
  getCommentCountApi,
  createReplyApi,
  getRepliesApi,
  updateCommentApi,
  deleteCommentApi,
} from "../services/comment.api";

/**
 * Hook to retrieve comments on a video with pagination.
 */
export const useInfiniteVideoComments = (videoId, limit = 10) => {
  return useInfiniteQuery({
    queryKey: ["videoComments", videoId],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await getVideoCommentsApi(videoId, pageParam, limit);
      return response?.data;
    },
    getNextPageParam: (lastPage) => {
      return lastPage?.hasNextPage ? lastPage.page + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: !!videoId,
  });
};

/**
 * Hook to fetch comments count for a video.
 */
export const useCommentCount = (videoId) => {
  return useQuery({
    queryKey: ["commentCount", videoId],
    queryFn: async () => {
      if (!videoId) return 0;
      const response = await getCommentCountApi(videoId);
      return response?.data?.totalComments || 0;
    },
    enabled: !!videoId,
  });
};

/**
 * Hook to retrieve all replies associated with a parent comment.
 */
export const useCommentReplies = (commentId) => {
  return useQuery({
    queryKey: ["commentReplies", commentId],
    queryFn: async () => {
      if (!commentId) return [];
      const response = await getRepliesApi(commentId);
      return response?.data || [];
    },
    enabled: false, // Refetch on-demand
  });
};

/**
 * Hook to create a parent comment on a video.
 */
export const useCreateComment = (videoId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (content) => {
      return await createCommentApi(videoId, content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["videoComments", videoId] });
      queryClient.invalidateQueries({ queryKey: ["commentCount", videoId] });
      toast.success("Comment added.");
    },
    onError: (err) => {
      toast.error(err?.message || "Failed to add comment.");
    },
  });
};

/**
 * Hook to create a reply to a parent comment.
 */
export const useCreateReply = (videoId, parentCommentId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (content) => {
      return await createReplyApi(parentCommentId, content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["commentReplies", parentCommentId] });
      queryClient.invalidateQueries({ queryKey: ["videoComments", videoId] });
      queryClient.invalidateQueries({ queryKey: ["commentCount", videoId] });
      toast.success("Reply posted.");
    },
    onError: (err) => {
      toast.error(err?.message || "Failed to post reply.");
    },
  });
};

/**
 * Hook to edit a comment or reply.
 */
export const useUpdateComment = (videoId, parentCommentId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ commentId, content }) => {
      return await updateCommentApi(commentId, content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["videoComments", videoId] });
      if (parentCommentId) {
        queryClient.invalidateQueries({ queryKey: ["commentReplies", parentCommentId] });
      }
      toast.success("Comment updated.");
    },
    onError: (err) => {
      toast.error(err?.message || "Failed to update comment.");
    },
  });
};

/**
 * Hook to delete a comment or reply.
 */
export const useDeleteComment = (videoId, parentCommentId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (commentId) => {
      return await deleteCommentApi(commentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["videoComments", videoId] });
      queryClient.invalidateQueries({ queryKey: ["commentCount", videoId] });
      if (parentCommentId) {
        queryClient.invalidateQueries({ queryKey: ["commentReplies", parentCommentId] });
      }
      toast.success("Comment deleted.");
    },
    onError: (err) => {
      toast.error(err?.message || "Failed to delete comment.");
    },
  });
};
