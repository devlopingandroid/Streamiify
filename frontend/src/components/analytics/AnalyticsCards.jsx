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
  const getMetricData = (key) => {
    const defaultVal = { value: 0, trend: 0 };
    if (!data) return defaultVal;

    const targetObj = data[key] || data[key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)];
    if (targetObj && typeof targetObj === "object") {
      return {
        value: targetObj.value !== undefined ? targetObj.value : 0,
        trend: targetObj.trend !== undefined ? targetObj.trend : 0,
      };
    }

    const value = data[key] !== undefined ? data[key] : (data[key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)] || 0);
    const trend = data[`${key}Trend`] || data[`${key}_trend`] || 0;
    
    return { value, trend };
  };

  const cardConfigs = [
    {
      id: "views",
      title: "Total Views",
      icon: Eye,
      gradientAccent: "from-cyan-500/10 to-blue-500/10",
      iconBg: "bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800/40",
      ...getMetricData("views"),
    },
    {
      id: "watchTime",
      title: "Total Watch Time",
      icon: Clock,
      gradientAccent: "from-indigo-500/10 to-blue-500/10",
      iconBg: "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/40",
      ...getMetricData("watchTime"),
    },
    {
      id: "subscribers",
      title: "Subscribers",
      icon: Users,
      gradientAccent: "from-violet-500/10 to-indigo-500/10",
      iconBg: "bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 border-violet-200 dark:border-violet-800/40",
      ...getMetricData("subscribers"),
    },
    {
      id: "likes",
      title: "Total Likes",
      icon: ThumbsUp,
      gradientAccent: "from-pink-500/10 to-rose-500/10",
      iconBg: "bg-pink-50 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400 border-pink-200 dark:border-pink-800/40",
      ...getMetricData("likes"),
    },
    {
      id: "comments",
      title: "Comments",
      icon: MessageSquare,
      gradientAccent: "from-emerald-500/10 to-teal-500/10",
      iconBg: "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40",
      ...getMetricData("comments"),
    },
    {
      id: "averageWatchDuration",
      title: "Avg Watch Duration",
      icon: Timer,
      gradientAccent: "from-amber-500/10 to-orange-500/10",
      iconBg: "bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/40",
      ...getMetricData("averageWatchDuration"),
    },
    {
      id: "completionRate",
      title: "Completion Rate",
      icon: CheckCircle,
      gradientAccent: "from-teal-500/10 to-cyan-500/10",
      iconBg: "bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-800/40",
      ...getMetricData("completionRate"),
    },
    {
      id: "engagementRate",
      title: "Engagement Rate",
      icon: TrendingUp,
      gradientAccent: "from-fuchsia-500/10 to-pink-500/10",
      iconBg: "bg-fuchsia-50 dark:bg-fuchsia-950/60 text-fuchsia-600 dark:text-fuchsia-400 border-fuchsia-200 dark:border-fuchsia-800/40",
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
