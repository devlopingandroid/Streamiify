import { useQuery, useMutation, useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import {
  getNotificationsApi,
  getUnreadNotificationsApi,
  getUnreadCountApi,
  markNotificationReadApi,
  markAllNotificationsReadApi,
  deleteNotificationApi,
  clearNotificationsApi,
} from "../services/notification.api";

/**
 * Hook to retrieve user notifications with infinite scrolling.
 */
export const useNotifications = (limit = 20) => {
  return useInfiniteQuery({
    queryKey: ["notifications"],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await getNotificationsApi(pageParam, limit);
      return response?.data;
    },
    getNextPageParam: (lastPage) => {
      const hasNextPage = lastPage?.page < lastPage?.totalPages;
      return hasNextPage ? lastPage.page + 1 : undefined;
    },
    initialPageParam: 1,
  });
};

/**
 * Hook to retrieve unread notifications.
 */
export const useUnreadNotifications = () => {
  return useQuery({
    queryKey: ["unreadNotifications"],
    queryFn: async () => {
      const response = await getUnreadNotificationsApi();
      return response?.data?.notifications || (Array.isArray(response?.data) ? response.data : []);
    },
  });
};

/**
 * Hook to get the count of unread notifications, polling every 60 seconds.
 */
export const useUnreadCount = () => {
  return useQuery({
    queryKey: ["unreadNotificationCount"],
    queryFn: async () => {
      const response = await getUnreadCountApi();
      return response?.data?.unreadCount ?? 0;
    },
    refetchInterval: 60000,
  });
};

/**
 * Hook to mark a single notification as read, utilizing optimistic updates.
 */
export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markNotificationReadApi,
    onMutate: async (notificationId) => {
      await queryClient.cancelQueries({ queryKey: ["notifications"] });
      await queryClient.cancelQueries({ queryKey: ["unreadNotifications"] });
      await queryClient.cancelQueries({ queryKey: ["unreadNotificationCount"] });

      const previousNotifications = queryClient.getQueryData(["notifications"]);
      const previousUnread = queryClient.getQueryData(["unreadNotifications"]);
      const previousCount = queryClient.getQueryData(["unreadNotificationCount"]);

      if (previousNotifications) {
        queryClient.setQueryData(["notifications"], {
          ...previousNotifications,
          pages: previousNotifications.pages.map((page) => ({
            ...page,
            notifications: (page.notifications || []).map((notif) =>
              notif._id === notificationId ? { ...notif, isRead: true } : notif
            ),
          })),
        });
      }

      if (previousUnread) {
        queryClient.setQueryData(
          ["unreadNotifications"],
          previousUnread.filter((notif) => notif._id !== notificationId)
        );
      }

      if (typeof previousCount === "number" && previousCount > 0) {
        queryClient.setQueryData(["unreadNotificationCount"], previousCount - 1);
      }

      return { previousNotifications, previousUnread, previousCount };
    },
    onError: (err, notificationId, context) => {
      if (context) {
        queryClient.setQueryData(["notifications"], context.previousNotifications);
        queryClient.setQueryData(["unreadNotifications"], context.previousUnread);
        queryClient.setQueryData(["unreadNotificationCount"], context.previousCount);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unreadNotifications"] });
      queryClient.invalidateQueries({ queryKey: ["unreadNotificationCount"] });
    },
  });
};

/**
 * Hook to mark all notifications as read, utilizing optimistic updates.
 */
export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAllNotificationsReadApi,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["notifications"] });
      await queryClient.cancelQueries({ queryKey: ["unreadNotifications"] });
      await queryClient.cancelQueries({ queryKey: ["unreadNotificationCount"] });

      const previousNotifications = queryClient.getQueryData(["notifications"]);
      const previousUnread = queryClient.getQueryData(["unreadNotifications"]);
      const previousCount = queryClient.getQueryData(["unreadNotificationCount"]);

      if (previousNotifications) {
        queryClient.setQueryData(["notifications"], {
          ...previousNotifications,
          pages: previousNotifications.pages.map((page) => ({
            ...page,
            notifications: (page.notifications || []).map((notif) => ({ ...notif, isRead: true })),
          })),
        });
      }

      queryClient.setQueryData(["unreadNotifications"], []);
      queryClient.setQueryData(["unreadNotificationCount"], 0);

      return { previousNotifications, previousUnread, previousCount };
    },
    onError: (err, variables, context) => {
      if (context) {
        queryClient.setQueryData(["notifications"], context.previousNotifications);
        queryClient.setQueryData(["unreadNotifications"], context.previousUnread);
        queryClient.setQueryData(["unreadNotificationCount"], context.previousCount);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unreadNotifications"] });
      queryClient.invalidateQueries({ queryKey: ["unreadNotificationCount"] });
    },
  });
};

/**
 * Hook to delete a single notification, utilizing optimistic updates.
 */
export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteNotificationApi,
    onMutate: async (notificationId) => {
      await queryClient.cancelQueries({ queryKey: ["notifications"] });
      await queryClient.cancelQueries({ queryKey: ["unreadNotifications"] });
      await queryClient.cancelQueries({ queryKey: ["unreadNotificationCount"] });

      const previousNotifications = queryClient.getQueryData(["notifications"]);
      const previousUnread = queryClient.getQueryData(["unreadNotifications"]);
      const previousCount = queryClient.getQueryData(["unreadNotificationCount"]);

      if (previousNotifications) {
        queryClient.setQueryData(["notifications"], {
          ...previousNotifications,
          pages: previousNotifications.pages.map((page) => ({
            ...page,
            notifications: (page.notifications || []).filter((notif) => notif._id !== notificationId),
          })),
        });
      }

      if (previousUnread) {
        queryClient.setQueryData(
          ["unreadNotifications"],
          previousUnread.filter((notif) => notif._id !== notificationId)
        );
      }

      const wasUnread = previousUnread?.some((notif) => notif._id === notificationId) || 
        previousNotifications?.pages.some((page) => 
          (page.notifications || []).some((notif) => notif._id === notificationId && !notif.isRead)
        );

      if (wasUnread && typeof previousCount === "number" && previousCount > 0) {
        queryClient.setQueryData(["unreadNotificationCount"], previousCount - 1);
      }

      return { previousNotifications, previousUnread, previousCount };
    },
    onError: (err, notificationId, context) => {
      if (context) {
        queryClient.setQueryData(["notifications"], context.previousNotifications);
        queryClient.setQueryData(["unreadNotifications"], context.previousUnread);
        queryClient.setQueryData(["unreadNotificationCount"], context.previousCount);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unreadNotifications"] });
      queryClient.invalidateQueries({ queryKey: ["unreadNotificationCount"] });
    },
  });
};

/**
 * Hook to clear all notifications.
 */
export const useClearNotifications = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: clearNotificationsApi,
    onSuccess: () => {
      queryClient.setQueryData(["notifications"], { pages: [], pageParams: [] });
      queryClient.setQueryData(["unreadNotifications"], []);
      queryClient.setQueryData(["unreadNotificationCount"], 0);
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unreadNotifications"] });
      queryClient.invalidateQueries({ queryKey: ["unreadNotificationCount"] });
    },
  });
};
