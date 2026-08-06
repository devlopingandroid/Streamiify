import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery
} from "@tanstack/react-query"; import { getSearchResultsApi } from "../services/search.api";
import {
  getWatchHistoryApi,
  clearWatchHistoryApi,
  deleteHistoryItemApi,
  recordWatchProgressApi,
  getResumePositionApi,
  getContinueWatchingApi
} from "../services/history.api";
import {
  getPlaylistsApi,
  createPlaylistApi,
  deletePlaylistApi,
  getMyPlaylistsApi,
  getPlaylistByIdApi,
  getUserPlaylistsApi,
  updatePlaylistApi,
  updatePlaylistVisibilityApi,
  addVideoToPlaylistApi,
  removeVideoFromPlaylistApi
} from "../services/playlist.api";
import {
  toggleSubscriptionApi,
  getSubscriptionStatusApi,
  getSubscribedChannelsApi,
  getSubscriptionsFeedApi,
  getChannelSubscribersApi
} from "../services/subscription.api";
import { getLikedVideosApi, toggleLikeVideoApi } from "../services/likes.api";
import { getWatchLaterApi, toggleWatchLaterApi } from "../services/watchLater.api";
import { toast } from "react-hot-toast";

const MOCK_PLAYLISTS = [
  {
    _id: "playlist-1",
    name: "Distributed Systems Course",
    videosCount: 2,
    createdAt: new Date().toISOString(),
  },
  {
    _id: "playlist-2",
    name: "React 19 Dashboard Masterclass",
    videosCount: 1,
    createdAt: new Date().toISOString(),
  },
];

export const useSearch = (query = "") => {
  return useQuery({
    queryKey: ["search", query],
    queryFn: async () => {
      console.log(`[Search Hook Debug] Sending API request for query: "${query}"`);
      const res = await getSearchResultsApi(query);
      console.log("[Search Hook Debug] API response received:", res);
      const data = res?.data;
      let videos = [];
      if (Array.isArray(data)) {
        videos = data;
      } else if (Array.isArray(data?.docs)) {
        videos = data.docs;
      } else if (Array.isArray(res?.docs)) {
        videos = res.docs;
      }
      console.log("[Search Hook Debug] Parsed videos array:", videos);
      return videos;
    },
    enabled: query !== undefined,
  });
};

/**
 * Hook to execute history retrieval and clearance.
 */
export const useHistory = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["history"],
    queryFn: async () => {
      try {
        const res = await getWatchHistoryApi(1, 20);
        const sessions = res?.data?.sessions || [];
        return sessions
          .filter((s) => s && s.video)
          .map((s) => ({
            ...s.video,
            watchSessionId: s._id,
            progress: s.progress,
            duration: s.duration,
            completed: s.completed,
            lastWatchedAt: s.lastWatchedAt
          }));
      } catch {
        return [];
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteHistoryItemApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["history"] });
      queryClient.invalidateQueries({ queryKey: ["continueWatching"] });
    },
  });

  const clearMutation = useMutation({
    mutationFn: clearWatchHistoryApi,
    onSuccess: () => {
      queryClient.setQueryData(["history"], []);
      queryClient.invalidateQueries({ queryKey: ["history"] });
      queryClient.invalidateQueries({ queryKey: ["continueWatching"] });
    },
  });

  return { 
    ...query, 
    deleteHistoryItem: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
    clearHistory: clearMutation.mutate, 
    isClearing: clearMutation.isPending 
  };
};

export const useContinueWatching = (limit = 10) => {
  return useQuery({
    queryKey: ["continueWatching", limit],
    queryFn: async () => {
      try {
        const res = await getContinueWatchingApi(limit);
        const sessions = res?.data || [];
        return sessions
          .filter((s) => s && s.video)
          .map((s) => ({
            ...s.video,
            progress: s.progress,
            duration: s.duration,
            completed: s.completed,
            lastWatchedAt: s.lastWatchedAt
          }));
      } catch {
        return [];
      }
    },
  });
};

export const useResumePosition = (videoId) => {
  return useQuery({
    queryKey: ["resumePosition", videoId],
    queryFn: async () => {
      if (!videoId) return { progress: 0, duration: 0 };
      try {
        const res = await getResumePositionApi(videoId);
        return res?.data || { progress: 0, duration: 0 };
      } catch {
        return { progress: 0, duration: 0 };
      }
    },
    enabled: !!videoId,
    staleTime: 0,
  });
};

