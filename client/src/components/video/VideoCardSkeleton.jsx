import React from "react";
import { Skeleton } from "../ui/Skeleton";

export const VideoCardSkeleton = ({ layout = "grid" }) => {
  return (
    <div 
      className={`flex overflow-hidden rounded-xl border border-transparent bg-slate-900/10 w-full ${
        layout === "list" ? "flex-col sm:flex-row gap-4 p-3" : "flex-col gap-2"
      }`}
    >
      {/* Thumbnail Skeleton */}
      <Skeleton 
        variant="rect" 
        className={`aspect-video w-full ${
          layout === "list" ? "sm:w-[240px] flex-shrink-0" : ""
        }`} 
      />
      
      {/* Info Details Skeleton */}
      <div className={`flex gap-3 p-3 ${layout === "list" ? "sm:p-0 flex-grow" : ""}`}>
        {layout === "grid" && (
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
export default VideoCardSkeleton;
