import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import {
  getHomeFeedApi,
  getTrendingApi,
  getSimilarVideosApi,
  getSubscriptionFeedApi,
} from "../services/recommendation.api";

/**
 * Hook to retrieve the personalized home recommendations feed with infinite scrolling.
 * @param {number} [limit=10] - The number of items to fetch per page.
 * @returns {Object} The React Query infinite query result bundle.
 */
export const useHomeRecommendations = (limit = 10) => {
  const query = useInfiniteQuery({
    queryKey: ["recommendations", "home", limit],
    queryFn: async ({ pageParam = 1 }) => {
      return await getHomeFeedApi({
        page: pageParam,
        limit,
      });
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage?.pagination) return undefined;

      return lastPage.pagination.hasNextPage
        ? lastPage.pagination.page + 1
        : undefined;
    },
    initialPageParam: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes, consistent with useVideos.js
  });

  return {
    ...query,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    fetchNextPage: query.fetchNextPage,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
  };
};

/**
 * Hook to retrieve the trending recommendations feed with infinite scrolling.
 * @param {number} [limit=10] - The number of items to fetch per page.
 * @returns {Object} The React Query infinite query result bundle.
 */
export const useTrending = (limit = 10) => {
  return useInfiniteQuery({
    queryKey: ["recommendations", "trending", limit],

    queryFn: ({ pageParam = 1 }) =>
      getTrendingApi({
        page: pageParam,
        limit,
      }),

    initialPageParam: 1,

    getNextPageParam: (lastPage) => {
      if (!lastPage?.pagination) return undefined;

      return lastPage.pagination.hasNextPage
        ? lastPage.pagination.page + 1
        : undefined;
    },
  });
};
/**
 * Hook to retrieve similar videos for a given video ID.
 * @param {string|number} videoId - The source video ID.
 * @param {number} [limit=10] - The number of items to fetch.
 * @returns {Object} The React Query query result bundle.
 */
export const useSimilarVideos = (videoId, limit = 10) => {
  const query = useQuery({
    queryKey: ["recommendations", "similar", videoId, limit],
    queryFn: async () => {
      return await getSimilarVideosApi(videoId, {
        page: 1,
        limit,
      });
    },
    enabled: !!videoId,
    staleTime: 1000 * 60 * 5, // 5 minutes, consistent with useVideos.js
  });

  return {
    ...query,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    fetchNextPage: undefined,
    hasNextPage: false,
    isFetchingNextPage: false,
  };
};

/**
 * Hook to retrieve recommendations for user's subscriptions with infinite scrolling.
 * @param {number} [limit=10] - The number of items to fetch per page.
 * @returns {Object} The React Query infinite query result bundle.
 */
export const useSubscriptionFeed = (limit = 10) => {
  return useInfiniteQuery({
    queryKey: ["recommendations", "subscriptions", limit],

    queryFn: ({ pageParam = 1 }) =>
      getSubscriptionFeedApi({
        page: pageParam,
        limit,
      }),

    initialPageParam: 1,

    getNextPageParam: (lastPage) => {
      if (!lastPage?.pagination) return undefined;

      return lastPage.pagination.hasNextPage
        ? lastPage.pagination.page + 1
        : undefined;
    },

    staleTime: 1000 * 60 * 5,
  });
};