export const useRecordWatchSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ videoId, progress, duration }) => {
      return recordWatchProgressApi(videoId, progress, duration);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["history"] });
      queryClient.invalidateQueries({ queryKey: ["continueWatching"] });
      queryClient.invalidateQueries({ queryKey: ["resumePosition", variables.videoId] });
    },
  });
};

/**
 * Hook to retrieve and toggle Watch Later lists.
 */
export const useWatchLater = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["watchLater"],
    queryFn: async () => {
      try {
        const res = await getWatchLaterApi();
        const items = Array.isArray(res?.data) 
          ? res.data 
          : (res?.data?.data || []);
        return items
          .filter((item) => item && item.video)
          .map((item) => ({
            ...item.video,
            watchLaterId: item._id,
          }));
      } catch {
        return [];
      }
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async (variables) => {
      const videoId = typeof variables === "string" ? variables : variables.videoId;
      return toggleWatchLaterApi(videoId);
    },
    onMutate: async (variables) => {
      const videoId = typeof variables === "string" ? variables : variables.videoId;
      const video = typeof variables === "string" ? null : variables.video;

      await queryClient.cancelQueries({ queryKey: ["watchLater"] });
      const previousWatchLater = queryClient.getQueryData(["watchLater"]);

      queryClient.setQueryData(["watchLater"], (old) => {
        const currentList = Array.isArray(old) ? old : [];
        const exists = currentList.some((v) => (v._id || v) === videoId);

        if (exists) {
          return currentList.filter((v) => (v._id || v) !== videoId);
        } else {
          const newItem = video || { _id: videoId };
          return [newItem, ...currentList];
        }
      });

      return { previousWatchLater };
    },
    onError: (err, variables, context) => {
      if (context?.previousWatchLater) {
        queryClient.setQueryData(["watchLater"], context.previousWatchLater);
      }
      toast.error(err?.message || "Failed to update Watch Later.");
    },
    onSuccess: (data, variables, context) => {
      const videoId = typeof variables === "string" ? variables : variables.videoId;
      const wasAdded = !context?.previousWatchLater?.some((v) => (v._id || v) === videoId);
      toast.success(wasAdded ? "Added to Watch Later." : "Removed from Watch Later.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["watchLater"] });
    },
  });

  return { 
    ...query, 
    toggleWatchLater: toggleMutation.mutate, 
    isToggling: toggleMutation.isPending,
    togglingVideoId: toggleMutation.isPending ? (
      typeof toggleMutation.variables === "string" 
        ? toggleMutation.variables 
        : toggleMutation.variables?.videoId
    ) : null
  };
};

/**
 * Hook to retrieve and toggle Liked videos.
 */
export const useLikedVideos = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["likedVideos"],
    queryFn: async () => {
      try {
        const res = await getLikedVideosApi();
        return res?.data || [];
      } catch {
        return [];
      }
    },
  });

  const toggleLikeMutation = useMutation({
    mutationFn: toggleLikeVideoApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["likedVideos"] });
    },
  });

  return { ...query, toggleLike: toggleLikeMutation.mutate };
};

/**
 * Hook to retrieve creators subscriptions.
 */
export const useSubscriptions = () => {
  return useQuery({
    queryKey: ["subscriptions"],
    queryFn: async () => {
      try {
        const res = await getSubscribedChannelsApi();
        return res?.data || [];
      } catch {
        return [];
      }
    },
  });
};

/**
 * Hook to manage playlists.
 */
export const usePlaylists = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["playlists"],
    queryFn: async () => {
      try {
        const res = await getPlaylistsApi();
        return res?.data || [];
      } catch {
        return MOCK_PLAYLISTS;
      }
    },
  });

  const createMutation = useMutation({
    mutationFn: createPlaylistApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playlists"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deletePlaylistApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playlists"] });
    },
  });

  return {
    ...query,
    createPlaylist: createMutation.mutate,
    isCreating: createMutation.isPending,
    deletePlaylist: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
};

/**
 * Hook to retrieve and toggle channel subscription state with optimistic updates.
 */
