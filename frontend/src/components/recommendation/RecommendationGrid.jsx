import React from "react";
import { RecommendationCard } from "./RecommendationCard";
import { RecommendationSkeleton } from "./RecommendationSkeleton";
import { ErrorState } from "../ui/ErrorState";
import { RecommendationEmpty } from "./RecommendationEmpty";

/**
 * A responsive grid component that manages layout of recommendations.
 * Accepts items + loading + error + empty states.
 */
export const RecommendationGrid = ({
  items = [],
  loading = false,
  error = null,
  onRetry,
  layout = "grid",
  skeletonCount = 6,
}) => {
  if (error) {
    return (
      <div className="py-8">
        <ErrorState 
          title="Recommendation Retrieval Error"
          description={error?.message || "Failed to fetch recommendation feed. Please check your internet connection."}
          onRetry={onRetry} 
        />
      </div>
    );
  }

  const hasItems = items && items.length > 0;

  if (!hasItems && !loading) {
    return <RecommendationEmpty />;
  }

  return (
    <div className="w-full">
      <div 
        className={
          layout === "list" 
            ? "flex flex-col gap-4" 
            : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full"
        }
      >
        {items.map((video) => (
          <RecommendationCard 
            key={video._id} 
            video={video} 
            layout={layout} 
          />
        ))}

        {loading && (
          Array.from({ length: skeletonCount }).map((_, index) => (
            <RecommendationSkeleton 
              key={`skeleton-${index}`} 
              layout={layout} 
            />
          ))
        )}
      </div>
    </div>
  );
};

export default RecommendationGrid;
