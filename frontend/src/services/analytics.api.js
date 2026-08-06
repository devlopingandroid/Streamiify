import { apiClient } from "./apiClient";

// Helper function to format duration in seconds to "MM:SS"
const formatDuration = (sec) => {
  const minutes = Math.floor(sec / 60);
  const seconds = sec % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};

/**
 * Fetch initial creator analytics dashboard stats.
 * Normalize to root-level key structures expected by AnalyticsCards.
 * Endpoint: GET /analytics/dashboard
 */
export const getAnalyticsDashboardApi = async () => {
  const response = await apiClient.get("/analytics/dashboard");
  const rawData = response.data?.data || response.data;
  const overview = rawData?.overview || {};

  const normalizedPayload = {
    ...rawData,
    views: { value: overview.totalViews || 0, trend: 0 },
    likes: { value: overview.totalLikes || 0, trend: 0 },
    subscribers: { value: overview.totalSubscribers || 0, trend: 0 },
    comments: { value: overview.totalComments || 0, trend: 0 },
    watchTime: { value: overview.totalWatchTime || 0, trend: 0 },
    averageWatchDuration: { value: formatDuration(overview.averageWatchDuration || 0), trend: 0 },
    completionRate: { value: `${overview.completionRate || 0}%`, trend: 0 },
    engagementRate: { value: `${overview.engagementRate || 0}%`, trend: 0 }
  };

  return {
    ...response.data,
    data: normalizedPayload
  };
};

/**
 * Fetch views analytics by period.
 * Endpoint: GET /analytics/views?period=daily|weekly|monthly|yearly
 */
export const getAnalyticsViewsApi = async (period) => {
  const response = await apiClient.get("/analytics/views", {
    params: { period },
  });
  return response.data;
};

/**
 * Fetch subscriber growth analytics by period.
 * Normalize to return the growth array directly.
 * Endpoint: GET /analytics/subscribers?period=daily|weekly|monthly|yearly
 */
export const getAnalyticsSubscribersApi = async (period) => {
  const response = await apiClient.get("/analytics/subscribers", {
    params: { period },
  });
  const rawData = response.data?.data || response.data;
  const growthData = Array.isArray(rawData) ? rawData : (rawData?.growth || []);

  return {
    ...response.data,
    data: growthData
  };
};

/**
 * Fetch watch time retention statistics.
 * Normalize average duration and add empty chartData fallback.
 * Endpoint: GET /analytics/watch-time
 */
export const getAnalyticsWatchTimeApi = async () => {
  const response = await apiClient.get("/analytics/watch-time");
  const rawData = response.data?.data || response.data || {};

  const normalizedPayload = {
    ...rawData,
    averageDuration: formatDuration(rawData.averageWatchDuration || 0),
    chartData: rawData.chartData || rawData.chart_data || []
  };

  return {
    ...response.data,
    data: normalizedPayload
  };
};

/**
 * Fetch top performing videos list.
 * Map likesCount, commentsCount, and totalWatchTime to likes, comments, and watchTime.
 * Endpoint: GET /analytics/top-videos
 */
export const getAnalyticsTopVideosApi = async () => {
  const response = await apiClient.get("/analytics/top-videos");
  const rawData = response.data?.data || response.data || [];
  
  const videoList = Array.isArray(rawData) ? rawData : [];
  const normalizedVideos = videoList.map((video) => ({
    ...video,
    likes: video.likesCount !== undefined ? video.likesCount : 0,
    comments: video.commentsCount !== undefined ? video.commentsCount : 0,
    watchTime: video.totalWatchTime !== undefined ? video.totalWatchTime : 0,
    engagementRate: video.engagementRate !== undefined ? video.engagementRate : 0
  }));

  return {
    ...response.data,
    data: normalizedVideos
  };
};