export const useSubscription = (channelId) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["subscriptionStatus", channelId],
    queryFn: async () => {
      if (!channelId) return { subscribed: false, subscribersCount: 0 };
      const res = await getSubscriptionStatusApi(channelId);
      return {
        subscribed: res?.data?.isSubscribed ?? false,
        subscribersCount: res?.data?.subscriberCount ?? 0,
      };
    },
    enabled: !!channelId,
  });

  const toggleMutation = useMutation({
    mutationFn: async () => {
      if (!channelId) throw new Error("Channel ID is required");
      return toggleSubscriptionApi(channelId);
    },
    onMutate: async () => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ["subscriptionStatus", channelId] });

      // Snapshot the previous value
      const previousStatus = queryClient.getQueryData(["subscriptionStatus", channelId]);

      // Optimistically update to the new value
      queryClient.setQueryData(["subscriptionStatus", channelId], (old) => {
        if (!old) return { subscribed: true, subscribersCount: 1 };
        const newSubscribed = !old.subscribed;
        return {
          subscribed: newSubscribed,
          subscribersCount: Math.max(0, old.subscribersCount + (newSubscribed ? 1 : -1)),
        };
      });

      // Return a context object with the snapshotted value
      return { previousStatus };
    },
    onError: (err, newTodo, context) => {
      // Rollback to snapshotted state
      if (context?.previousStatus) {
        queryClient.setQueryData(["subscriptionStatus", channelId], context.previousStatus);
      }
      toast.error(err?.message || "Failed to update subscription status.");
    },
    onSettled: () => {
      // Invalidate queries to sync with backend
      queryClient.invalidateQueries({ queryKey: ["subscriptionStatus", channelId] });
      // Invalidate channel profile queries as well if the ChannelPage is viewing it
      queryClient.invalidateQueries({ queryKey: ["channel"] });
    },
  });

  return {
    subscribed: query.data?.subscribed ?? false,
    subscribersCount: query.data?.subscribersCount ?? 0,
    isLoading: query.isLoading,
    isError: query.isError,
    toggleSubscription: toggleMutation.mutate,
    isToggling: toggleMutation.isPending,
  };
};

/**
 * Hook to retrieve the subscriptions video feed with infinite scrolling.
 */
export const useInfiniteSubscriptionsFeed = (limit = 10) => {
  return useInfiniteQuery({
    queryKey: ["subscriptionsFeed"],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await getSubscriptionsFeedApi(pageParam, limit);
      return response?.data;
    },
    getNextPageParam: (lastPage) => {
      return lastPage?.hasNextPage ? lastPage.page + 1 : undefined;
    },
    initialPageParam: 1,
  });
};

/**
 * Hook to retrieve the list of subscribers for a channel.
 */
export const useChannelSubscribers = (channelId) => {
  return useQuery({
    queryKey: ["channelSubscribers", channelId],
    queryFn: async () => {
      if (!channelId) return [];
      const response = await getChannelSubscribersApi(channelId);
      console.log("Raw subscribers API response:", response);
      return Array.isArray(response?.data)
        ? response.data
        : (response?.data?.data || []);
    },
    enabled: !!channelId,
  });
};

/**
 * Hook to retrieve playlists owned by the current authenticated user.
 */
export const useMyPlaylists = () => {
  return useQuery({
    queryKey: ["myPlaylists"],
    queryFn: async () => {
      const response = await getMyPlaylistsApi();
      return Array.isArray(response?.data)
        ? response.data
        : (response?.data?.data || []);
    },
  });
};

/**
 * Hook to retrieve a single playlist by ID.
 */
export const usePlaylist = (playlistId) => {
  return useQuery({
    queryKey: ["playlist", playlistId],
    queryFn: async () => {
      if (!playlistId) throw new Error("Playlist ID is required");
      const response = await getPlaylistByIdApi(playlistId);
      return response?.data || null;
    },
    enabled: !!playlistId,
  });
};

/**
 * Hook to retrieve playlists for a specific user ID.
 */
export const useUserPlaylists = (userId) => {
  return useQuery({
    queryKey: ["userPlaylists", userId],
    queryFn: async () => {
      if (!userId) return [];
      const response = await getUserPlaylistsApi(userId);
      return Array.isArray(response?.data)
        ? response.data
        : (response?.data?.data || []);
    },
    enabled: !!userId,
  });
};

/**
 * Hook to create a new playlist.
 */
