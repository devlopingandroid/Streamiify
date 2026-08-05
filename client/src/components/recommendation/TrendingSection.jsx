import React, { useEffect, useRef } from "react";
import { useTrending } from "../../hooks/useRecommendations";
import { RecommendationGrid } from "./RecommendationGrid";

/**
 * TrendingSection manages fetching and infinite scrolling for trending feeds.
 */
export const TrendingSection = () => {
  const {
    data,
    isLoading,
    isError,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    refetch,
  } = useTrending(12);

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
    data?.pages?.flatMap((page) => {
      console.log("Each Page =", page);
      return page.results || page.data?.results || [];
    }) || [];

  console.log("Trending Data =", data);
  console.log("Trending Items =", items);

  console.log("Trending Data =", data);
  console.log("Trending Items =", items);
  console.log("Trending API =", data);
  console.log("Trending Items =", items);

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
          {isFetchingNextPage && "Loading more trending videos..."}
        </div>
      )}
    </div>
  );
};

export default TrendingSection;
