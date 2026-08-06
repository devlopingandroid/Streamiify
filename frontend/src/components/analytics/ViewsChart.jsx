import React, { memo } from "react";
import {
  AreaChart,
  Area,
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
          Views:{" "}
          <span className="text-slate-900 dark:text-slate-100 font-mono">
            {payload[0].value.toLocaleString()}
          </span>
        </p>
      </div>
    );
  }
  return null;
};

export const ViewsChart = memo(({
  data,
  isLoading = false,
  isError = false,
  onRetry,
}) => {
  const chartData = Array.isArray(data)
    ? data
    : Array.isArray(data?.data)
    ? data.data
    : [];

  const isEmpty = chartData.length === 0;

  return (
    <ChartContainer
      title="View Performance"
      subtitle="Total video views generated over the selected interval"
      isLoading={isLoading}
      isError={isError}
      isEmpty={isEmpty}
      onRetry={onRetry}
    >
      <div className="w-full h-full" role="img" aria-label="Views area chart graph">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.02} />
              </linearGradient>
            </defs>

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

            <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(6, 182, 212, 0.2)", strokeWidth: 1 }} />

            <Legend
              verticalAlign="top"
              height={36}
              iconType="circle"
              iconSize={8}
              wrapperStyle={{
                fontSize: "11px",
                color: "#64748b",
                paddingBottom: "10px",
              }}
            />

            <Area
              name="Views"
              type="monotone"
              dataKey={(item) => item.views !== undefined ? item.views : (item.value || 0)}
              stroke="#06b6d4"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#viewsGradient)"
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ChartContainer>
  );
});

ViewsChart.displayName = "ViewsChart";

export default ViewsChart;
