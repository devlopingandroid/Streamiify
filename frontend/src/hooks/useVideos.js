import { useQuery } from "@tanstack/react-query";
import { getVideosApi, getTrendingVideosApi, getVideoByIdApi } from "../services/video.api";

/**
 * Hook to retrieve and cache catalog videos.
 */
export const useVideos = (query = "") => {
  return useQuery({
    queryKey: ["videos", query],
    queryFn: async () => {
      const response = await getVideosApi(query);
      return response?.data?.docs || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes cache stale
  });
};

/**
 * Hook to retrieve trending videos.
 */
export const useTrendingVideos = () => {
  return useQuery({
    queryKey: ["videos", "trending"],
    queryFn: async () => {
      const response = await getTrendingVideosApi();
      return response?.data?.docs || [];
    },
    staleTime: 1000 * 60 * 5,
  });
};

/**
 * Hook to retrieve details for a single video by ID.
 */
export const useVideo = (id) => {
  return useQuery({
    queryKey: ["video", id],
    queryFn: async () => {
      if (!id) throw new Error("Video ID is required");
      const response = await getVideoByIdApi(id);
      return response?.data || null;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 10, // 10 minutes cache single item
  });
};
export default useVideos;