export const useCreatePlaylist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPlaylistApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myPlaylists"] });
      queryClient.invalidateQueries({ queryKey: ["playlists"] });
    },
  });
};

/**
 * Hook to update a playlist name and description.
 */
export const useUpdatePlaylist = (playlistId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body) => {
      return updatePlaylistApi(playlistId, body);
    },
    onMutate: async (newValues) => {
      await queryClient.cancelQueries({ queryKey: ["playlist", playlistId] });
      const previousPlaylist = queryClient.getQueryData(["playlist", playlistId]);

      // Optimistically update
      if (previousPlaylist) {
        queryClient.setQueryData(["playlist", playlistId], {
          ...previousPlaylist,
          ...newValues,
        });
      }

      // Also optimistically update inside myPlaylists
      const previousMyPlaylists = queryClient.getQueryData(["myPlaylists"]);
      if (previousMyPlaylists) {
        queryClient.setQueryData(["myPlaylists"], (old) => {
          return old?.map((pl) =>
            pl._id === playlistId ? { ...pl, ...newValues } : pl
          );
        });
      }

      return { previousPlaylist, previousMyPlaylists };
    },
    onError: (err, newValues, context) => {
      if (context?.previousPlaylist) {
        queryClient.setQueryData(["playlist", playlistId], context.previousPlaylist);
      }
      if (context?.previousMyPlaylists) {
        queryClient.setQueryData(["myPlaylists"], context.previousMyPlaylists);
      }
      toast.error(err?.message || "Failed to update playlist.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["playlist", playlistId] });
      queryClient.invalidateQueries({ queryKey: ["myPlaylists"] });
      queryClient.invalidateQueries({ queryKey: ["playlists"] });
    },
  });
};

/**
 * Hook to update playlist visibility.
 */
export const useUpdatePlaylistVisibility = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ playlistId, visibility }) => {
      return updatePlaylistVisibilityApi(playlistId, visibility);
    },
    onMutate: async ({ playlistId, visibility }) => {
      await queryClient.cancelQueries({ queryKey: ["playlist", playlistId] });
      const previousPlaylist = queryClient.getQueryData(["playlist", playlistId]);

      // Optimistically update visibility
      if (previousPlaylist) {
        queryClient.setQueryData(["playlist", playlistId], {
          ...previousPlaylist,
          visibility,
        });
      }

      // Also optimistically update inside myPlaylists
      const previousMyPlaylists = queryClient.getQueryData(["myPlaylists"]);
      if (previousMyPlaylists) {
        queryClient.setQueryData(["myPlaylists"], (old) => {
          return old?.map((pl) =>
            pl._id === playlistId ? { ...pl, visibility } : pl
          );
        });
      }

      return { previousPlaylist, previousMyPlaylists, playlistId };
    },
    onError: (err, variables, context) => {
      const pid = context?.playlistId;
      if (pid && context?.previousPlaylist) {
        queryClient.setQueryData(["playlist", pid], context.previousPlaylist);
      }
      if (context?.previousMyPlaylists) {
        queryClient.setQueryData(["myPlaylists"], context.previousMyPlaylists);
      }
      toast.error(err?.message || "Failed to update visibility.");
    },
    onSettled: (data, error, variables) => {
      const pid = variables?.playlistId;
      if (pid) {
        queryClient.invalidateQueries({ queryKey: ["playlist", pid] });
      }
      queryClient.invalidateQueries({ queryKey: ["myPlaylists"] });
      queryClient.invalidateQueries({ queryKey: ["playlists"] });
    },
  });
};

/**
 * Hook to delete a playlist by ID.
 */
export const useDeletePlaylist = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deletePlaylistApi,
    onSuccess: (data, playlistId) => {
      queryClient.invalidateQueries({ queryKey: ["myPlaylists"] });
      queryClient.invalidateQueries({ queryKey: ["playlists"] });
      queryClient.removeQueries({ queryKey: ["playlist", playlistId] });
      toast.success("Playlist deleted successfully.");
    },
    onError: (err) => {
      toast.error(err?.message || "Failed to delete playlist.");
    },
  });
};

/**
 * Hook to add a video to a playlist.
 */
