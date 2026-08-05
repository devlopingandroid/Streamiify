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
      <div className="glassmorphism p-3 rounded-xl border border-slate-800/80 text-xs shadow-2xl select-none">
        <p className="font-semibold text-slate-400 mb-1">{label}</p>
        <p className="text-xs font-bold text-brand-cyan">
          Watch Time:{" "}
          <span className="text-slate-100 font-mono">
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
  // Normalize response payload (handle wrapped or flat formats)
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

  // Circular progress dimensions
  const radius = 28;
  const strokeWidth = 5;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(completionRate, 100) / 100) * circumference;

  const isEmpty = chartData.length === 0 && !totalWatchTime;

  return (
    <ChartContainer
      title="Watch Time & Retention"
      subtitle="Audience watch duration and completed stream ratios"
      isLoading={isLoading}
      isError={isError}
      isEmpty={isEmpty}
      onRetry={onRetry}
      className="lg:col-span-2 min-h-[420px]"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full items-stretch">
        {/* Bar Chart Section */}
        <div className="lg:col-span-2 min-h-[220px]" role="img" aria-label="Watch time bar chart graph">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#334155"
                opacity={0.15}
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
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255, 255, 255, 0.03)" }} />
              <Legend
                verticalAlign="top"
                height={30}
                iconType="circle"
                iconSize={8}
                wrapperStyle={{
                  fontSize: "11px",
                  color: "#94a3b8",
                  paddingBottom: "10px",
                }}
              />
              <Bar
                name="Hours Watched"
                dataKey={(item) => item.watchTime !== undefined ? item.watchTime : (item.value || 0)}
                fill="#06b6d4"
                radius={[4, 4, 0, 0]}
                animationDuration={1500}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Audience Retention Stats Sidebar */}
        <div className="border-t lg:border-t-0 lg:border-l border-slate-800/80 pt-6 lg:pt-0 lg:pl-6 flex flex-col justify-between gap-4 select-none">
          {/* Key summaries */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-900/40 p-2.5 rounded-xl border border-slate-800/60 text-center">
              <p className="text-[10px] text-slate-500 font-semibold uppercase">Total Watch</p>
              <p className="text-sm font-bold text-slate-200 mt-1 font-mono">
                {totalWatchTime.toLocaleString()} hrs
              </p>
            </div>
            <div className="bg-slate-900/40 p-2.5 rounded-xl border border-slate-800/60 text-center">
              <p className="text-[10px] text-slate-500 font-semibold uppercase">Avg Duration</p>
              <p className="text-sm font-bold text-slate-200 mt-1 font-mono">{averageDuration}</p>
            </div>
          </div>

          {/* Circular Progress Ring */}
          <div className="flex items-center gap-4 bg-slate-900/30 p-3 rounded-xl border border-slate-800/50">
            <div className="relative w-16 h-16 flex-shrink-0" aria-label={`Completion rate: ${completionRate}%`}>
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 64 64">
                {/* Background Ring */}
                <circle
                  className="text-slate-800"
                  strokeWidth={strokeWidth}
                  stroke="currentColor"
                  fill="transparent"
                  r={radius}
                  cx="32"
                  cy="32"
                />
                {/* Colored Progress Arc */}
                <circle
                  className="text-brand-cyan transition-all duration-1000 ease-out"
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r={radius}
                  cx="32"
                  cy="32"
                />
              </svg>
              {/* Central Text */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[11px] font-bold text-slate-200 font-mono">
                  {completionRate.toFixed(0)}%
                </span>
              </div>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-slate-300">Completion Rate</h4>
              <p className="text-[9px] text-slate-500 leading-normal mt-0.5">
                Ratio of viewers who watched streams to completion.
              </p>
            </div>
          </div>

          {/* Horizontal Progress Bars */}
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-[10px] font-medium text-slate-400 mb-1">
                <span>Completed Views</span>
                <span className="font-mono text-slate-300">
                  {completedViews.toLocaleString()} ({completedPercentage.toFixed(0)}%)
                </span>
              </div>
              <div className="h-2 w-full bg-slate-850 rounded-full overflow-hidden border border-slate-800/40">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${completedPercentage}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[10px] font-medium text-slate-400 mb-1">
                <span>Incomplete Views</span>
                <span className="font-mono text-slate-300">
                  {incompleteViews.toLocaleString()} ({incompletePercentage.toFixed(0)}%)
                </span>
              </div>
              <div className="h-2 w-full bg-slate-850 rounded-full overflow-hidden border border-slate-800/40">
                <div
                  className="h-full bg-rose-500/80 rounded-full transition-all duration-1000 ease-out"
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
