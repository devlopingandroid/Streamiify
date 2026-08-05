import React, { useState } from "react";
import { useWatchLater } from "../hooks/useUserFeatures";
import { VideoGrid } from "../components/video/VideoGrid";
import { VideoCard } from "../components/video/VideoCard";
import { VideoCardSkeleton } from "../components/video/VideoCardSkeleton";
import { SortDropdown } from "../components/video/SortDropdown";
import { ViewToggle } from "../components/video/ViewToggle";
import { EmptyState } from "../components/ui/EmptyState";
import { ErrorState } from "../components/ui/ErrorState";
import { Bookmark, Trash2 } from "lucide-react";

export const WatchLaterPage = () => {
  const { data: watchLaterVideos, isLoading, error, refetch, toggleWatchLater } = useWatchLater();

  const [layout, setLayout] = useState("grid");
  const [sortBy, setSortBy] = useState("recent");

  const displayVideos = watchLaterVideos || [];

  const handleRemove = (videoId) => {
    toggleWatchLater(videoId);
  };

  if (isLoading) {
    return (
      <div className="p-6 md:p-8 flex flex-col gap-6">
        <div className="h-6 w-48 bg-slate-800 animate-pulse rounded" />
        <VideoGrid className={layout === "list" ? "grid-cols-1!" : ""}>
          {Array.from({ length: 3 }).map((_, idx) => (
            <VideoCardSkeleton key={`wl-skel-${idx}`} layout={layout} />
          ))}
        </VideoGrid>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 md:p-8">
        <ErrorState 
          title="Watch Later Handshake Failure"
          description="We had trouble retrieving your Watch Later bookmarks library."
          onRetry={refetch}
        />
      </div>
    );
  }

  const hasVideos = displayVideos && displayVideos.length > 0;

  return (
    <div className="p-6 md:p-8 flex flex-col gap-6 text-slate-100 select-none animate-fade-in">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-800/60">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Bookmark size={20} className="text-slate-400" />
            <span>Watch Later</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Videos you have saved to watch at a subsequent time.</p>
        </div>

        {hasVideos && (
          <div className="flex items-center gap-3">
            <SortDropdown
              value={sortBy}
              onChange={setSortBy}
              options={[
                { value: "recent", label: "Date Added" },
                { value: "views", label: "Views" },
              ]}
            />
            <ViewToggle layout={layout} onChange={setLayout} />
          </div>
        )}
      </div>

      {!hasVideos ? (
        <EmptyState 
          title="No Saved Videos"
          description="Click the Save button on any stream to add videos here."
        />
      ) : (
        <VideoGrid className={layout === "list" ? "grid-cols-1!" : ""}>
          {displayVideos.map((video) => (
            <div key={video._id} className="relative group/item">
              <VideoCard video={video} layout={layout} />
              <button 
                onClick={() => handleRemove(video._id)}
                className="absolute right-4 top-4 w-7 h-7 rounded-full bg-slate-950/80 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-red-400 opacity-0 group-hover/item:opacity-100 transition-opacity duration-200 cursor-pointer"
                title="Remove from Watch Later"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </VideoGrid>
      )}

    </div>
  );
};
export default WatchLaterPage;
