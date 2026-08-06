import React from "react";
import { Skeleton } from "../ui/Skeleton";

/**
 * Skeleton loader component for RecommendationCard.
 * Reuses existing Skeleton component.
 */
export const RecommendationSkeleton = ({ layout = "grid" }) => {
  const isList = layout === "list";

  return (
    <div 
      className={`flex overflow-hidden rounded-xl border border-transparent bg-slate-900/10 w-full ${
        isList ? "flex-col sm:flex-row gap-4 p-3" : "flex-col gap-2"
      }`}
    >
      {/* Thumbnail Skeleton */}
      <Skeleton 
        variant="rect" 
        className={`aspect-video w-full ${
          isList ? "sm:w-[240px] flex-shrink-0" : ""
        }`} 
      />
      
      {/* Info Details Skeleton */}
      <div className={`flex gap-3 p-3 ${isList ? "sm:p-0 flex-grow" : ""}`}>
        {!isList && (
          <Skeleton variant="circle" className="w-8 h-8 flex-shrink-0" />
        )}
        
        <div className="flex flex-col gap-2 flex-grow">
          <Skeleton variant="text" className="w-[85%] h-3.5" />
          <Skeleton variant="text" className="w-[45%] h-2.5" />
          <Skeleton variant="text" className="w-[60%] h-2.5" />
        </div>
      </div>
    </div>
  );
};

export default RecommendationSkeleton;
