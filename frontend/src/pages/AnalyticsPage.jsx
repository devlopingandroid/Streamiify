import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

import {
  useAnalyticsDashboard,
  useAnalyticsViews,
  useAnalyticsSubscribers,
  useAnalyticsWatchTime,
  useAnalyticsTopVideos,
} from "../hooks/useAnalytics";

// Sub-components
import { AnalyticsHeader } from "../components/analytics/AnalyticsHeader";
import { AnalyticsCards } from "../components/analytics/AnalyticsCards";
import { ViewsChart } from "../components/analytics/ViewsChart";
import { SubscriberChart } from "../components/analytics/SubscriberChart";
import { WatchTimeCard } from "../components/analytics/WatchTimeCard";
import { TopVideosTable } from "../components/analytics/TopVideosTable";
import { AnalyticsSkeleton } from "../components/analytics/AnalyticsSkeleton";
import { AnalyticsError } from "../components/analytics/AnalyticsError";
import { AnalyticsEmpty } from "../components/analytics/AnalyticsEmpty";

export const AnalyticsPage = () => {
  const queryClient = useQueryClient();
  const [period, setPeriod] = useState("weekly");
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const dashboardQuery = useAnalyticsDashboard();
  const isDashboardLoaded = dashboardQuery.isSuccess;

  useEffect(() => {
    if (isDashboardLoaded) {
      setLastUpdated(new Date());
    }
  }, [isDashboardLoaded]);

  const viewsQuery = useAnalyticsViews(period, isDashboardLoaded);
  const subscribersQuery = useAnalyticsSubscribers(period, isDashboardLoaded);
  const watchTimeQuery = useAnalyticsWatchTime(isDashboardLoaded);
  const topVideosQuery = useAnalyticsTopVideos(isDashboardLoaded);

  const handleRefresh = useCallback(async () => {
    toast.loading("Refetching channel analytics...", { id: "refresh-toast" });
    try {
      await queryClient.invalidateQueries({ queryKey: ["analytics"] });
      setLastUpdated(new Date());
      toast.success("Analytics updated successfully.", { id: "refresh-toast" });
    } catch (err) {
      toast.error("Failed to refresh analytics.", { id: "refresh-toast" });
    }
  }, [queryClient]);

  const handleExportCSV = useCallback(() => {
    const dashboardData = dashboardQuery.data?.data || dashboardQuery.data;
    const topVideosData = topVideosQuery.data?.data || topVideosQuery.data || [];

    if (!dashboardData) {
      toast.error("No metrics available to export.");
      return;
    }

    try {
      const rows = [];
      
      rows.push(["STREAMIFY CREATOR REPORT"]);
      rows.push(["Generated on", new Date().toLocaleString()]);
      rows.push(["Selected Filter Period", period]);
      rows.push([]);

      rows.push(["1. CHANNEL SUMMARY METRICS"]);
      rows.push(["Metric Label", "Value", "Trend vs Previous Period"]);

      const getVal = (key) => dashboardData[key]?.value !== undefined ? dashboardData[key].value : (dashboardData[key] || "0");
      const getTrend = (key) => {
        const trendVal = dashboardData[key]?.trend !== undefined ? dashboardData[key].trend : 0;
        return `${trendVal > 0 ? "+" : ""}${trendVal}%`;
      };

      rows.push(["Total Views", getVal("views"), getTrend("views")]);
      rows.push(["Total Watch Time (Hours)", getVal("watchTime"), getTrend("watchTime")]);
      rows.push(["Total Subscribers Gained", getVal("subscribers"), getTrend("subscribers")]);
      rows.push(["Total Likes Recieved", getVal("likes"), getTrend("likes")]);
      rows.push(["Total Comments Recieved", getVal("comments"), getTrend("comments")]);
      rows.push(["Average Watch Duration", getVal("averageWatchDuration"), getTrend("averageWatchDuration")]);
      rows.push(["Average Completion Rate", getVal("completionRate"), getTrend("completionRate")]);
      rows.push(["Engagement Ratio", getVal("engagementRate"), getTrend("engagementRate")]);
      rows.push([]);

      rows.push(["2. TOP PERFORMING STREAMS"]);
      rows.push(["Video Title", "Views", "Likes", "Comments", "Watch Time (Hours)", "Engagement Rate"]);

      topVideosData.forEach((video) => {
        const title = (video.title || "Untitled stream").replace(/"/g, '""');
        const views = video.views !== undefined ? video.views : 0;
        const likes = video.likes !== undefined ? video.likes : 0;
        const comments = video.comments !== undefined ? video.comments : 0;
        const wTime = video.watchTime !== undefined ? video.watchTime : (video.watch_time || 0);
        const eng = video.engagementRate !== undefined ? video.engagementRate : (video.engagement_rate || "0%");

        rows.push([
          `"${title}"`,
          views,
          likes,
          comments,
          wTime,
          `"${eng}"`
        ]);
      });

      const csvContent = rows.map((r) => r.join(",")).join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `streamify_creator_analytics_${new Date().toISOString().slice(0, 10)}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("CSV report downloaded successfully.");
    } catch (error) {
      toast.error("An error occurred during CSV creation.");
    }
  }, [dashboardQuery.data, topVideosQuery.data, period]);

  const isDashboardLoading = dashboardQuery.isLoading;
  const isDashboardError = dashboardQuery.isError;
  const dashboardData = dashboardQuery.data?.data || dashboardQuery.data;

  if (isDashboardLoading) {
    return (
      <main className="p-6 md:p-8" aria-label="Loading analytics dashboard">
        <AnalyticsSkeleton />
      </main>
    );
  }

  if (isDashboardError) {
    return (
      <main className="p-6 md:p-8" aria-label="Analytics error state">
        <AnalyticsError
          onRetry={() => dashboardQuery.refetch()}
          errorInfo={dashboardQuery.error}
        />
      </main>
    );
  }

  if (!dashboardData || Object.keys(dashboardData).length === 0) {
    return (
      <main className="p-6 md:p-8" aria-label="Analytics empty state">
        <AnalyticsEmpty />
      </main>
    );
  }

  return (
    <main className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto flex flex-col gap-8 animate-fade-in" aria-label="Creator Analytics Dashboard">
      {/* Page Header Area */}
      <AnalyticsHeader
        period={period}
        onPeriodChange={setPeriod}
        onRefresh={handleRefresh}
        onExportCSV={handleExportCSV}
        isRefreshing={dashboardQuery.isRefetching}
        lastUpdated={lastUpdated}
      />

      {/* KPI Stats Grid */}
      <AnalyticsCards data={dashboardData} />

      {/* Interactive Performance & Growth Charts section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ViewsChart
          data={viewsQuery.data}
          isLoading={viewsQuery.isLoading}
          isError={viewsQuery.isError}
          onRetry={() => viewsQuery.refetch()}
        />
        <SubscriberChart
          data={subscribersQuery.data}
          isLoading={subscribersQuery.isLoading}
          isError={subscribersQuery.isError}
          onRetry={() => subscribersQuery.refetch()}
        />
      </div>

      {/* Expanded Full-Width Watch Time & Retention Section */}
      <WatchTimeCard
        data={watchTimeQuery.data}
        isLoading={watchTimeQuery.isLoading}
        isError={watchTimeQuery.isError}
        onRetry={() => watchTimeQuery.refetch()}
      />

      {/* Expanded Full-Width Top Performing Streams Rankings Section */}
      <TopVideosTable
        data={topVideosQuery.data}
        isLoading={topVideosQuery.isLoading}
        isError={topVideosQuery.isError}
        onRetry={() => topVideosQuery.refetch()}
      />
    </main>
  );
};

export default AnalyticsPage;
