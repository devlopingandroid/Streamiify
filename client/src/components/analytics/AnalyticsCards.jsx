import React, { memo } from "react";
import {
  Eye,
  Clock,
  Users,
  ThumbsUp,
  MessageSquare,
  Timer,
  CheckCircle,
  TrendingUp,
} from "lucide-react";
import { AnalyticsCard } from "./AnalyticsCard";

export const AnalyticsCards = memo(({ data }) => {
  // Safe extraction helper supporting camelCase, snake_case, and object structures
  const getMetricData = (key) => {
    const defaultVal = { value: 0, trend: 0 };
    if (!data) return defaultVal;

    // Direct object structure (e.g., { value, trend })
    const targetObj = data[key] || data[key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)];
    if (targetObj && typeof targetObj === "object") {
      return {
        value: targetObj.value !== undefined ? targetObj.value : 0,
        trend: targetObj.trend !== undefined ? targetObj.trend : 0,
      };
    }

    // Direct scalar fallbacks
    const value = data[key] !== undefined ? data[key] : (data[key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)] || 0);
    const trend = data[`${key}Trend`] || data[`${key}_trend`] || 0;
    
    return { value, trend };
  };

  // 8 KPIs mapping configuration
  const cardConfigs = [
    {
      id: "views",
      title: "Total Views",
      icon: Eye,
      gradientAccent: "from-cyan-500/10 to-blue-500/10",
      iconBg: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
      ...getMetricData("views"),
    },
    {
      id: "watchTime",
      title: "Total Watch Time",
      icon: Clock,
      gradientAccent: "from-indigo-500/10 to-blue-500/10",
      iconBg: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
      ...getMetricData("watchTime"),
    },
    {
      id: "subscribers",
      title: "Subscribers",
      icon: Users,
      gradientAccent: "from-violet-500/10 to-indigo-500/10",
      iconBg: "bg-violet-500/10 text-violet-400 border-violet-500/20",
      ...getMetricData("subscribers"),
    },
    {
      id: "likes",
      title: "Total Likes",
      icon: ThumbsUp,
      gradientAccent: "from-pink-500/10 to-rose-500/10",
      iconBg: "bg-pink-500/10 text-pink-400 border-pink-500/20",
      ...getMetricData("likes"),
    },
    {
      id: "comments",
      title: "Comments",
      icon: MessageSquare,
      gradientAccent: "from-emerald-500/10 to-teal-500/10",
      iconBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      ...getMetricData("comments"),
    },
    {
      id: "averageWatchDuration",
      title: "Avg Watch Duration",
      icon: Timer,
      gradientAccent: "from-amber-500/10 to-orange-500/10",
      iconBg: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      ...getMetricData("averageWatchDuration"),
    },
    {
      id: "completionRate",
      title: "Completion Rate",
      icon: CheckCircle,
      gradientAccent: "from-teal-500/10 to-cyan-500/10",
      iconBg: "bg-teal-500/10 text-teal-400 border-teal-500/20",
      ...getMetricData("completionRate"),
    },
    {
      id: "engagementRate",
      title: "Engagement Rate",
      icon: TrendingUp,
      gradientAccent: "from-fuchsia-500/10 to-pink-500/10",
      iconBg: "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20",
      ...getMetricData("engagementRate"),
    },
  ];

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6" aria-label="Creator analytics overview counters">
      {cardConfigs.map((config) => (
        <AnalyticsCard
          key={config.id}
          title={config.title}
          value={config.value}
          trend={config.trend}
          icon={config.icon}
          gradientAccent={config.gradientAccent}
          iconBg={config.iconBg}
        />
      ))}
    </section>
  );
});

AnalyticsCards.displayName = "AnalyticsCards";

export default AnalyticsCards;