export const useAddVideoToPlaylist = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ playlistId, videoId }) => {
      return addVideoToPlaylistApi(playlistId, videoId);
    },
    onMutate: async ({ playlistId, videoId }) => {
      await queryClient.cancelQueries({ queryKey: ["myPlaylists"] });
      await queryClient.cancelQueries({ queryKey: ["playlist", playlistId] });

      const previousMyPlaylists = queryClient.getQueryData(["myPlaylists"]);
      const previousPlaylist = queryClient.getQueryData(["playlist", playlistId]);

      // Optimistically update the checklist inside "myPlaylists" cache
      if (previousMyPlaylists) {
        queryClient.setQueryData(["myPlaylists"], (old) => {
          return old?.map((pl) => {
            if (pl._id === playlistId) {
              const alreadyExists = pl.videos?.some((v) => (typeof v === "string" ? v : v?._id) === videoId);
              if (alreadyExists) return pl;
              return {
                ...pl,
                videosCount: (pl.videosCount || 0) + 1,
                videos: [...(pl.videos || []), videoId],
              };
            }
            return pl;
          });
        });
      }

      // Optimistically update the playlist details view
      if (previousPlaylist) {
        queryClient.setQueryData(["playlist", playlistId], {
          ...previousPlaylist,
          videosCount: (previousPlaylist.videosCount || 0) + 1,
          videos: [...(previousPlaylist.videos || []), { _id: videoId }],
        });
      }

      return { previousMyPlaylists, previousPlaylist, playlistId };
    },
    onError: (err, variables, context) => {
      if (context?.previousMyPlaylists) {
        queryClient.setQueryData(["myPlaylists"], context.previousMyPlaylists);
      }
      const pid = context?.playlistId;
      if (pid && context?.previousPlaylist) {
        queryClient.setQueryData(["playlist", pid], context.previousPlaylist);
      }
      toast.error(err?.message || "Failed to add video to playlist.");
    },
    onSettled: (data, error, variables) => {
      const pid = variables?.playlistId;
      queryClient.invalidateQueries({ queryKey: ["myPlaylists"] });
      if (pid) {
        queryClient.invalidateQueries({ queryKey: ["playlist", pid] });
      }
    },
  });
};

/**
 * Hook to remove a video from a playlist.
 */
export const useRemoveVideoFromPlaylist = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ playlistId, videoId }) => {
      return removeVideoFromPlaylistApi(playlistId, videoId);
    },
    onMutate: async ({ playlistId, videoId }) => {
      await queryClient.cancelQueries({ queryKey: ["myPlaylists"] });
      await queryClient.cancelQueries({ queryKey: ["playlist", playlistId] });

      const previousMyPlaylists = queryClient.getQueryData(["myPlaylists"]);
      const previousPlaylist = queryClient.getQueryData(["playlist", playlistId]);

      // Optimistically update the checklist inside "myPlaylists" cache
      if (previousMyPlaylists) {
        queryClient.setQueryData(["myPlaylists"], (old) => {
          return old?.map((pl) => {
            if (pl._id === playlistId) {
              return {
                ...pl,
                videosCount: Math.max(0, (pl.videosCount || 0) - 1),
                videos: pl.videos?.filter((v) => (typeof v === "string" ? v : v?._id) !== videoId) || [],
              };
            }
            return pl;
          });
        });
      }

      // Optimistically update the playlist details view
      if (previousPlaylist) {
        queryClient.setQueryData(["playlist", playlistId], {
          ...previousPlaylist,
          videosCount: Math.max(0, (previousPlaylist.videosCount || 0) - 1),
          videos: previousPlaylist.videos?.filter((v) => (typeof v === "string" ? v : v?._id) !== videoId) || [],
        });
      }

      return { previousMyPlaylists, previousPlaylist, playlistId };
    },
    onError: (err, variables, context) => {
      if (context?.previousMyPlaylists) {
        queryClient.setQueryData(["myPlaylists"], context.previousMyPlaylists);
      }
      const pid = context?.playlistId;
      if (pid && context?.previousPlaylist) {
        queryClient.setQueryData(["playlist", pid], context.previousPlaylist);
      }
      toast.error(err?.message || "Failed to remove video from playlist.");
    },
    onSettled: (data, error, variables) => {
      const pid = variables?.playlistId;
      queryClient.invalidateQueries({ queryKey: ["myPlaylists"] });
      if (pid) {
        queryClient.invalidateQueries({ queryKey: ["playlist", pid] });
      }
    },
  });
};


