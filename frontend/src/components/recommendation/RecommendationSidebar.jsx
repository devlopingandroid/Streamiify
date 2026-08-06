import React from "react";
import { RecommendationCard } from "./RecommendationCard";
import { RecommendationSkeleton } from "./RecommendationSkeleton";
import { ErrorState } from "../ui/ErrorState";

/**
 * A vertical list variant card wrapper used for recommendation sidebar on Watch Page.
 */
export const RecommendationSidebar = ({
  items = [],
  loading = false,
  error = null,
  onRetry,
  skeletonCount = 4,
}) => {
  if (error) {
    return (
      <ErrorState 
        title="Playback Suggestions Failed"
        description="Could not load up-next suggestions."
        onRetry={onRetry} 
      />
    );
  }

  const hasItems = items && items.length > 0;

  if (!hasItems && !loading) {
    return (
      <span className="text-2xs text-slate-500 italic block py-2 select-none">
        No alternative suggestions.
      </span>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {items.map((video) => (
        <RecommendationCard 
          key={video._id} 
          video={video} 
          layout="list" 
        />
      ))}

      {loading && (
        Array.from({ length: skeletonCount }).map((_, index) => (
          <RecommendationSkeleton 
            key={`sidebar-skeleton-${index}`} 
            layout="list" 
          />
        ))
      )}
    </div>
  );
};

export default RecommendationSidebar;
