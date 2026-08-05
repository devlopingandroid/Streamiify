import { useQuery } from "@tanstack/react-query";
import { getVideosApi } from "../services/video.api";
import { getLikedVideosApi } from "../services/likes.api";
import { getWatchHistoryApi, getContinueWatchingApi } from "../services/watch.api";

/**
 * Hook to retrieve paginated videos uploaded by a channel owner.
 */
export const useProfileUploadedVideos = (userId, page = 1, limit = 8) => {
  return useQuery({
    queryKey: ["profileUploadedVideos", userId, page, limit],
    queryFn: async () => {
      if (!userId) return { docs: [], totalDocs: 0, totalPages: 0 };
      const response = await getVideosApi({ userId, page, limit });
      return response?.data || { docs: [], totalDocs: 0, totalPages: 0 };
    },
    enabled: !!userId,
  });
};

/**
 * Hook to retrieve paginated user liked videos.
 */
export const useProfileLikedVideos = (page = 1, limit = 8, enabled = true) => {
  return useQuery({
    queryKey: ["profileLikedVideos", page, limit],
    queryFn: async () => {
      const response = await getLikedVideosApi(page, limit);
      const likesList = response?.data?.likes || [];
      const videos = likesList.map((item) => item.video).filter(Boolean);
      return {
        docs: videos,
        totalDocs: response?.data?.total || 0,
        totalPages: response?.data?.totalPages || 0,
        page: response?.data?.page || 1,
      };
    },
    enabled,
  });
};

/**
 * Hook to retrieve paginated user watch history.
 */
export const useProfileWatchHistory = (page = 1, limit = 8, enabled = true) => {
  return useQuery({
    queryKey: ["profileWatchHistory", page, limit],
    queryFn: async () => {
      const response = await getWatchHistoryApi(page, limit);
      const sessions = response?.data?.sessions || [];
      const videos = sessions.map((item) => item.video).filter(Boolean);
      return {
        docs: videos,
        totalDocs: response?.data?.total || 0,
        totalPages: response?.data?.totalPages || 0,
        page: response?.data?.page || 1,
      };
    },
    enabled,
  });
};

/**
 * Hook to retrieve user continue watching list.
 */
export const useProfileContinueWatching = (limit = 8, enabled = true) => {
  return useQuery({
    queryKey: ["profileContinueWatching", limit],
    queryFn: async () => {
      const response = await getContinueWatchingApi(limit);
      const sessions = response?.data || [];
      const videos = sessions.map((item) => item.video).filter(Boolean);
      return videos;
    },
    enabled,
  });
};
