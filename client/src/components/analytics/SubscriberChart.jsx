import React, { memo } from "react";
import {
  LineChart,
  Line,
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
        <p className="text-xs font-bold text-brand-indigo">
          New Subscribers:{" "}
          <span className="text-slate-100 font-mono">
            {payload[0].value.toLocaleString()}
          </span>
        </p>
      </div>
    );
  }
  return null;
};

export const SubscriberChart = memo(({
  data,
  isLoading = false,
  isError = false,
  onRetry,
}) => {
  // Extract and normalize array format from API payload
  const chartData = Array.isArray(data)
    ? data
    : Array.isArray(data?.data)
    ? data.data
    : [];

  const isEmpty = chartData.length === 0;

  return (
    <ChartContainer
      title="Subscriber Growth"
      subtitle="Total new subscribers gained over the selected interval"
      isLoading={isLoading}
      isError={isError}
      isEmpty={isEmpty}
      onRetry={onRetry}
    >
      <div className="w-full h-full" role="img" aria-label="Subscriber line chart graph">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
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

            <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(99, 102, 241, 0.15)", strokeWidth: 1 }} />

            <Legend
              verticalAlign="top"
              height={36}
              iconType="circle"
              iconSize={8}
              wrapperStyle={{
                fontSize: "11px",
                color: "#94a3b8",
                paddingBottom: "10px",
              }}
            />

            <Line
              name="Subscribers Added"
              type="monotone"
              dataKey={(item) =>
                item.subscribers !== undefined
                  ? item.subscribers
                  : item.count !== undefined
                  ? item.count
                  : item.value || 0
              }
              stroke="#6366f1"
              strokeWidth={3}
              activeDot={{ r: 6, strokeWidth: 0, fill: "#06b6d4" }}
              dot={{ r: 2, strokeWidth: 1 }}
              animationDuration={1500}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartContainer>
  );
});

SubscriberChart.displayName = "SubscriberChart";

export default SubscriberChart;
