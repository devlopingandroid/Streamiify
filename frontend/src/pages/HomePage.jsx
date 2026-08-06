import React from "react";
import { useTrendingVideos } from "../hooks/useVideos";
import { useContinueWatching } from "../hooks/useUserFeatures";
import { VideoGrid } from "../components/video/VideoGrid";
import { VideoCard } from "../components/video/VideoCard";
import { VideoCardSkeleton } from "../components/video/VideoCardSkeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { ErrorState } from "../components/ui/ErrorState";
import { useHomeRecommendations } from "../hooks/useRecommendations";
import { RecommendationGrid } from "../components/recommendation/RecommendationGrid";

export const HomePage = () => {
  const {
    data: recommendedData,
    isLoading: recommendedLoading,
    isError: recommendedError,
    error: recommendedErrObj,
    refetch: refetchRecommended,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useHomeRecommendations(12);

  const {
    data: trending,
    isLoading: trendingLoading,
    error: trendingError,
    refetch: refetchTrending,
  } = useTrendingVideos();

  const { data: continueWatching } = useContinueWatching();

  const observerTarget = React.useRef(null);

  React.useEffect(() => {
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

  const handleRetryAll = () => {
    refetchRecommended();
    refetchTrending();
  };

  if (trendingError) {
    return (
      <div className="p-6 md:p-12">
        <ErrorState
          title="Playback Server Connection Error"
          description="We had trouble establishing a handshake with the video distribution layers."
          onRetry={handleRetryAll}
        />
      </div>
    );
  }

  const recommendedVideos =
    recommendedData?.pages?.flatMap((page) => {
      if (!page) return [];
      if (Array.isArray(page.results)) return page.results;
      if (Array.isArray(page.docs)) return page.docs;
      if (Array.isArray(page.videos)) return page.videos;
      return [];
    }) ?? [];

  return (
    <div className="p-4 sm:p-6 md:p-8 flex flex-col gap-10 select-none animate-fade-in">

      {/* Continue Watching Section */}
      {continueWatching && continueWatching.length > 0 && (
        <section>
          <h2 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-5 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
            <span>Continue Watching</span>
          </h2>
          <VideoGrid>
            {continueWatching.map((video) => (
              <VideoCard key={`cw-${video._id}`} video={video} />
            ))}
          </VideoGrid>
        </section>
      )}

      {/* Recommended Section */}
      <section>
        <h2 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-5 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
          <span>Recommended Videos</span>
        </h2>
        <RecommendationGrid
          items={recommendedVideos}
          loading={recommendedLoading || isFetchingNextPage}
          error={recommendedError ? recommendedErrObj : null}
          onRetry={refetchRecommended}
          skeletonCount={8}
        />

        {/* Scroll anchor target for infinite loading */}
        {hasNextPage && (
          <div
            ref={observerTarget}
            className="h-10 w-full flex items-center justify-center text-xs text-slate-500 font-medium mt-4"
          >
            {isFetchingNextPage && "Loading more recommendations..."}
          </div>
        )}
      </section>

      {/* Trending Section */}
      <section className="border-t border-slate-200 dark:border-slate-800/80 pt-10">
        <h2 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-5 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
          <span>Trending Videos</span>
        </h2>
        {trendingLoading ? (
          <VideoGrid>
            {Array.from({ length: 4 }).map((_, idx) => (
              <VideoCardSkeleton key={`trend-skel-${idx}`} />
            ))}
          </VideoGrid>
        ) : !trending || trending.length === 0 ? (
          <EmptyState
            title="No Trending Videos"
            description="Views metrics are required to calculate trends lists."
          />
        ) : (
          <VideoGrid>
            {trending.map((video) => (
              <VideoCard key={video._id} video={video} />
            ))}
          </VideoGrid>
        )}
      </section>

    </div>
  );
};
export default HomePage;
