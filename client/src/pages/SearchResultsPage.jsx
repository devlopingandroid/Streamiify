import React, { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useSearch } from "../hooks/useUserFeatures";
import { VideoGrid } from "../components/video/VideoGrid";
import { VideoCard } from "../components/video/VideoCard";
import { VideoCardSkeleton } from "../components/video/VideoCardSkeleton";
import { SortDropdown } from "../components/video/SortDropdown";
import { ViewToggle } from "../components/video/ViewToggle";
import { EmptyState } from "../components/ui/EmptyState";
import { ErrorState } from "../components/ui/ErrorState";

export const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  const [layout, setLayout] = useState("grid");
  const [sortBy, setSortBy] = useState("relevance");

  const { data: rawVideos, isLoading, error, refetch } = useSearch(query);

  const sortedVideos = useMemo(() => {
    if (!rawVideos || !Array.isArray(rawVideos)) return [];
    const list = [...rawVideos];
    if (sortBy === "date") {
      return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    if (sortBy === "views") {
      return list.sort((a, b) => (b.views || 0) - (a.views || 0));
    }
    return list;
  }, [rawVideos, sortBy]);

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 flex flex-col gap-6 animate-fade-in">
        <div className="flex flex-col gap-2">
          <div className="h-5 w-48 bg-slate-200 animate-pulse rounded-md" />
          <div className="h-3 w-32 bg-slate-200 animate-pulse rounded-md" />
        </div>
        <VideoGrid className={layout === "list" ? "grid-cols-1!" : ""}>
          {Array.from({ length: 6 }).map((_, idx) => (
            <VideoCardSkeleton key={`search-skel-${idx}`} layout={layout} />
          ))}
        </VideoGrid>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-6">
        <ErrorState
          title="Network error"
          description="Failed to fetch search results from server. Please check your connection and try again."
          onRetry={refetch}
          retryLabel="Try again"
        />
      </div>
    );
  }

  const hasResults = sortedVideos.length > 0;

  return (
    <div className="p-4 md:p-6 flex flex-col gap-6 text-[#0F172A] select-none animate-fade-in">
      {/* Top Filter Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[#E2E8F0]">
        <div>
          <h1 className="text-base font-bold text-[#0F172A]">
            {query ? (
              <>
                Search results for <span className="text-blue-600 font-semibold">"{query}"</span>
              </>
            ) : (
              "All Videos"
            )}
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5 font-medium">
            {sortedVideos.length} {sortedVideos.length === 1 ? "video" : "videos"} found
          </p>
        </div>

        {hasResults && (
          <div className="flex items-center gap-3">
            <SortDropdown
              value={sortBy}
              onChange={setSortBy}
              options={[
                { value: "relevance", label: "Relevance" },
                { value: "date", label: "Upload Date" },
                { value: "views", label: "Views" },
              ]}
            />
            <ViewToggle layout={layout} onChange={setLayout} />
          </div>
        )}
      </div>

      {!hasResults ? (
        <EmptyState
          title="No videos found"
          description={
            query
              ? `No videos found matching "${query}". Try searching with different keywords.`
              : "No videos available. Try typing a query in the search bar above."
          }
        />
      ) : (
        <VideoGrid className={layout === "list" ? "grid-cols-1!" : ""}>
          {sortedVideos.map((video, idx) => (
            <VideoCard key={video._id || video.id || `search-vid-${idx}`} video={video} layout={layout} />
          ))}
        </VideoGrid>
      )}
    </div>
  );
};
export default SearchResultsPage;

