import React, { memo } from "react";
import { Skeleton } from "../ui/Skeleton";

export const AnalyticsSkeleton = memo(() => {
  return (
    <div className="w-full select-none" aria-hidden="true">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-slate-800/60 mb-6">
        <div className="space-y-2">
          <Skeleton className="h-7 w-[200px]" />
          <Skeleton className="h-3.5 w-[140px]" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-[140px]" />
          <Skeleton className="h-10 w-[90px]" />
          <Skeleton className="h-10 w-[110px]" />
        </div>
      </div>

      {/* KPI Cards Grid Skeleton - 8 elements */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        {Array.from({ length: 8 }).map((_, idx) => (
          <div key={idx} className="glassmorphism p-5 rounded-2xl border border-slate-800/80 flex flex-col gap-3 min-h-[92px]">
            <div className="flex justify-between items-center">
              <Skeleton className="h-3 w-1/3" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
            <div className="flex justify-between items-end mt-1">
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-5 w-[60px] rounded-full" />
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid Skeleton */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-6">
        {/* Views Chart (Area) Skeleton */}
        <div className="glassmorphism rounded-2xl border border-slate-800/80 p-5 min-h-[360px] flex flex-col gap-4">
          <div className="flex justify-between">
            <div className="space-y-1.5 w-1/3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>
            <Skeleton className="h-4 w-12" />
          </div>
          <Skeleton className="flex-grow w-full rounded-xl" />
        </div>

        {/* Subscriber Chart (Line) Skeleton */}
        <div className="glassmorphism rounded-2xl border border-slate-800/80 p-5 min-h-[360px] flex flex-col gap-4">
          <div className="flex justify-between">
            <div className="space-y-1.5 w-1/3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>
            <Skeleton className="h-4 w-12" />
          </div>
          <Skeleton className="flex-grow w-full rounded-xl" />
        </div>
      </div>

      {/* Watch Retention & Top Videos Skeleton */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Watch Time Section (Bar + Ring) - 2 columns */}
        <div className="glassmorphism rounded-2xl border border-slate-800/80 p-5 min-h-[420px] flex flex-col lg:col-span-2 gap-4">
          <div className="space-y-1.5 w-1/2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-3/4" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-grow">
            <Skeleton className="md:col-span-2 h-full rounded-xl" />
            <div className="flex flex-col gap-4 justify-between h-full">
              <div className="grid grid-cols-2 gap-2">
                <Skeleton className="h-10 rounded-xl" />
                <Skeleton className="h-10 rounded-xl" />
              </div>
              <Skeleton className="h-[76px] rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-2 w-full" />
                <Skeleton className="h-2 w-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Top Videos Table - 3 columns */}
        <div className="glassmorphism rounded-2xl border border-slate-800/80 p-5 min-h-[420px] flex flex-col lg:col-span-3 gap-4">
          <div className="space-y-1.5 w-1/3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-3/4" />
          </div>
          <div className="space-y-3 flex-grow">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="flex gap-4 items-center justify-between py-2.5">
                <div className="flex gap-3 items-center w-1/3">
                  <Skeleton className="h-10 w-16 rounded-lg flex-shrink-0" />
                  <Skeleton className="h-3 w-full" />
                </div>
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-3 w-12" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

AnalyticsSkeleton.displayName = "AnalyticsSkeleton";

export default AnalyticsSkeleton;
