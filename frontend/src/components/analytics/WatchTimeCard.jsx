import React, { memo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { ChartContainer } from "./ChartContainer";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs shadow-xl select-none">
        <p className="font-bold text-slate-700 dark:text-slate-300 mb-1">{label}</p>
        <p className="text-xs font-bold text-cyan-600 dark:text-cyan-400">
          Watch Time:{" "}
          <span className="text-slate-900 dark:text-slate-100 font-mono">
            {payload[0].value.toLocaleString()} hrs
          </span>
        </p>
      </div>
    );
  }
  return null;
};

export const WatchTimeCard = memo(({
  data,
  isLoading = false,
  isError = false,
  onRetry,
}) => {
  const stats = data?.data || data || {};
  const chartData = Array.isArray(stats.chartData)
    ? stats.chartData
    : Array.isArray(stats.chart_data)
    ? stats.chart_data
    : Array.isArray(data)
    ? data
    : [];

  const totalWatchTime = stats.totalWatchTime !== undefined ? stats.totalWatchTime : (stats.total_watch_time || 0);
  const averageDuration = stats.averageDuration || stats.average_duration || "00:00";
  const completionRate = parseFloat(stats.completionRate || stats.completion_rate || 0);
  const completedViews = parseInt(stats.completedViews !== undefined ? stats.completedViews : (stats.completed_views || 0), 10);
  const incompleteViews = parseInt(stats.incompleteViews !== undefined ? stats.incompleteViews : (stats.incomplete_views || 0), 10);

  const totalViewsForRatio = completedViews + incompleteViews;
  const completedPercentage = totalViewsForRatio > 0 ? (completedViews / totalViewsForRatio) * 100 : 0;
  const incompletePercentage = totalViewsForRatio > 0 ? (incompleteViews / totalViewsForRatio) * 100 : 0;

  const radius = 32;
  const strokeWidth = 6;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(completionRate, 100) / 100) * circumference;

  const isEmpty = chartData.length === 0 && !totalWatchTime;

  return (
    <ChartContainer
      title="Watch Time & Audience Retention"
      subtitle="Audience watch duration and completed stream ratios"
      isLoading={isLoading}
      isError={isError}
      isEmpty={isEmpty}
      onRetry={onRetry}
      className="w-full min-h-[380px]"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full items-stretch">
        {/* Bar Chart Section */}
        <div className="lg:col-span-2 min-h-[260px]" role="img" aria-label="Watch time bar chart graph">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#94a3b8"
                opacity={0.2}
                vertical={false}
              />
              <XAxis
                dataKey={(item) => item.label || item.date || item.day || item.name || ""}
                stroke="#64748b"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis
                stroke="#64748b"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) =>
                  val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val
                }
                dx={-5}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(6, 182, 212, 0.05)" }} />
              <Legend
                verticalAlign="top"
                height={30}
                iconType="circle"
                iconSize={8}
                wrapperStyle={{
                  fontSize: "11px",
                  color: "#64748b",
                  paddingBottom: "10px",
                }}
              />
              <Bar
                name="Hours Watched"
                dataKey={(item) => item.watchTime !== undefined ? item.watchTime : (item.value || 0)}
                fill="#06b6d4"
                radius={[6, 6, 0, 0]}
                animationDuration={1500}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Audience Retention Stats Sidebar */}
        <div className="border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800 pt-6 lg:pt-0 lg:pl-8 flex flex-col justify-between gap-5 select-none">
          {/* Key summaries */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
              <p className="text-[11px] text-slate-600 dark:text-slate-400 font-bold uppercase">Total Watch</p>
              <p className="text-lg font-extrabold text-slate-900 dark:text-slate-100 mt-1 font-mono">
                {totalWatchTime.toLocaleString()} hrs
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
              <p className="text-[11px] text-slate-600 dark:text-slate-400 font-bold uppercase">Avg Duration</p>
              <p className="text-lg font-extrabold text-slate-900 dark:text-slate-100 mt-1 font-mono">{averageDuration}</p>
            </div>
          </div>

          {/* Circular Progress Ring */}
          <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="relative w-18 h-18 flex-shrink-0" aria-label={`Completion rate: ${completionRate}%`}>
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 72 72">
                <circle
                  className="text-slate-200 dark:text-slate-800"
                  strokeWidth={strokeWidth}
                  stroke="currentColor"
                  fill="transparent"
                  r={radius}
                  cx="36"
                  cy="36"
                />
                <circle
                  className="text-cyan-600 dark:text-cyan-400 transition-all duration-1000 ease-out"
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r={radius}
                  cx="36"
                  cy="36"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-extrabold text-slate-900 dark:text-slate-100 font-mono">
                  {completionRate.toFixed(0)}%
                </span>
              </div>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">Completion Rate</h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed mt-0.5">
                Ratio of viewers who watched streams to completion.
              </p>
            </div>
          </div>

          {/* Horizontal Progress Bars */}
          <div className="space-y-3.5">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                <span>Completed Views</span>
                <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                  {completedViews.toLocaleString()} ({completedPercentage.toFixed(0)}%)
                </span>
              </div>
              <div className="h-2.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-300/40 dark:border-slate-700/40">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${completedPercentage}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                <span>Incomplete Views</span>
                <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                  {incompleteViews.toLocaleString()} ({incompletePercentage.toFixed(0)}%)
                </span>
              </div>
              <div className="h-2.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-300/40 dark:border-slate-700/40">
                <div
                  className="h-full bg-rose-500 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${incompletePercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </ChartContainer>
  );
});

WatchTimeCard.displayName = "WatchTimeCard";

export default WatchTimeCard;
