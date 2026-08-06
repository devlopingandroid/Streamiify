import { useQuery } from "@tanstack/react-query";
import {
  getAnalyticsDashboardApi,
  getAnalyticsViewsApi,
  getAnalyticsSubscribersApi,
  getAnalyticsWatchTimeApi,
  getAnalyticsTopVideosApi,
} from "../services/analytics.api";

// Standard query options as per specification
const DEFAULT_OPTIONS = {
  staleTime: 5 * 60 * 1000,      // 5 minutes
  gcTime: 10 * 60 * 1000,        // 10 minutes
  retry: 2,
  refetchOnReconnect: true,
  refetchOnWindowFocus: false,
};

/**
 * Hook to retrieve the dashboard summary cards metadata.
 * Called immediately on initial load.
 */
export const useAnalyticsDashboard = () => {
  return useQuery({
    queryKey: ["analytics", "dashboard"],
    queryFn: getAnalyticsDashboardApi,
    ...DEFAULT_OPTIONS,
  });
};

/**
 * Hook to fetch daily/weekly/monthly/yearly views.
 * Enabled only after the dashboard resolves.
 */
export const useAnalyticsViews = (period, enabled = false) => {
  return useQuery({
    queryKey: ["analytics", "views", period],
    queryFn: () => getAnalyticsViewsApi(period),
    ...DEFAULT_OPTIONS,
    enabled: enabled && !!period,
  });
};

/**
 * Hook to fetch subscriber growth rates.
 * Enabled only after the dashboard resolves.
 */
export const useAnalyticsSubscribers = (period, enabled = false) => {
  return useQuery({
    queryKey: ["analytics", "subscribers", period],
    queryFn: () => getAnalyticsSubscribersApi(period),
    ...DEFAULT_OPTIONS,
    enabled: enabled && !!period,
  });
};

/**
 * Hook to fetch watch time statistics.
 * Enabled only after the dashboard resolves.
 */
export const useAnalyticsWatchTime = (enabled = false) => {
  return useQuery({
    queryKey: ["analytics", "watch-time"],
    queryFn: getAnalyticsWatchTimeApi,
    ...DEFAULT_OPTIONS,
    enabled,
  });
};

/**
 * Hook to fetch top videos.
 * Enabled only after the dashboard resolves.
 */
export const useAnalyticsTopVideos = (enabled = false) => {
  return useQuery({
    queryKey: ["analytics", "top-videos"],
    queryFn: getAnalyticsTopVideosApi,
    ...DEFAULT_OPTIONS,
    enabled,
  });
};
