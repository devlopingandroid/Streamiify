import React, { useEffect, useRef } from "react";
import { useSubscriptionFeed } from "../../hooks/useRecommendations";
import { RecommendationGrid } from "./RecommendationGrid";

/**
 * SubscriptionFeedSection manages fetching and infinite scrolling for subscriptions recommendation feeds.
 */
export const SubscriptionFeedSection = () => {
  const {
    data,
    isLoading,
    isError,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    refetch,
  } = useSubscriptionFeed(12);

  const observerTarget = useRef(null);

  useEffect(() => {
    const target = observerTarget.current;
    if (!target || !hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Flatten the documents from each paginated response page
  const items =
    data?.pages?.flatMap((page) => page.results || []) || [];

  return (
    <div className="flex flex-col gap-6">
      <RecommendationGrid
        items={items}
        loading={isLoading || isFetchingNextPage}
        error={isError ? error : null}
        onRetry={refetch}
        skeletonCount={8}
      />

      {/* Scroll anchor target for infinite loading */}
      {hasNextPage && (
        <div
          ref={observerTarget}
          className="h-10 w-full flex items-center justify-center text-xs text-slate-500 font-medium"
        >
          {isFetchingNextPage && "Loading more subscriptions..."}
        </div>
      )}
    </div>
  );
};

export default SubscriptionFeedSection;
